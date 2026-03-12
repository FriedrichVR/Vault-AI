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
});
