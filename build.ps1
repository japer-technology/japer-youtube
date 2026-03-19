<#
  build.ps1 — PowerShell assembler (use if Node.js is not available)
  Usage:  .\build.ps1
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$src  = Join-Path $PSScriptRoot 'src'
$dist = Join-Path $PSScriptRoot 'dist'

function Read-Sorted($dir, $ext) {
    if (-not (Test-Path $dir)) { return '' }
    (Get-ChildItem $dir -Filter "*$ext" | Sort-Object Name |
        ForEach-Object { [System.IO.File]::ReadAllText($_.FullName, [System.Text.UTF8Encoding]::new($false)) }) -join "`n"
}

function Read-Fragment($name) {
    $file = Join-Path $src "html\$name"
    if (Test-Path $file) { return [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false)) }
    return "<!-- missing fragment: $name -->"
}

$css  = Read-Sorted (Join-Path $src 'css') '.css'
$js   = Read-Sorted (Join-Path $src 'js')  '.js'

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
$(Read-Fragment 'head.html')
<style>
$css
</style>
</head>
<body>
$(Read-Fragment 'body-header.html')
$(Read-Fragment 'body-main.html')
$(Read-Fragment 'body-footer.html')
<script>
$js
</script>
</body>
</html>
"@

if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }
$outFile = Join-Path $dist 'index.html'
[System.IO.File]::WriteAllText($outFile, $html, [System.Text.UTF8Encoding]::new($false))

$sizeKB = [math]::Round((Get-Item $outFile).Length / 1024, 1)
Write-Host "[build] dist/index.html  ($sizeKB KB)"
