"""Package the additive v0.4.0 flattened-source repair deterministically."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import subprocess
import zipfile


EXPECTED_COMMIT = "2892803b925b0330bca6200df21ce27b68208cdd"
SOURCE_REVISION = "9620cc73f9c8e0ad003c514a5d3748f29611c4c0"
TEX_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex"
ASSEMBLY_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0-ASSEMBLY.json"
ARCHIVE_NAME = "openlogic-te-Telu-IN-cumulative-OLP0279-build-source-v0.4.0.zip"
ZIP_TIMESTAMP = (2026, 9, 20, 0, 0, 0)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def zip_bytes(entries: list[tuple[str, bytes]]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, payload in sorted(entries):
            normalized = PurePosixPath(name)
            require(not normalized.is_absolute() and ".." not in normalized.parts, f"Unsafe archive path: {name}")
            info = zipfile.ZipInfo(normalized.as_posix(), date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, payload, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return buffer.getvalue()


BUILD_SCRIPT = r"""$ErrorActionPreference = 'Stop'
if (-not $IsWindows) { throw 'This guarded helper requires Windows PowerShell 7.4+.' }

$sourcePath = [IO.Path]::GetFullPath($PSScriptRoot)
$texName = 'openlogic-te-Telu-IN-cumulative-OLP0279-v0.4.0.tex'
$jobName = [IO.Path]::GetFileNameWithoutExtension($texName)
$buildPath = Join-Path $sourcePath 'build'
$null = New-Item -ItemType Directory -Path $buildPath -Force

$xe = Get-Command xelatex.exe -ErrorAction SilentlyContinue
$bib = Get-Command bibtex.exe -ErrorAction SilentlyContinue
if (-not $xe) { throw 'XeLaTeX is not installed or on PATH.' }
if (-not $bib) { throw 'BibTeX is not installed or on PATH.' }

$mutex = [Threading.Mutex]::new($false, 'Global\InterlanguageTeXSlotV1')
$held = $false
$receipt = [ordered]@{
    schema = 'openlogic-te-flattened-source-build/1'
    mutex = 'Global\InterlanguageTeXSlotV1'
    timeout_ms = 30000
    acquired = $false
    commands = @()
    pdf_pass_hashes = @()
    status = 'not_started'
}

function Invoke-GuardedProcess {
    param([string]$FilePath, [string[]]$Arguments, [string]$Name)
    $stdout = Join-Path $buildPath "$Name.stdout.log"
    $stderr = Join-Path $buildPath "$Name.stderr.log"
    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $sourcePath -WindowStyle Hidden -Environment @{ SOURCE_DATE_EPOCH = '1789862400'; FORCE_SOURCE_DATE = '1' } -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -Wait
    $receipt.commands += [ordered]@{ name = $Name; exit_code = $process.ExitCode }
    if ($process.ExitCode -ne 0) { $receipt.status = 'process_failed'; throw "$Name failed with exit code $($process.ExitCode)." }
}

