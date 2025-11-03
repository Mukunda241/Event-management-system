# Script to fix all HTML file paths to use css/ and js/ folders

$frontendPath = "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend"

Write-Host "Fixing HTML file paths..." -ForegroundColor Cyan

Get-ChildItem -Path $frontendPath -Filter "*.html" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    # Fix CSS paths (but not external CDN links)
    $content = $content -replace 'href="([^h][^t][^t][^p].*?\.css)"', 'href="css/$1"'
    $content = $content -replace 'href="css/css/', 'href="css/'
    
    # Fix JS paths (but not external CDN links)
    $content = $content -replace 'src="([^h][^t][^t][^p].*?\.js)"', 'src="js/$1"'
    $content = $content -replace 'src="js/js/', 'src="js/'
    
    Set-Content -Path $file -Value $content
    Write-Host "Fixed: $($_.Name)" -ForegroundColor Green
}

Write-Host "`nAll HTML files have been updated!" -ForegroundColor Green
