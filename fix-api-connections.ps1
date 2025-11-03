# Script to fix API connections in all JavaScript files

$frontendPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend\js"

Write-Host "Fixing API connections in JavaScript files..." -ForegroundColor Cyan

Get-ChildItem -Path $frontendPath -Filter "*.js" -Exclude "config.js" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    $changed = $false
    
    # Replace hardcoded localhost:5000 with API_CONFIG.BASE_URL
    if ($content -match 'http://localhost:5000') {
        $content = $content -replace '"http://localhost:5000/', '`${API_CONFIG.BASE_URL}/'
        $content = $content -replace "'http://localhost:5000/", '`${API_CONFIG.BASE_URL}/'
        $content = $content -replace 'http://localhost:5000', 'API_CONFIG.BASE_URL'
        $changed = $true
    }
    
    # Fix relative API paths like "/login", "/register"
    if ($content -match 'fetch\([''"]/(login|register)[''"]') {
        $content = $content -replace 'fetch\("/(login|register)"', 'fetch(`${API_CONFIG.BASE_URL}/$1`'
        $content = $content -replace "fetch\('/(login|register)'", 'fetch(`${API_CONFIG.BASE_URL}/$1`'
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $file -Value $content
        Write-Host "Fixed: $($_.Name)" -ForegroundColor Green
    } else {
        Write-Host "Skipped: $($_.Name) (no changes needed)" -ForegroundColor Gray
    }
}

Write-Host "`nAll JavaScript files have been updated!" -ForegroundColor Green
