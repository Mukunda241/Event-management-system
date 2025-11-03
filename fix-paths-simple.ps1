# Simple script to fix all HTML file paths
$rootPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend"

Write-Host "===== Starting Path Fixes =====" -ForegroundColor Green

# Get all HTML files in frontend folder
$htmlFiles = Get-ChildItem -Path $rootPath -Filter "*.html" -File

foreach ($file in $htmlFiles) {
    Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Cyan
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix styles.css
    $content = $content -replace '(?<!css/)href="styles\.css"', 'href="css/styles.css"'
    $content = $content -replace '(?<!css/)src="styles\.css"', 'src="css/styles.css"'
    
    # Fix notifications.css/js
    $content = $content -replace '(?<!css/)href="notifications\.css"', 'href="css/notifications.css"'
    $content = $content -replace '(?<!js/)src="notifications\.js"', 'src="js/notifications.js"'
    
    # Fix header-search.js
    $content = $content -replace '(?<!js/)src="header-search\.js"', 'src="js/header-search.js"'
    
    # Fix toast.css/js
    $content = $content -replace '(?<!css/)href="toast\.css"', 'href="css/toast.css"'
    $content = $content -replace '(?<!js/)src="toast\.js"', 'src="js/toast.js"'
    
    # Fix icon-animations.css
    $content = $content -replace '(?<!css/)href="icon-animations\.css"', 'href="css/icon-animations.css"'
    
    # Fix loading-states.css
    $content = $content -replace '(?<!css/)href="loading-states\.css"', 'href="css/loading-states.css"'
    
    # Fix infinite-scroll.css/js
    $content = $content -replace '(?<!css/)href="infinite-scroll\.css"', 'href="css/infinite-scroll.css"'
    $content = $content -replace '(?<!js/)src="infinite-scroll\.js"', 'src="js/infinite-scroll.js"'
    
    # Fix points-system.css/js
    $content = $content -replace '(?<!css/)href="points-system\.css"', 'href="css/points-system.css"'
    $content = $content -replace '(?<!js/)src="points-system\.js"', 'src="js/points-system.js"'
    
    # Add config.js if not present (for important pages)
    $importantPages = @('index', 'events', 'home', 'calendar', 'favorites', 'leaderboard', 'my-tickets', 'profile', 'event-template', 'register', 'my-events', 'organizer-dashboard', 'event-management')
    $fileName = $file.BaseName
    
    if ($importantPages -contains $fileName -and $content -notmatch '<script\s+src="js/config\.js"') {
        # Add config.js before the first js/ script or before </head>
        $configScript = '    <script src="js/config.js"></script>'
        if ($content -match '(<script\s+[^>]*src="js/[^"]+")') {
            $firstJsScript = $Matches[1]
            $content = $content -replace [regex]::Escape($firstJsScript), "$configScript`n    $firstJsScript"
            Write-Host "  Added config.js" -ForegroundColor Yellow
        }
        elseif ($content -match '</head>') {
            $content = $content -replace '</head>', "$configScript`n</head>"
            Write-Host "  Added config.js" -ForegroundColor Yellow
        }
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`n===== Path Fixes Complete =====" -ForegroundColor Green
Write-Host "All HTML files have been updated" -ForegroundColor Cyan
