import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isExtractingPdf state
if "const [isExtractingPdf, setIsExtractingPdf] = useState(false);" not in content:
    content = content.replace(
        "const [pdfEdits, setPdfEdits] = useState({});",
        "const [pdfEdits, setPdfEdits] = useState({});\n  const [isExtractingPdf, setIsExtractingPdf] = useState(false);"
    )

# 2. Update the fetch block
old_fetch = """            try {
                const token = localStorage.getItem('nsg_jwt_token');
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/hr-portal/onboarding/extract-pdf-text', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    setPdfExtractedBlocks(data.blocks || []);
                    setPdfEdits({});
                }
            } catch (err) { console.error('Extraction failed', err); }"""

new_fetch = """            try {
                setIsExtractingPdf(true);
                const token = localStorage.getItem('nsg_jwt_token');
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/hr-portal/onboarding/extract-pdf-text', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    setPdfExtractedBlocks(data.blocks || []);
                    setPdfEdits({});
                }
            } catch (err) { 
                console.error('Extraction failed', err); 
            } finally {
                setIsExtractingPdf(false);
            }"""

content = content.replace(old_fetch, new_fetch)

# 3. Update the UI string
old_ui = "{pdfExtractedBlocks.length === 0 ? ("
new_ui = "{isExtractingPdf ? ("

content = content.replace(old_ui, new_ui)

old_ui2 = "<div style={{ fontSize: '12px', color: '#6b7280' }}>Extracting text...</div>"
new_ui2 = """<div style={{ fontSize: '12px', color: '#6b7280', padding: '10px', textAlign: 'center' }}>
                         Extracting text...
                     </div>
                 ) : pdfExtractedBlocks.length === 0 ? (
                     <div style={{ fontSize: '13px', color: '#ef4444', padding: '10px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                         <strong>No editable text found!</strong><br/>
                         This PDF appears to be a scanned image or photograph. The extraction engine cannot read text from flat images. Please upload a digitally generated PDF or a Word Document instead.
                     </div>"""

content = content.replace(old_ui2, new_ui2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed extraction UI logic")
