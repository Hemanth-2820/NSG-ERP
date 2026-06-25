import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make DOCX uploads contentEditable
pattern = r"(pagesHtml = data\.html \|\| \"<div>Failed to convert document</div>\";)"
replacement = r'pagesHtml = data.html ? `<div contentEditable="true" style="outline: none; padding: 20px;">${data.html}</div>` : "<div>Failed to convert document</div>";'

if 'pagesHtml = data.html ? `<div contentEditable="true"' not in content:
    content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
