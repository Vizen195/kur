(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);

    function updateChartDefaults(theme) {
        if (typeof Chart !== 'undefined') {
            const isDark = theme === 'dark';
            Chart.defaults.color = isDark ? '#a1a1aa' : '#64748b';
            Chart.defaults.borderColor = isDark ? '#27272a' : '#e4e4e7';
        }
    }

    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme);
        updateChartDefaults(newTheme);
        
        // Update Chart if present
        if (typeof window.renderMainChart === 'function' && typeof getItems === 'function') {
            const select = document.getElementById("chartPeriodSelect");
            const daysCount = select ? parseInt(select.value, 10) : 7;
            window.renderMainChart(getItems(), daysCount);
        } else if (window.location.href.includes('stats.html')) {
            window.location.reload();
        } else if (typeof window.renderChart === 'function') {
            window.renderChart();
        }
    };

    window.updateThemeIcon = function(theme) {
        document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        updateThemeIcon(theme);
        updateChartDefaults(theme);
    });
})();
