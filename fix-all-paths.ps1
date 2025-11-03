# Comprehensive script to fix ALL remaining path issues in HTML files

$frontendPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend"

Write-Host "Fixing all remaining path issues in HTML files..." -ForegroundColor Cyan

Get-ChildItem -Path $frontendPath -Filter "*.html" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    $changed = $false
    
    # Fix CSS files that don't have css/ prefix and aren't CDN links
    $patterns = @{
        'href="styles\.css"' = 'href="css/styles.css"'
        'href="notifications\.css"' = 'href="css/notifications.css"'
        'href="icon-animations\.css"' = 'href="css/icon-animations.css"'
        'href="loading-states\.css"' = 'href="css/loading-states.css"'
        'href="toast\.css"' = 'href="css/toast.css"'
        'href="infinite-scroll\.css"' = 'href="css/infinite-scroll.css"'
        'href="points-system\.css"' = 'href="css/points-system.css"'
        'href="medal-icons\.css"' = 'href="css/medal-icons.css"'
        'href="cancel-confirmation-modal\.css"' = 'href="css/cancel-confirmation-modal.css"'
        
        # Fix JS files that don't have js/ prefix and aren't CDN links
        'src="notifications\.js"' = 'src="js/notifications.js"'
        'src="toast\.js"' = 'src="js/toast.js"'
        'src="header-search\.js"' = 'src="js/header-search.js"'
        'src="infinite-scroll\.js"' = 'src="js/infinite-scroll.js"'
        'src="infinite-scroll-integration\.js"' = 'src="js/infinite-scroll-integration.js"'
        'src="points-system\.js"' = 'src="js/points-system.js"'
        'src="cancel-confirmation-modal\.js"' = 'src="js/cancel-confirmation-modal.js"'
        'src="futuristic-animations\.js"' = 'src="js/futuristic-animations.js"'
        'src="peaceful-animations\.js"' = 'src="js/peaceful-animations.js"'
    }
    
    foreach ($pattern in $patterns.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $patterns[$pattern]
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed: $($_.Name)" -ForegroundColor Green
    } else {
        Write-Host "No changes: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nAll HTML files have been updated!" -ForegroundColor Green
Write-Host "Checking for config.js inclusion..." -ForegroundColor Cyan

# Ensure config.js is added to all important pages
$importantPages = @('index.html', 'events.html', 'home.html', 'calendar.html', 'favorites.html', 
                     'leaderboard.html', 'my-tickets.html', 'profile.html', 'event-template.html',
                     'register.html', 'my-events.html', 'organizer-dashboard.html', 'event-management.html')

foreach ($page in $importantPages) {
    $filePath = Join-Path $frontendPath $page
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        if ($content -notmatch 'config\.js') {
            Write-Host "Adding config.js to: $page" -ForegroundColor Yellow
            # Add it before the first script tag in head
            if ($content -match '(<head[^>]*>)(.*?)(</head>)') {
                $headContent = $matches[2]
                if ($headContent -match '<script') {
                    $content = $content -replace '(<head[^>]*>.*?)(<script)', "`$1`n  <script src=`"js/config.js`"></script>`n  `$2"
                } else {
                    $content = $content -replace '(</head>)', "  <script src=`"js/config.js`"></script>`n`$1"
                }
                Set-Content -Path $filePath -Value $content -NoNewline
                Write-Host "  ✓ Added config.js to $page" -ForegroundColor Green
            }
        } else {
            Write-Host "  ✓ $page already has config.js" -ForegroundColor Gray
        }
    }
}

Write-Host "`n✅ All fixes completed!" -ForegroundColor Green
