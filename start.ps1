# Local HTTP server for Sanctuary Model (required for WebLLM + ES modules)
# Usage: powershell -ExecutionPolicy Bypass -File start.ps1

param(
    [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

$Mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.mjs'  = 'text/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.wasm' = 'application/wasm'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.txt'  = 'text/plain; charset=utf-8'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.bin'  = 'application/octet-stream'
}

function Get-ContentType([string]$Path) {
    $ext = [System.IO.Path]::GetExtension($Path).ToLower()
    if ($Mime.ContainsKey($ext)) { return $Mime[$ext] }
    return 'application/octet-stream'
}

function Send-File([System.Net.HttpListenerContext]$Ctx, [string]$FilePath) {
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    $Ctx.Response.ContentType = Get-ContentType $FilePath
    $Ctx.Response.ContentLength64 = $bytes.Length
    $Ctx.Response.StatusCode = 200
    $Ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $Ctx.Response.OutputStream.Close()
}

function Resolve-SafeFilePath([string]$Root, [string]$RelativePath) {
    $rootFull = [System.IO.Path]::GetFullPath($Root)
    if (-not $rootFull.EndsWith([IO.Path]::DirectorySeparatorChar)) {
        $rootFull += [IO.Path]::DirectorySeparatorChar
    }
    $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $RelativePath))
    if (-not $candidate.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }
    return $candidate
}

function Stop-StaleSanctuaryServers([int]$ListenPort) {
    $mine = $PID
    $ancestors = @($mine)
    try {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$mine" -ErrorAction SilentlyContinue
        while ($p -and $p.ParentProcessId -and $p.ParentProcessId -ne 0) {
            $ancestors += $p.ParentProcessId
            $p = Get-CimInstance Win32_Process -Filter "ProcessId=$($p.ParentProcessId)" -ErrorAction SilentlyContinue
        }
    } catch {}

    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.ProcessId -notin $ancestors -and
            $_.Name -eq 'powershell.exe' -and
            $_.CommandLine -and
            ($_.CommandLine -match 'start\.ps1')
        } |
        ForEach-Object {
            Write-Host "  Stopping previous Sanctuary server (PID $($_.ProcessId))..." -ForegroundColor DarkGray
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
    Start-Sleep -Milliseconds 1200
}

function Test-PortListening([int]$ListenPort) {
    $conn = Get-NetTCPConnection -LocalPort $ListenPort -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -eq '127.0.0.1' -or $_.LocalAddress -eq '::1' }
    return [bool]$conn
}

function Test-SanctuaryServerResponding([int]$ListenPort) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$ListenPort/unlock.html" -UseBasicParsing -TimeoutSec 3
        return ($r.StatusCode -eq 200) -and ($r.Content -match 'vault|Sanctuary|TargetProof')
    } catch {
        return $false
    }
}

function Open-SanctuaryApp([int]$ListenPort) {
    $url = "http://127.0.0.1:$ListenPort/unlock.html"
    Write-Host ""
    Write-Host "  Sanctuary Model - TargetProof" -ForegroundColor Yellow
    Write-Host "  Open: $url" -ForegroundColor Cyan
    Write-Host ""
    Start-Process $url
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)

if (Test-PortListening $Port) {
    if (Test-SanctuaryServerResponding $Port) {
        Write-Host ""
        Write-Host "  Sanctuary Model is already running on port $Port." -ForegroundColor Green
        Write-Host "  Serving from another window - opening the app." -ForegroundColor DarkGray
        Open-SanctuaryApp $Port
        exit 0
    }
    Stop-StaleSanctuaryServers $Port
}

$started = $false
foreach ($attempt in 1..3) {
    if ($attempt -gt 1 -and (Test-PortListening $Port)) {
        Stop-StaleSanctuaryServers $Port
    }
    try {
        $listener.Start()
        $started = $true
        break
    } catch {
        if (Test-SanctuaryServerResponding $Port) {
            Write-Host ""
            Write-Host "  Sanctuary Model is already running on port $Port." -ForegroundColor Green
            Open-SanctuaryApp $Port
            exit 0
        }
        if ($attempt -lt 3 -and (Test-PortListening $Port)) { continue }
        Write-Host ""
        Write-Host "  Could not start server on port $Port." -ForegroundColor Red
        Write-Host "  Close any other Sanctuary server window and try again." -ForegroundColor Yellow
        Write-Host "  Or run: powershell -File start.ps1 -Port 8766" -ForegroundColor DarkGray
        Write-Host ""
        Read-Host "Press Enter to close"
        exit 1
    }
}
if (-not $started) {
    Write-Host ""
    Write-Host "  Could not start server on port $Port." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

Write-Host "  Serving from: $Root" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Keep this window open while using the app." -ForegroundColor White
Write-Host "  Close this window to stop the server." -ForegroundColor DarkGray
Open-SanctuaryApp $Port

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $raw = $req.Url.LocalPath
    if ($raw -eq '/') { $raw = '/index.html' }
    $rel = $raw.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
    $target = Resolve-SafeFilePath $Root $rel

    try {
        if (-not $target) {
            $ctx.Response.StatusCode = 403
            $msg = [Text.Encoding]::UTF8.GetBytes('Forbidden')
            $ctx.Response.ContentType = 'text/plain'
            $ctx.Response.ContentLength64 = $msg.Length
            $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
            $ctx.Response.OutputStream.Close()
        } elseif (Test-Path $target -PathType Leaf) {
            Send-File $ctx $target
        } elseif (Test-Path ($target + '.html') -PathType Leaf) {
            Send-File $ctx ($target + '.html')
        } else {
            $ctx.Response.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes("Not found: $raw")
            $ctx.Response.ContentType = 'text/plain'
            $ctx.Response.ContentLength64 = $msg.Length
            $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
            $ctx.Response.OutputStream.Close()
        }
    } catch {
        try {
            $ctx.Response.StatusCode = 500
            $ctx.Response.OutputStream.Close()
        } catch {}
    }
}