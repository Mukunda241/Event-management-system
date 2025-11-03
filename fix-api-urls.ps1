# Script to fix all hardcoded API URLs to use API_CONFIG.BASE_URL
$jsPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend\js"

Write-Host "===== Fixing API Connections =====" -ForegroundColor Green

# Files to fix (excluding config.js itself)
$filesToFix = @(
    'script.js',
    'points-system.js',
    'organizer-dashboard.js',
    'my-tickets.js',
    'my-events.js',
    'leaderboard-new.js',
    'leaderboard-icons.js',
    'leaderboard.js',
    'infinite-scroll-integration.js',
    'events.js',
    'event-template.js',
    'event-management.js',
    'calendar.js',
    'favorites.js',
    'profile.js',
    'header-search.js'
)

foreach ($fileName in $filesToFix) {
    $filePath = Join-Path $jsPath $fileName
    
    if (Test-Path $filePath) {
        Write-Host "`nProcessing: $fileName" -ForegroundColor Cyan
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Replace all instances of http://localhost:5000 with ${API_CONFIG.BASE_URL}
        $content = $content -replace 'http://localhost:5000', '${API_CONFIG.BASE_URL}'
        $content = $content -replace 'http://127\.0\.0\.1:5000', '${API_CONFIG.BASE_URL}'
        
        # Fix cases where we might have double template literals
        $content = $content -replace '\$\{API_CONFIG\.BASE_URL\}//', '${API_CONFIG.BASE_URL}/'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "  Fixed API URLs" -ForegroundColor Green
        }
        else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "`nSkipping: $fileName (file not found)" -ForegroundColor Yellow
    }
}

Write-Host "`n===== API Connection Fixes Complete =====" -ForegroundColor Green
