$ErrorActionPreference='Stop'
if(-not $IsWindows){throw 'This guarded builder requires Windows PowerShell 7.4+.'}
$repoPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$buildPath=Join-Path $repoPath 'build'
$null=New-Item -ItemType Directory -Path $buildPath -Force
$engine=Get-Command xelatex.exe -ErrorAction SilentlyContinue
$enginePath=if($engine){$engine.Source}else{Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs\MiKTeX\miktex\bin\x64\xelatex.exe'}
if(-not (Test-Path -LiteralPath $enginePath)){throw 'XeLaTeX is not installed or on PATH.'}
$mutex=[Threading.Mutex]::new($false,'Global\InterlanguageTeXSlotV1')
$held=$false
$receipt=[ordered]@{schema='openlogic-te-public-build/1';started_utc=[DateTime]::UtcNow.ToString('o');mutex='Global\InterlanguageTeXSlotV1';timeout_ms=30000;acquired=$false;abandoned_recovery=$false;passes=@();status='not_started'}
try{
    try{$held=$mutex.WaitOne(30000)}catch [Threading.AbandonedMutexException]{$held=$true;$receipt.abandoned_recovery=$true}
    $receipt.acquired=$held
    if(-not $held){$receipt.status='slot_busy';throw 'TeX slot occupied; no process launched.'}
    for($pass=1;$pass -le 4;$pass++){
        $stdout=Join-Path $buildPath "pass-$pass.stdout.log"
        $stderr=Join-Path $buildPath "pass-$pass.stderr.log"
        $process=Start-Process -FilePath $enginePath -ArgumentList @('--disable-installer','-no-shell-escape','-interaction=nonstopmode','-halt-on-error','-file-line-error','-output-directory=build','editions/sets.tex') -WorkingDirectory $repoPath -WindowStyle Hidden -Environment @{SOURCE_DATE_EPOCH='1788480000';FORCE_SOURCE_DATE='1'} -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait
        $profilePath=[Environment]::GetFolderPath('UserProfile')
        foreach($logFile in @($stdout,$stderr,(Join-Path $buildPath 'sets.log'))){
            if(Test-Path -LiteralPath $logFile){
                $safeLog=[IO.File]::ReadAllText($logFile).Replace($profilePath,'<USERPROFILE>').Replace($profilePath.Replace('\','/'),'<USERPROFILE>')
                [IO.File]::WriteAllText($logFile,$safeLog,[Text.UTF8Encoding]::new($false))
            }
        }
        if($process.ExitCode -ne 0){$receipt.status='tex_failed';throw "Captured TeX pass $pass failed."}
        $receipt.passes+=@{pass=$pass;exit_code=$process.ExitCode;pdf_sha256=(Get-FileHash -LiteralPath (Join-Path $buildPath 'sets.pdf')).Hash.ToLowerInvariant()}
    }
    $log=[IO.File]::ReadAllText((Join-Path $buildPath 'sets.log'))
    $receipt.missing_characters=@([regex]::Matches($log,'Missing character:[^\r\n]*')|ForEach-Object Value)
    $receipt.overfull_boxes=@([regex]::Matches($log,'Overfull[^\r\n]*')|ForEach-Object Value)
    $receipt.undefined_references=$log.Contains('There were undefined references')
    $receipt.reproducible_last_two_passes=($receipt.passes[2].pdf_sha256 -eq $receipt.passes[3].pdf_sha256)
    if($receipt.missing_characters.Count -or $receipt.overfull_boxes.Count -or $receipt.undefined_references -or -not $receipt.reproducible_last_two_passes){$receipt.status='qa_failed';throw 'Build QA failed.'}
    $receipt.status='compiled_requires_visual_review'
}finally{
    $receipt.finished_utc=[DateTime]::UtcNow.ToString('o')
    $receipt|ConvertTo-Json -Depth 6|Set-Content -LiteralPath (Join-Path $buildPath 'build-receipt.json') -Encoding utf8
    if($held){$mutex.ReleaseMutex()}
    $mutex.Dispose()
}
$receipt|ConvertTo-Json -Depth 6
