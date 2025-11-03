# Script to add config.js to all HTML files that need it

$frontendPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend"

Write-Host "Adding config.js to HTML files..." -ForegroundColor Cyan

Get-ChildItem -Path $frontendPath -Filter "*.html" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    # Check if config.js is already included
    if ($content -notmatch 'config\.js') {
        # Find the first <script> tag or </head> tag and add config.js before it
        if ($content -match '</head>') {
            $content = $content -replace '</head>', '  <script src="js/config.js"></script>' + "`n</head>"
            Set-Content -Path $file -Value $content
            Write-Host "Added config.js to: $($_.Name)" -ForegroundColor Green
        } elseif ($content -match '<script') {
            $content = $content -replace '(<script[^>]*>)', '<script src="js/config.js"></script>' + "`n  `$1"
            Set-Content -Path $file -Value $content
            Write-Host "Added config.js to: $($_.Name)" -ForegroundColor Green
        } else {
            Write-Host "Skipped: $($_.Name) (no suitable location found)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Already has config.js: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nAll HTML files have been updated!" -ForegroundColor Green