try {
    try { $held = $mutex.WaitOne(30000) }
    catch [Threading.AbandonedMutexException] { $held = $true; $receipt.abandoned_recovery = $true }
    $receipt.acquired = $held
    if (-not $held) { $receipt.status = 'slot_busy'; throw 'TeX slot occupied; no process launched.' }

    $texArgs = @('--disable-installer', '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-file-line-error', '-recorder', "-output-directory=$buildPath", $texName)
    Invoke-GuardedProcess -FilePath $xe.Source -Arguments $texArgs -Name 'xelatex-1'
    Invoke-GuardedProcess -FilePath $bib.Source -Arguments @((Join-Path $buildPath $jobName)) -Name 'bibtex'
    $pdfPath = Join-Path $buildPath "$jobName.pdf"
    $previousHash = $null
    $finalHash = $null
    $convergedPass = $null
    $maximumPasses = 6
    for ($pass = 2; $pass -le $maximumPasses; $pass++) {
        Invoke-GuardedProcess -FilePath $xe.Source -Arguments $texArgs -Name "xelatex-$pass"
        $finalHash = (Get-FileHash -LiteralPath $pdfPath).Hash.ToLowerInvariant()
        $receipt.pdf_pass_hashes += [ordered]@{ pass = $pass; sha256 = $finalHash }
        if ($null -ne $previousHash -and $previousHash -eq $finalHash) {
            $convergedPass = $pass
            break
        }
        $previousHash = $finalHash
    }
    $log = [IO.File]::ReadAllText((Join-Path $buildPath "$jobName.log"))
    $receipt.missing_characters = @([regex]::Matches($log, 'Missing character:[^\r\n]*') | ForEach-Object Value)
    $receipt.undefined_references = $log.Contains('There were undefined references')
    $receipt.undefined_citations = $log.Contains('There were undefined citations')
    $receipt.maximum_xelatex_passes = $maximumPasses
    $receipt.converged_xelatex_pass = $convergedPass
    $receipt.reproducible_last_two_passes = ($null -ne $convergedPass)
    $receipt.pdf_sha256 = $finalHash
    if ($receipt.missing_characters.Count -or $receipt.undefined_references -or $receipt.undefined_citations -or -not $receipt.reproducible_last_two_passes) {
        $receipt.status = 'qa_failed'; throw 'Build QA failed.'
    }
    Copy-Item -LiteralPath $pdfPath -Destination (Join-Path $sourcePath "$jobName.pdf") -Force
    $receipt.pages = ([regex]::Match($log, 'Output written on[\s\S]*?\((\d+) pages?[,.\)]').Groups[1].Value -as [int])
    $receipt.status = 'pass'
}
finally {
    $receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $buildPath 'build-receipt.json') -Encoding utf8
    if ($held) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}

$receipt | ConvertTo-Json -Depth 8
"""


README = f"""OpenLogic Telugu cumulative LaTeX build source — v0.4.0

Scope
-----
This companion contains the directly downloadable flattened LaTeX source for
OLP-0004 through OLP-0279: 276 unique editable Telugu units in the exact 328
occurrence order recorded by the release build. Fifty-two occurrences are
intentional repetitions of shared proof-system modules. This is not the full
722-unit Telugu edition.

Lineage
-------
Repository commit: {EXPECTED_COMMIT}
Frozen English source revision: {SOURCE_REVISION}

Build requirements
------------------
Use a current TeX distribution with XeLaTeX, BibTeX, and the packages required
by memoir and upstream/sty/open-logic.sty. The bundled Noto Serif Telugu fonts,
OpenLogic styles, bibliography, and diagram assets are addressed by relative
paths and require no network access.

On the shared Windows production host, run:

    pwsh -NoProfile -File BUILD-v0.4.0.ps1

That helper holds Global\\InterlanguageTeXSlotV1 across all XeLaTeX/BibTeX
passes and QA checks, and fails without launching TeX if the slot is busy. It
runs at most six XeLaTeX passes and stops when two successive PDF hashes match.

On an independent host where that production mutex is not applicable, from
this directory run the equivalent serialized commands:

    xelatex -no-shell-escape -interaction=nonstopmode -halt-on-error -recorder {TEX_NAME}
    bibtex {TEX_NAME.removesuffix('.tex')}
    xelatex -no-shell-escape -interaction=nonstopmode -halt-on-error -recorder {TEX_NAME}
    xelatex -no-shell-escape -interaction=nonstopmode -halt-on-error -recorder {TEX_NAME}
    xelatex -no-shell-escape -interaction=nonstopmode -halt-on-error -recorder {TEX_NAME}
    xelatex -no-shell-escape -interaction=nonstopmode -halt-on-error -recorder {TEX_NAME}

Compare the PDF after each post-BibTeX XeLaTeX pass and stop when two
successive SHA-256 hashes match; do not exceed six XeLaTeX passes in total.

