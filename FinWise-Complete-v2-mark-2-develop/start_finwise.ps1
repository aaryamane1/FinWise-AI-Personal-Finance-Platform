# FinWise Startup Automator v2.5 (Reliable Launch Patch)
<#
.SYNOPSIS
    Automated startup script for FinWise Backend, Frontend, and Cloudflare Tunnel.
    v2.5: Added tunnel URL extraction and improved frontend visibility.
#>
Param(
    [switch]$NoTunnel,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

# Set location to script directory
if ($PSScriptRoot) { Set-Location $PSScriptRoot }

$ErrorActionPreference = "Stop"
$Processes = @()

# --- Helper Functions ---
function Write-Step ([string]$msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Info ([string]$msg) { Write-Host "   $msg" -ForegroundColor Gray }
function Write-Success ([string]$msg) { Write-Host "   [OK] $msg" -ForegroundColor Green }

function Wait-ForPort ([int]$port, [string]$name) {
    Write-Info "Waiting for $name on port $port..."
    for ($i = 0; $i -lt 40; $i++) {
        $listening = netstat -ano 2>$null | Select-String "LISTENING" | Select-String ":$port"
        if ($listening) {
            Write-Success "$name is ready!"
            return $true
        }
        Start-Sleep -Milliseconds 500
    }
    Write-Host "   [!] $name is taking longer than expected to respond." -ForegroundColor Yellow
    return $false
}

function Stop-AllProcesses {
    Write-Step "Shutting down FinWise..."
    foreach ($p in $Processes) {
        try {
            if ($p -and -not $p.HasExited) { 
                Write-Info "Stopping process $($p.Id)..."
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue 
            }
        } catch {}
    }
    # Final cleanup of ports
    Write-Info "Cleaning up ports 8000 and 5173..."
    @(8000, 5173) | ForEach-Object {
        $port = $_
        $pids = netstat -ano 2>$null | Select-String ":$port" | ForEach-Object {
            if ($_ -match '\s+(\d+)\s*$') { [int]$matches[1] }
        } | Select-Object -Unique
        $pids | ForEach-Object {
            try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
    Write-Success "Shutdown complete."
}

# --- Main Logic ---
try {
    Write-Host "FinWise Automator v2.5" -ForegroundColor Yellow

    # 1. Cleanup
    Write-Step "Cleaning up stale ports..."
    @(8000, 5173) | ForEach-Object {
        $port = $_
        $pids = netstat -ano 2>$null | Select-String ":$port" | ForEach-Object {
            if ($_ -match '\s+(\d+)\s*$') { [int]$matches[1] }
        } | Select-Object -Unique
        $pids | ForEach-Object {
            try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {}
        }
    }

    # 2. Backend
    if (-not $FrontendOnly) {
        Write-Step "Starting Backend..."
        Push-Location "Backend"
        if (-not (Test-Path "venv")) { 
            Write-Info "Creating virtual environment..."
            python -m venv venv 
        }
        
        # Start Backend
        $backendProc = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", ".\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -PassThru
        $Processes += $backendProc
        Pop-Location
    }

    # 3. Frontend
    if (-not $BackendOnly) {
        Write-Step "Starting Frontend..."
        Push-Location "finwise-frontend"
        if (-not (Test-Path "node_modules")) { 
            Write-Info "Installing dependencies (this may take a minute)..."
            npm install 
        }
        
        # Start Frontend in a VISIBLE window to see any errors
        $frontendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru
        $Processes += $frontendProc
        Pop-Location
    }

    # 4. Finalize
    $backendReady = if (-not $FrontendOnly) { Wait-ForPort 8000 "Backend" } else { $true }
    $frontendReady = if (-not $BackendOnly) { Wait-ForPort 5173 "Frontend" } else { $true }

    if (-not $NoTunnel -and -not $BackendOnly -and $frontendReady) {
        Write-Step "Starting Tunnel..."
        $cfCmd = if (Get-Command "cloudflared" -ErrorAction SilentlyContinue) { "cloudflared" } else { "npx cloudflared" }
        
        # Start tunnel and capture output to extract URL
        $tempLog = Join-Path $env:TEMP "finwise_tunnel_$($PID).log"
        $tunnelProc = Start-Process powershell -ArgumentList "-Command", "$cfCmd tunnel --url http://localhost:5173 2> `"$tempLog`"" -PassThru -WindowStyle Hidden
        $Processes += $tunnelProc
        
        Write-Info "Acquiring public URL (waiting 8s)..."
        Start-Sleep -Seconds 8
        if (Test-Path $tempLog) {
            $content = Get-Content $tempLog -Raw
            if ($content -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
                $publicUrl = $matches[1]
                Write-Host "`n[PUBLIC ACCESS ENABLED]" -ForegroundColor Green
                Write-Host "URL: $publicUrl" -ForegroundColor Green -BackgroundColor Black
                Write-Host "Use this link to access FinWise from any device.`n" -ForegroundColor Gray
            } else {
                Write-Host "   [!] Tunnel started but URL extraction failed." -ForegroundColor Yellow
                Write-Info "Check for a separate Cloudflare window or log for the URL."
            }
        }
    }

    if ($backendReady -and $frontendReady) {
        Write-Step "FinWise System Active!"
        Write-Host "--- Press Ctrl+C to stop all services ---" -ForegroundColor Yellow
    } else {
        Write-Host "`n[!] Some services failed to start correctly. Check the open windows for errors." -ForegroundColor Red
    }

    # Keep script alive
    while ($true) { Start-Sleep -Seconds 1 }
}
catch {
    Write-Host "`n[!] An error occurred: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Stop-AllProcesses
}
