import glob
import re

html_files = glob.glob('*.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Simple replace logic specifically avoiding double adding
    
    # Nav and Headers
    content = content.replace('bg-background-dark/80 ', 'bg-white/80 dark:bg-background-dark/80 ')
    content = content.replace('bg-background-dark/95 ', 'bg-white/95 dark:bg-background-dark/95 ')
    content = content.replace('bg-background-dark/50 ', 'bg-white/50 dark:bg-background-dark/50 ')
    content = re.sub(r'(?<!dark:)bg-background-dark(?!/)', 'bg-background-light dark:bg-background-dark', content)
    
    # Surface Cards
    content = re.sub(r'(?<!dark:)bg-surface-dark', 'bg-white dark:bg-surface-dark', content)
    
    # Borders
    content = re.sub(r'(?<!dark:)border-border-dark', 'border-slate-200 dark:border-border-dark', content)
    content = re.sub(r'(?<!dark:)border-slate-800', 'border-slate-200 dark:border-slate-800', content)
    content = re.sub(r'(?<!dark:)border-slate-700', 'border-slate-200 dark:border-slate-700', content)
    
    # Grays and interactables
    content = re.sub(r'(?<!dark:)bg-slate-800', 'bg-slate-100 dark:bg-slate-800', content)
    content = re.sub(r'(?<!dark:)text-slate-400', 'text-slate-500 dark:text-slate-400', content)
    
    # Text-white to text-slate-900 dark:text-white EXCEPT when button/icons have bg-primary, bg-black, etc.
    # A bit risky, but let's do safe replacements for common headers and specific elements
    content = content.replace('text-white text-3xl font-bold', 'text-slate-900 dark:text-white text-3xl font-bold')
    content = content.replace('text-[32px] font-bold tracking-tight text-white', 'text-[32px] font-bold tracking-tight text-slate-900 dark:text-white')
    content = content.replace('text-sm font-semibold text-white', 'text-sm font-semibold text-slate-900 dark:text-white')
    content = content.replace('font-semibold text-white text-sm', 'font-semibold text-slate-900 dark:text-white text-sm')
    content = content.replace('text-slate-100 text-3xl font-bold', 'text-slate-900 dark:text-white text-3xl font-bold')
    
    # Fix the global body text color fallback if missing
    content = re.sub(r'body class="([^"]*)"', lambda m: f'body class="{m.group(1)}"' if 'text-slate-900' in m.group(1) else f'body class="text-slate-900 dark:text-slate-100 {m.group(1)}"', content)

    # Some assistant specific text
    content = content.replace('text-slate-100 text-lg font-semibold', 'text-slate-900 dark:text-slate-100 text-lg font-semibold')
    content = content.replace('text-slate-100 shadow-sm', 'text-slate-800 dark:text-slate-100 shadow-sm')
    
    # Fix some common overrides that might have doubled "dark:dark:"
    content = content.replace('dark:dark:', 'dark:')
    content = content.replace('bg-white dark:bg-white', 'bg-white dark:bg-surface-dark')
    content = content.replace('bg-background-light dark:bg-background-light', 'bg-background-light dark:bg-background-dark')

    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Patched {f}")
