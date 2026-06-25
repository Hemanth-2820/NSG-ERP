import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_vars = """
  const [currentUploadedFile, setCurrentUploadedFile] = useState(null);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isEditingPdf, setIsEditingPdf] = useState(false);
"""

pattern_state = r"(const \[offerPreviewHTML, setOfferPreviewHTML\] = useState\(''\);)"
if "const [currentUploadedFile" not in content:
    content = re.sub(pattern_state, r"\1" + state_vars, content)

# 2. Update handleOfferTemplateUpload to store the file
pattern_upload = r"(const file = e\.target\.files\[0\];\s*if \(file\) \{)"
replacement_upload = r"\1\n        setCurrentUploadedFile(file);"
if "setCurrentUploadedFile(file);" not in content:
    content = re.sub(pattern_upload, replacement_upload, content)

# 3. Add handlePdfEdit function
edit_func = """
  const handlePdfEdit = async () => {
    if (!currentUploadedFile || currentUploadedFile.type !== 'application/pdf') {
      notify('Find & Replace only works with PDF files.', 'error');
      return;
    }
    if (!findText) {
      notify('Please enter text to find.', 'error');
      return;
    }
    
    setIsEditingPdf(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const formData = new FormData();
      formData.append('file', currentUploadedFile);
      formData.append('search_text', findText);
      formData.append('replace_text', replaceText);
      
      const res = await fetch('/api/hr-portal/onboarding/edit-pdf-text', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to edit PDF');
      }
      
      const blob = await res.blob();
      const newFile = new File([blob], currentUploadedFile.name, { type: 'application/pdf' });
      setCurrentUploadedFile(newFile);
      
      // Re-trigger the render
      await handleOfferTemplateUpload({ target: { files: [newFile] } }, false);
      
      notify('PDF text replaced successfully!', 'success');
      setFindText('');
      setReplaceText('');
    } catch (error) {
      notify(`Error: ${error.message}`, 'error');
    } finally {
      setIsEditingPdf(false);
    }
  };
"""

if "const handlePdfEdit" not in content:
    # insert before const fetchGlobalOfferTemplate = async () => {
    content = re.sub(r"(const fetchGlobalOfferTemplate = async \(\) => \{)", edit_func + r"\n  \1", content)

# 4. Add Toolbar UI above the offerPreviewRef div
# Find: <div ref={offerPreviewRef}
ui_toolbar = """
              {currentUploadedFile && currentUploadedFile.type === 'application/pdf' && (
                <div style={{ width: '100%', maxWidth: '210mm', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                   <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Find & Replace (PDF Only):</div>
                   <input type="text" placeholder="Text to find" value={findText} onChange={(e) => setFindText(e.target.value)} style={{ padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1, minWidth: '120px' }} />
                   <input type="text" placeholder="Replace with" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} style={{ padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1, minWidth: '120px' }} />
                   <button onClick={handlePdfEdit} disabled={isEditingPdf} style={{ padding: '6px 12px', backgroundColor: isEditingPdf ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: isEditingPdf ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                     {isEditingPdf ? 'Replacing...' : 'Apply Replace'}
                   </button>
                </div>
              )}
"""

pattern_preview = r"(<div ref=\{offerPreviewRef\})"
if "Find & Replace (PDF Only):" not in content:
    content = re.sub(pattern_preview, ui_toolbar + r"\1", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
