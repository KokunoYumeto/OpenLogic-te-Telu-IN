param([switch]$Cold)

$ErrorActionPreference = 'Stop'
if (-not $IsWindows) { throw 'This browser-print builder is configured for the Windows production workspace.' }

$repoPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$htmlPath = Join-Path $repoPath 'output\html\full\index.html'
$manifestPath = Join-Path $repoPath 'output\html\full\render-manifest.json'
$qaPath = Join-Path $repoPath 'evidence\FULL-HTML-QA.json'
$qa = Get-Content -LiteralPath $qaPath -Raw -Encoding utf8 | ConvertFrom-Json
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding utf8 | ConvertFrom-Json -AsHashtable
if ($qa.status -ne 'COMPLETE_PASS' -or $qa.units -ne 722 -or $manifest.profile -ne 'full') {
    throw 'The integrated HTML reader has not passed final QA.'
}
$accepted = @($qa.files | Where-Object { $_.name -eq 'index.html' })
if ($accepted.Count -ne 1) { throw 'The HTML QA receipt has no unique index.html entry.' }
$htmlHash = (Get-FileHash -LiteralPath $htmlPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($htmlHash -ne $manifest.html_sha256 -or $htmlHash -ne $accepted[0].sha256) {
    throw 'Accepted HTML bytes changed.'
}

$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path -LiteralPath $chromePath)) { throw 'Chrome executable is unavailable.' }
$workPath = Join-Path $repoPath 'tmp\pdfs\full'
$outputPath = Join-Path $repoPath 'output\pdf'
$null = New-Item -ItemType Directory -Path $workPath -Force
$null = New-Item -ItemType Directory -Path $outputPath -Force
$suffix = if ($Cold) { '-cold' } else { '' }
$rawPath = Join-Path $workPath "full-raw$suffix.pdf"
$finalPath = Join-Path $outputPath "openlogic-te-Telu-IN-full-OLP0722$suffix.pdf"
$profilePath = Join-Path $workPath "chrome-profile$suffix"
$htmlUri = [Uri]::new($htmlPath).AbsoluteUri
$arguments = @(
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--no-pdf-header-footer',
    "--user-data-dir=$profilePath",
    "--print-to-pdf=$rawPath",
    $htmlUri
)
$process = Start-Process -FilePath $chromePath -ArgumentList $arguments -WindowStyle Hidden -PassThru -Wait
if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $rawPath)) {
    throw "Full reader browser-print failed with exit code $($process.ExitCode)."
}

$python = Get-Command python.exe -ErrorAction Stop
& $python.Source (Join-Path $repoPath 'scripts\normalize-full-pdf.py') $rawPath $finalPath
if ($LASTEXITCODE -ne 0) { throw 'Full reader PDF normalization failed.' }
$receipt = [ordered]@{
    schema = 'openlogic-te-full-browser-pdf-build/1'
    status = 'built_qa_pending'
    source_html_sha256 = $htmlHash
    css_sha256 = (Get-FileHash -LiteralPath (Join-Path $repoPath 'output\html\full\reader.css') -Algorithm SHA256).Hash.ToLowerInvariant()
    cold = [bool]$Cold
    output = [IO.Path]::GetRelativePath($repoPath, $finalPath).Replace('\', '/')
    bytes = (Get-Item -LiteralPath $finalPath).Length
    sha256 = (Get-FileHash -LiteralPath $finalPath -Algorithm SHA256).Hash.ToLowerInvariant()
    engine = 'headless Chrome HTML/MathML print, normalized with pikepdf deterministic ID'
    latex_processes = 0
}
$receiptPath = Join-Path $workPath "build-receipt$suffix.json"
$receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $receiptPath -Encoding utf8
$receipt | ConvertTo-Json -Depth 5
