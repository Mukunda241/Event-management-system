# PowerShell script to remove emojis from JavaScript files

$files = @(
    "event-template.js",
    "my-tickets.js",
    "event-management.js",
    "script.js"
)

$replacements = @{
    # Toast messages
    '"❌ No event specified!"' = '"No event specified!"'
    '"❌ Event not found!"' = '"Event not found!"'
    '"❌ Error loading event details"' = '"Error loading event details"'
    '"❌ This event has already ended. Tickets are no longer available."' = '"This event has already ended. Tickets are no longer available."'
    '"❌ This event has been cancelled. Tickets are not available."' = '"This event has been cancelled. Tickets are not available."'
    '"❌ Tickets are not available for this event"' = '"Tickets are not available for this event"'
    '"❌ Cannot cancel booking for past events"' = '"Cannot cancel booking for past events"'
    '"❌ Please login to cancel booking"' = '"Please login to cancel booking"'
    '"❌ You already have tickets for this event!"' = '"You already have tickets for this event!"'
    '"❌ Failed to share"' = '"Failed to share"'
    "('❌ Failed to copy link')" = "('Failed to copy link')"
    '"❌ Please fill in all fields."' = '"Please fill in all fields."'
    '"❌ Please enter a valid ticket price for paid events."' = '"Please enter a valid ticket price for paid events."'
    '"❌ Failed to create event. Please try again."' = '"Failed to create event. Please try again."'
    '"❌ Error creating event. Please try again."' = '"Error creating event. Please try again."'
    '"❌ Please login to cancel ticket"' = '"Please login to cancel ticket"'
    '`❌ ${error.message}`' = '`${error.message}`'
    '"🎉 Payment successful! Tickets confirmed!"' = '"Payment successful! Tickets confirmed!"'
    '`🎉 ${ticketQuantity} ticket(s) confirmed successfully!`' = '`${ticketQuantity} ticket(s) confirmed successfully!`'
    '"❤️ Added to favorites!"' = '"Added to favorites!"'
    '`❤️ ${eventToFavorite.name} added to favorites!`' = '`${eventToFavorite.name} added to favorites!`'
    '"📥 Ticket downloaded!"' = '"Ticket downloaded!"'
    '"🔄 Cancelling ticket..."' = '"Cancelling ticket..."'
    '`✅ ${data.message}`' = '`${data.message}`'
    '`✓ ${result.message} | -50 points deducted`' = '`${result.message} | -50 points deducted`'
    
    # Console logs
    '"🗑️ Cancelling booking for:"' = '"Cancelling booking for:"'
    '"✅ Ticket cancelled successfully:"' = '"Ticket cancelled successfully:"'
    '"❌ Error cancelling ticket:"' = '"Error cancelling ticket:"'
}

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        
        if ($content -ne $originalContent) {
            Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✓ Updated $file" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed in $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  × File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nEmoji removal complete!" -ForegroundColor Green
