# PowerShell script to remove all emojis from JavaScript files

$files = @(
    "event-template.js",
    "my-tickets.js",
    "event-management.js",
    "script.js"
)

$replacements = @{
    "â¤ï¸" = ""
    "â" = ""
    "ð" = ""
    "âï¸" = ""
    "ð°" = ""
    "ð" = ""
    "ð" = ""
    "â" = ""
    "âï¸" = ""
    "ð" = ""
    "×" = ""
    "Ã—" = ""
    "Â" = ""
    "ï¸" = ""
    "ðŸŽ‰" = ""
    "🎉" = ""
    "❌" = ""
    "✓" = ""
    "✅" = ""
    "❤️" = ""
    "🗑️" = ""
    "🔄" = ""
    "📥" = ""
    "💰" = ""
    "📊" = ""
    "⚠️" = ""
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        $content = Get-Content $file -Raw -Encoding UTF8
        
        foreach ($emoji in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($emoji), $replacements[$emoji]
        }
        
        # Remove multiple spaces that might be left
        $content = $content -replace '\s{2,}', ' '
        
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✓ Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
