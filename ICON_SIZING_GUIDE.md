# Icon Sizing Reference Guide

## Quick Reference

### Icon Size Chart

| Location | Size | CSS Class | Use Case |
|----------|------|-----------|----------|
| **Navigation Icons** | 18-20px | N/A | Theme toggle, profile button |
| **Page Headers** | 40px × 40px | Auto-applied | Main page titles |
| **Section Headers** | 24px × 24px | Auto-applied | Content section titles |
| **Buttons** | 18px × 18px | Auto-applied | All button icons |
| **Cards** | 32px × 32px | `.icon-large` | Stat cards, event cards |
| **Tables** | 20px × 20px | Auto-applied | Table action icons |
| **Small Icons** | 16px × 16px | `.icon-small` | Inline meta info |

---

## Automatic Icon Sizing

These elements automatically size icons without additional classes:

### 1. Page Headers
```html
<div class="page-header">
    <svg>...</svg>  <!-- Automatically 40px × 40px -->
    <h1>Page Title</h1>
</div>
```
**Size**: 40px × 40px  
**Color**: Accent purple (#667eea)

### 2. Dashboard Headers
```html
<div class="dashboard-header">
    <svg>...</svg>  <!-- Automatically 40px × 40px -->
    <h1>Dashboard Title</h1>
</div>
```
**Size**: 40px × 40px  
**Color**: Accent purple (#667eea)

### 3. Section Headers
```html
<div class="section-header">
    <svg>...</svg>  <!-- Automatically 24px × 24px -->
    <h2>Section Title</h2>
</div>
```
**Size**: 24px × 24px  
**Color**: Accent purple (#667eea)

### 4. Button Icons
```html
<button>
    <svg>...</svg>  <!-- Automatically 18px × 18px -->
    Button Text
</button>
```
**Size**: 18px × 18px  
**Color**: Inherits from button

### 5. Navigation Icons
```html
<!-- Theme Toggle -->
<button class="theme-toggle">
    <svg>...</svg>  <!-- 20px × 20px -->
</button>

<!-- Profile Button -->
<button class="profile-btn">
    <svg>...</svg>  <!-- 18px × 18px -->
</button>
```

---

## Manual Icon Sizing (Utility Classes)

Use these classes when you need specific icon sizes:

### Small Icons (16px)
```html
<svg class="icon-small">...</svg>
```
**Best for**: Inline text icons, small indicators

### Medium Icons (24px)
```html
<svg class="icon-medium">...</svg>
```
**Best for**: Feature lists, option icons

### Large Icons (32px)
```html
<svg class="icon-large">...</svg>
```
**Best for**: Card headers, prominent features

### X-Large Icons (40px)
```html
<svg class="icon-xlarge">...</svg>
```
**Best for**: Hero sections, empty states

---

## Context-Specific Sizing

### Stat Cards
```html
<div class="stat-card">
    <svg>...</svg>  <!-- Automatically 32px × 32px -->
    <div class="stat-label">Label</div>
    <div class="stat-value">Value</div>
</div>
```
**Icon Size**: 32px × 32px

### Event Cards
```html
<div class="event-card">
    <svg>...</svg>  <!-- Automatically 32px × 32px -->
    <!-- card content -->
</div>
```
**Icon Size**: 32px × 32px

### Table Actions
```html
<table>
    <tr>
        <td>
            <button>
                <svg>...</svg>  <!-- Automatically 20px × 20px -->
            </button>
        </td>
    </tr>
</table>
```
**Icon Size**: 20px × 20px

### Meta Information
```html
<div class="meta-row">
    <svg>...</svg>  <!-- Automatically 18px × 18px -->
    <span>Meta text</span>
</div>
```
**Icon Size**: 18px × 18px

---

## Responsive Behavior

Icons automatically adjust on mobile devices:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page Headers | 40px | 32px |
| Dashboard Headers | 40px | 32px |
| Section Headers | 24px | 20px |
| Buttons | 18px | 18px |
| Cards | 32px | 32px |

---

## Dark Mode

All icon sizes remain the same in dark mode.  
Only colors change to maintain visibility:

- **Accent Icons**: Keep purple color (#667eea)
- **Button Icons**: Inherit button color
- **Header Icons**: Remain accent color

---

## Common Mistakes to Avoid

### ❌ Don't Use Inline Styles
```html
<!-- BAD -->
<svg style="width: 40px; height: 40px;">...</svg>
```

### ✅ Use Semantic Structure
```html
<!-- GOOD -->
<div class="page-header">
    <svg>...</svg>
    <h1>Title</h1>
</div>
```

### ❌ Don't Mix Size Methods
```html
<!-- BAD - conflicting sizing -->
<div class="page-header">
    <svg class="icon-large">...</svg>
</div>
```

### ✅ Trust Automatic Sizing
```html
<!-- GOOD - let CSS handle it -->
<div class="page-header">
    <svg>...</svg>
</div>
```

---

## Testing Your Icons

### Visual Checklist:
- [ ] Icon is clearly visible
- [ ] Icon is not pixelated or blurry
- [ ] Icon scales appropriately with container
- [ ] Icon maintains aspect ratio
- [ ] Icon color matches design (usually #667eea for accents)
- [ ] Icon has proper spacing from adjacent text
- [ ] Icon works in both light and dark modes
- [ ] Icon size is appropriate for its context

### Size Validation:
1. Open browser DevTools
2. Inspect the SVG element
3. Check computed width and height
4. Should match expected size from chart above

---

## Custom Icon Integration

### Adding a New Icon:

1. **Choose the right size** based on context (see chart above)
2. **Use semantic HTML structure**:
   ```html
   <div class="section-header">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <!-- icon paths -->
       </svg>
       <h2>Section Title</h2>
   </div>
   ```
3. **Test in multiple contexts**:
   - Light mode
   - Dark mode
   - Desktop view
   - Mobile view
4. **Verify automatic sizing** is applied correctly

---

## Icon Libraries Used

- **Feather Icons**: Main icon set
- **Lucide Icons**: Alternative set (compatible)
- **Custom SVGs**: Occasional use

All icons follow the same structure:
```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 24 24" 
     fill="none" 
     stroke="currentColor" 
     stroke-width="2">
  <!-- paths -->
</svg>
```

---

## Troubleshooting

### Icon Too Large
- Check if parent container has automatic sizing
- Remove any inline styles
- Verify no conflicting CSS classes

### Icon Too Small
- Ensure icon is in correct semantic structure
- Check for overriding CSS
- Verify viewBox is "0 0 24 24"

### Icon Not Visible
- Check stroke color (should be "currentColor")
- Verify icon has stroke-width (usually 2)
- Ensure fill is "none" for outline icons
- Check dark mode contrast

### Icon Not Responsive
- Verify CSS includes responsive breakpoints
- Check if icon has fixed pixel values
- Test on actual mobile device

---

**Quick Tip**: When in doubt, use the semantic HTML structure (`.page-header`, `.section-header`, etc.) and let CSS handle the sizing automatically. Manual sizing classes should only be used for special cases outside the standard structures.
