import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"\{currentUploadedFile && currentUploadedFile\.type === 'application/pdf' && \(\s*<div style=\{\{ width: '100%', maxWidth: '210mm', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 2px 4px rgba\(0,0,0,0\.05\)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' \}\}>\s*<div style=\{\{ fontSize: '13px', fontWeight: 'bold', color: 'var\(--text-primary\)' \}\}>Find & Replace \(PDF Only\):</div>\s*<input type=\"text\" placeholder=\"Text to find\" value=\{findText\} onChange=\{\(e\) => setFindText\(e\.target\.value\)\} style=\{\{ padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1, minWidth: '120px' \}\} />\s*<input type=\"text\" placeholder=\"Replace with\" value=\{replaceText\} onChange=\{\(e\) => setReplaceText\(e\.target\.value\)\} style=\{\{ padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1, minWidth: '120px' \}\} />\s*<button onClick=\{handlePdfEdit\} disabled=\{isEditingPdf\} style=\{\{ padding: '6px 12px', backgroundColor: isEditingPdf \? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: isEditingPdf \? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' \}\}>\s*\{isEditingPdf \? 'Replacing\.\.\.' : 'Apply Replace'\}\s*</button>\s*</div>\s*\)\}"

content = re.sub(pattern, "", content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed toolbar")
