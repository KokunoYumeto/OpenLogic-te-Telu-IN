$ErrorActionPreference = 'Stop'
if (-not $IsWindows) { throw 'This guarded builder requires Windows PowerShell 7.4+.' }

$repoPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$buildPath = Join-Path $repoPath 'tmp\pdfs\cumulative-279'
$outputPath = Join-Path $repoPath 'output\pdf'
$null = New-Item -ItemType Directory -Path $buildPath -Force
$null = New-Item -ItemType Directory -Path $outputPath -Force

$xe = Get-Command xelatex.exe -ErrorAction SilentlyContinue
$bib = Get-Command bibtex.exe -ErrorAction SilentlyContinue
$xePath = if ($xe) { $xe.Source } else { Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs\MiKTeX\miktex\bin\x64\xelatex.exe' }
$bibPath = if ($bib) { $bib.Source } else { Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs\MiKTeX\miktex\bin\x64\bibtex.exe' }
if (-not (Test-Path -LiteralPath $xePath)) { throw 'XeLaTeX is not installed or on PATH.' }
if (-not (Test-Path -LiteralPath $bibPath)) { throw 'BibTeX is not installed or on PATH.' }

$mutex = [Threading.Mutex]::new($false, 'Global\InterlanguageTeXSlotV1')
$held = $false
$receipt = [ordered]@{
    schema = 'openlogic-te-cumulative-pdf-build/1'
    started_utc = [DateTime]::UtcNow.ToString('o')
    mutex = 'Global\InterlanguageTeXSlotV1'
    timeout_ms = 30000
    acquired = $false
    abandoned_recovery = $false
    commands = @()
    pdf_pass_hashes = @()
    status = 'not_started'
}

function Invoke-CapturedProcess {
    param([string]$FilePath, [string[]]$Arguments, [string]$Name, [string]$WorkingDirectory)
    $stdout = Join-Path $buildPath "$Name.stdout.log"
    $stderr = Join-Path $buildPath "$Name.stderr.log"
    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -Environment @{ SOURCE_DATE_EPOCH = '1789862400'; FORCE_SOURCE_DATE = '1' } -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait
    $profilePath = [Environment]::GetFolderPath('UserProfile')
    foreach ($logFile in @($stdout, $stderr)) {
        if (Test-Path -LiteralPath $logFile) {
            $safeLog = [IO.File]::ReadAllText($logFile).Replace($profilePath, '<USERPROFILE>').Replace($profilePath.Replace('\', '/'), '<USERPROFILE>')
            [IO.File]::WriteAllText($logFile, $safeLog, [Text.UTF8Encoding]::new($false))
        }
    }
    $receipt.commands += [ordered]@{ name = $Name; exit_code = $process.ExitCode }
    if ($process.ExitCode -ne 0) { $receipt.status = 'process_failed'; throw "$Name failed with exit code $($process.ExitCode)." }
}

try {
    try { $held = $mutex.WaitOne(30000) }
    catch [Threading.AbandonedMutexException] { $held = $true; $receipt.abandoned_recovery = $true }
    $receipt.acquired = $held
    if (-not $held) { $receipt.status = 'slot_busy'; throw 'TeX slot occupied; no process launched.' }

    $prepareStdout = Join-Path $buildPath 'prepare.stdout.log'
    $prepareStderr = Join-Path $buildPath 'prepare.stderr.log'
    $node = Get-Command node.exe -ErrorAction Stop
    $prepare = Start-Process -FilePath $node.Source -ArgumentList @('scripts/prepare-cumulative-279.mjs') -WorkingDirectory $repoPath -WindowStyle Hidden -RedirectStandardOutput $prepareStdout -RedirectStandardError $prepareStderr -PassThru -Wait
    $receipt.commands += [ordered]@{ name = 'prepare-render-tree'; exit_code = $prepare.ExitCode }
    if ($prepare.ExitCode -ne 0) { $receipt.status = 'prepare_failed'; throw 'Render-tree preparation failed.' }

    $texArgs = @('--disable-installer', '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-file-line-error', '-recorder', "-output-directory=$buildPath", 'editions/cumulative-279.tex')
    Invoke-CapturedProcess -FilePath $xePath -Arguments $texArgs -Name 'xelatex-1' -WorkingDirectory $repoPath
    Invoke-CapturedProcess -FilePath $bibPath -Arguments @((Join-Path $buildPath 'cumulative-279')) -Name 'bibtex' -WorkingDirectory $repoPath
    $pdfPath = Join-Path $buildPath 'cumulative-279.pdf'
    $previousHash = $null
    $finalHash = $null
    $convergedPass = $null
    $maximumPasses = 6
    for ($pass = 2; $pass -le $maximumPasses; $pass++) {
        Invoke-CapturedProcess -FilePath $xePath -Arguments $texArgs -Name "xelatex-$pass" -WorkingDirectory $repoPath
        $finalHash = (Get-FileHash -LiteralPath $pdfPath).Hash.ToLowerInvariant()
        $receipt.pdf_pass_hashes += [ordered]@{ pass = $pass; sha256 = $finalHash }
        if ($null -ne $previousHash -and $previousHash -eq $finalHash) {
            $convergedPass = $pass
            break
        }
        $previousHash = $finalHash
    }

    $texLogPath = Join-Path $buildPath 'cumulative-279.log'
    $profilePath = [Environment]::GetFolderPath('UserProfile')
    $safeTexLog = [IO.File]::ReadAllText($texLogPath).Replace($profilePath, '<USERPROFILE>').Replace($profilePath.Replace('\', '/'), '<USERPROFILE>')
    [IO.File]::WriteAllText($texLogPath, $safeTexLog, [Text.UTF8Encoding]::new($false))
    $receipt.missing_characters = @([regex]::Matches($safeTexLog, 'Missing character:[^\r\n]*') | ForEach-Object Value)
    $receipt.overfull_boxes = @([regex]::Matches($safeTexLog, 'Overfull[^\r\n]*') | ForEach-Object Value)
    $receipt.undefined_references = $safeTexLog.Contains('There were undefined references')
    $receipt.undefined_citations = $safeTexLog.Contains('There were undefined citations')
    $receipt.maximum_xelatex_passes = $maximumPasses
    $receipt.converged_xelatex_pass = $convergedPass
    $receipt.reproducible_last_two_passes = ($null -ne $convergedPass)
    $receipt.pdf_sha256 = $finalHash
    $receipt.render_manifest_sha256 = (Get-FileHash -LiteralPath (Join-Path $buildPath 'render-tree\render-manifest.json')).Hash.ToLowerInvariant()
    if ($receipt.missing_characters.Count -or $receipt.undefined_references -or $receipt.undefined_citations -or -not $receipt.reproducible_last_two_passes) {
        $receipt.status = 'qa_failed'
        throw 'Build QA failed.'
    }

    $finalPath = Join-Path $outputPath 'openlogic-te-Telu-IN-cumulative-OLP0279.pdf'
    Copy-Item -LiteralPath (Join-Path $buildPath 'cumulative-279.pdf') -Destination $finalPath -Force
    $receipt.output = [IO.Path]::GetRelativePath($repoPath, $finalPath).Replace('\', '/')
    $receipt.bytes = (Get-Item -LiteralPath $finalPath).Length
    $receipt.status = 'compiled_requires_visual_review'
}
finally {
    $receipt.finished_utc = [DateTime]::UtcNow.ToString('o')
    $receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $buildPath 'build-receipt.json') -Encoding utf8
    if ($held) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}

$receipt | ConvertTo-Json -Depth 8
