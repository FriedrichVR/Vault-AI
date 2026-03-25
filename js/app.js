// Finance AI - Mobile MVP Main App script
document.addEventListener('DOMContentLoaded', () => {
    console.log('Finance AI Mobile App initialized.');
    
    // Auto highlight active nav link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            // Apply primary color to active link
            const spanIcon = link.querySelector('span.material-symbols-outlined');
            const spanText = link.querySelector('span.text-\\[10px\\]');
            
            if (spanIcon && !spanIcon.classList.contains('bg-primary')) {
                spanIcon.classList.remove('text-slate-500', 'text-slate-400');
                spanIcon.classList.add('text-primary');
                spanIcon.style.fontVariationSettings = "'FILL' 1";
            }
            if (spanText) {
                spanText.classList.remove('text-slate-500', 'text-slate-400');
                spanText.classList.add('text-primary');
            }
        }
    });

    // Current Date Display
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const aaaa = today.getFullYear();
        dateDisplay.innerText = `${dd}:${mm}:${aaaa}`;
    }

    // Chart Interaction Logic
    const chartTogglesContainer = document.getElementById('chart-toggles');
    const chartContainer = document.getElementById('chart-container');

    if (chartTogglesContainer && chartContainer) {
        const toggles = chartTogglesContainer.querySelectorAll('button');
        
        const chartData = {
            '1s': [
                { label: 'Lun', height: 35, active: false },
                { label: 'Mar', height: 60, active: false },
                { label: 'Mié', height: 40, active: false },
                { label: 'Jue', height: 85, active: true },
                { label: 'Vie', height: 50, active: false },
                { label: 'Sáb', height: 25, active: false },
                { label: 'Dom', height: 15, active: false }
            ],
            '1m': [
                { label: 'Sem 1', height: 45, active: false },
                { label: 'Sem 2', height: 80, active: false },
                { label: 'Sem 3', height: 50, active: false },
                { label: 'Sem 4', height: 95, active: true },
                { label: 'Sem 5', height: 30, active: false }
            ],
            '1a': [
                { label: 'Ene', height: 40, active: false },
                { label: 'Feb', height: 50, active: false },
                { label: 'Mar', height: 30, active: false },
                { label: 'Abr', height: 60, active: false },
                { label: 'May', height: 70, active: false },
                { label: 'Jun', height: 80, active: false },
                { label: 'Jul', height: 45, active: false },
                { label: 'Ago', height: 55, active: false },
                { label: 'Sep', height: 90, active: false },
                { label: 'Oct', height: 75, active: true },
                { label: 'Nov', height: 65, active: false },
                { label: 'Dic', height: 85, active: false }
            ]
        };

        const renderChart = (periodId) => {
            const data = chartData[periodId];
            if (!data) return;

            // Adjust outer container gap and sizes dynamically for 12 months
            if (data.length > 7) {
                chartContainer.className = 'flex items-end justify-between h-48 w-full gap-1 transition-opacity duration-300';
            } else {
                chartContainer.className = 'flex items-end justify-between h-48 w-full gap-2 transition-opacity duration-300';
            }

            // Fade out
            chartContainer.style.opacity = '0';
            
            setTimeout(() => {
                chartContainer.innerHTML = ''; // Clear current bars

                data.forEach(item => {
                    const col = document.createElement('div');
                    col.className = 'flex flex-col items-center justify-end flex-1 gap-2 h-full';
                    
                    const bar = document.createElement('div');
                    if (item.active) {
                        bar.className = 'w-full bg-primary rounded-md relative shadow-[0_0_20px_rgba(13,13,242,0.4)] z-10 transition-all duration-500 ease-out';
                    } else {
                        bar.className = 'w-full bg-[#1e1e2d] hover:bg-[#252538] transition-colors rounded-md relative transition-all duration-500 ease-out';
                    }
                    // start with height 0 for animation
                    bar.style.height = '0%';
                    
                    // Delay setting height to trigger CSS transition
                    setTimeout(() => {
                        bar.style.height = `${item.height}%`;
                    }, 50);

                    const textSize = data.length > 7 ? 'text-[8px]' : 'text-[10px]';

                    const labelSpan = document.createElement('span');
                    labelSpan.className = `${textSize} font-bold uppercase ${item.active ? 'text-primary' : 'text-slate-500'}`;
                    labelSpan.innerText = item.label;

                    col.appendChild(bar);
                    col.appendChild(labelSpan);
                    chartContainer.appendChild(col);
                });

                // Fade in
                chartContainer.style.opacity = '1';
            }, 300); // Wait for fade out
        };

        toggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = btn.getAttribute('data-period');
                if (!period) return;

                // Reset buttons state
                toggles.forEach(b => {
                    b.className = 'text-slate-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors';
                });
                
                // Set active state on clicked button
                btn.className = 'bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-[0_4px_10px_rgba(13,13,242,0.3)]';

                renderChart(period);
            });
        });
    }

});