Licensing and provenance
------------------------
See LICENSE.md, ATTRIBUTION.md, and upstream/LICENSE.md. The assembly receipt
beside the TeX file records its complete source traversal and content hash.
CONTENTS-SHA256.txt authenticates every other file in this archive.
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True, help="Detached exact-release worktree")
    args = parser.parse_args()
    root = args.root.resolve()
    commit = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], text=True).strip()
    require(commit == EXPECTED_COMMIT, f"Wrong release commit: {commit}")

    release = root / "output" / "release"
    tex_path = release / TEX_NAME
    assembly_path = release / ASSEMBLY_NAME
    require(tex_path.is_file() and assembly_path.is_file(), "Flattened source or assembly receipt is absent")
    assembly = json.loads(assembly_path.read_text(encoding="utf-8"))
    require(assembly["sha256"] == sha256(tex_path.read_bytes()), "Flattened source hash disagrees with assembly receipt")
    require(assembly["unique_units"] == 276 and assembly["inlined_occurrences"] == 328, "Unexpected assembly scope")
    require(assembly["source_subfile_commands_remaining"] == 0 and assembly["source_olimport_commands_remaining"] == 0, "Assembly is not self-contained at unit level")
    require(assembly["active_conditional_import_wrappers_evaluated"] == 28, "Unexpected conditional-import evaluation count")

    entries: list[tuple[str, bytes]] = [
        (TEX_NAME, tex_path.read_bytes()),
        (ASSEMBLY_NAME, assembly_path.read_bytes()),
        ("BUILD-v0.4.0.ps1", BUILD_SCRIPT.encode("utf-8")),
        ("README-BUILD.txt", README.encode("utf-8")),
    ]
    for relative in ("LICENSE.md", "ATTRIBUTION.md"):
        path = root / relative
        require(path.is_file(), f"Missing {relative}")
        entries.append((relative, path.read_bytes()))
    for relative in (
        "fonts/NotoSerifTelugu-Regular.ttf",
        "fonts/NotoSerifTelugu-Bold.ttf",
        "fonts/OFL.txt",
        "upstream/LICENSE.md",
        "upstream/open-logic-config.sty",
        "upstream/open-logic-envs.sty",
        "upstream/open-logic-locale.sty",
    ):
        path = root / relative
        require(path.is_file(), f"Missing dependency {relative}")
        entries.append((relative, path.read_bytes()))
    for prefix in ("upstream/assets", "upstream/bib", "upstream/sty"):
        directory = root / prefix
        require(directory.is_dir(), f"Missing dependency directory {prefix}")
        for path in sorted(item for item in directory.rglob("*") if item.is_file()):
            entries.append((path.relative_to(root).as_posix(), path.read_bytes()))

    names = [name for name, _ in entries]
    require(len(names) == len(set(names)), "Duplicate archive path")
    checksums = "".join(f"{sha256(payload)}  {name}\n" for name, payload in sorted(entries)).encode("ascii")
    entries.append(("CONTENTS-SHA256.txt", checksums))
    archive = zip_bytes(entries)
    destination = release / ARCHIVE_NAME
    destination.write_bytes(archive)
    result = {
        "schema": "openlogic-te-v040-source-repair-package/1",
        "repository_commit": commit,
        "source_revision": SOURCE_REVISION,
        "flattened_tex": {
            "filename": TEX_NAME,
            "bytes": tex_path.stat().st_size,
            "sha256": sha256(tex_path.read_bytes()),
            "active_conditional_import_wrappers_evaluated": assembly["active_conditional_import_wrappers_evaluated"],
        },
        "assembly_receipt": {"filename": ASSEMBLY_NAME, "bytes": assembly_path.stat().st_size, "sha256": sha256(assembly_path.read_bytes())},
        "companion_archive": {"filename": ARCHIVE_NAME, "bytes": len(archive), "sha256": sha256(archive), "entries": len(entries)},
    }
    receipt_path = release / "SOURCE-REPAIR-v0.4.0.json"
    receipt_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
