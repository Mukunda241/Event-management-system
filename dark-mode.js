// Dark Mode Functionality
// Handles theme switching and persistence

(function() {
    'use strict';

    // Get saved theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme immediately to prevent flash
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Add no-transition class temporarily to prevent animation on load
    document.documentElement.classList.add('no-transition');
    
    // Remove no-transition class after a brief moment
    setTimeout(() => {
        document.documentElement.classList.remove('no-transition');
    }, 100);

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Create dark mode toggle button
        createDarkModeToggle();
        
        // Set initial theme
        setTheme(savedTheme);
    });

    function createDarkModeToggle() {
        // Check if toggle already exists in the header navigation
        const existingToggle = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle');
        if (existingToggle) {
            // Use existing toggle from header
            existingToggle.addEventListener('click', toggleTheme);
            return;
        }

        // Only create a new toggle if one doesn't exist (fallback for pages without header)
        if (document.querySelector('.dark-mode-toggle')) return;

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.setAttribute('title', 'Toggle dark/light mode');
        
        // Add icons (sun and moon)
        toggle.innerHTML = `
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;
        
        // Add click event
        toggle.addEventListener('click', toggleTheme);
        
        // Add to page
        document.body.appendChild(toggle);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        setTheme(newTheme);
        showThemeToast(newTheme);
    }

    function setTheme(theme) {
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update meta theme-color for mobile browsers
        updateMetaThemeColor(theme);
        
        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    function updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Set color based on theme
        metaThemeColor.content = theme === 'dark' ? '#0f3460' : '#0073e6';
    }

    function showThemeToast(theme) {
        // Remove existing toast if any
        const existingToast = document.getElementById('theme-toast');
        if (existingToast) existingToast.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.id = 'theme-toast';
        toast.className = 'toast';
        
        const icon = theme === 'dark' ? '🌙' : '☀️';
        const message = theme === 'dark' ? 'Dark Mode Enabled' : 'Light Mode Enabled';
        
        toast.innerHTML = `${icon} ${message}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 110px;
            right: 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            font-size: 0.95rem;
            animation: slideInUp 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Add animations for toast
    if (!document.getElementById('theme-toast-animations')) {
        const style = document.createElement('style');
        style.id = 'theme-toast-animations';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes slideOutDown {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Expose setTheme function globally
    window.setTheme = setTheme;
    
    // Listen for system theme changes (optional)
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        darkModeQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
})();
