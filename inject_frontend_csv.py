import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State vars
state_vars = """
  const [pdfExtractedBlocks, setPdfExtractedBlocks] = useState([]);
  const [pdfEdits, setPdfEdits] = useState({});
"""
if "const [pdfExtractedBlocks" not in content:
    content = re.sub(r"(const \[currentUploadedFile, setCurrentUploadedFile\] = useState\(null\);)", r"\1\n" + state_vars, content)

# 2. Extract logic in handleOfferTemplateUpload
extract_logic = """
        if (file.type === 'application/pdf') {
            try {
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
            } catch (err) { console.error('Extraction failed', err); }
"""
content = content.replace("if (file.type === 'application/pdf') {", extract_logic)

# 3. handleBatchPdfEdit function
batch_func = """
  const handleBatchPdfEdit = async () => {
    if (!currentUploadedFile) return;
    
    const replacements = [];
    pdfExtractedBlocks.forEach((block, idx) => {
        if (pdfEdits[idx] !== undefined && pdfEdits[idx] !== block) {
            replacements.push({ search: block, replace: pdfEdits[idx] });
        }
    });

    if (replacements.length === 0) {
        notify('No changes made in the CSV board.', 'info');
        return;
    }

    setIsEditingPdf(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const formData = new FormData();
      formData.append('file', currentUploadedFile);
      formData.append('replacements', JSON.stringify(replacements));
      
      const res = await fetch('/api/hr-portal/onboarding/batch-edit-pdf-text', {
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
      
      await handleOfferTemplateUpload({ target: { files: [newFile] } }, false);
      
      notify(`Successfully applied ${replacements.length} updates!`, 'success');
    } catch (error) {
      notify(`Error: ${error.message}`, 'error');
    } finally {
      setIsEditingPdf(false);
    }
  };
"""
if "const handleBatchPdfEdit" not in content:
    content = re.sub(r"(const handlePdfEdit = async \(\) => \{)", batch_func + r"\n  \1", content)

# 4. Wrap the custom-scroll div in the flex row
# Find: <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto'
pattern_scroll = r'(<div className="custom-scroll" style=\{\{\s*flex:\s*1,\s*overflowY:\s*\'auto\'.*?backgroundColor:\s*\'#e5e7eb\'.*?\}\})'
replacement_scroll = r"""
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', height: 'calc(100vh - 200px)' }}>
              <div className="custom-scroll" style={{ flex: currentUploadedFile && currentUploadedFile.type === 'application/pdf' ? '0 0 65%' : 1, overflowY: 'auto', backgroundColor: '#e5e7eb', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
"""
content = re.sub(pattern_scroll, replacement_scroll, content, count=1)

# We need to find the end of that custom-scroll div and close the new flex row wrapper and add the CSV board.
# Look for: <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '14px' }}>
# This is right after the custom-scroll div ends.
csv_board_ui = """
              {currentUploadedFile && currentUploadedFile.type === 'application/pdf' && (
              <div className="custom-scroll" style={{ flex: '0 0 35%', overflowY: 'auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column' }}>
                 <h3 style={{ fontSize: '15px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>CSV Board (Text Extracted from PDF)</h3>
                 {pdfExtractedBlocks.length === 0 ? (
                     <div style={{ fontSize: '12px', color: '#6b7280' }}>Extracting text...</div>
                 ) : (
                     pdfExtractedBlocks.map((block, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                           <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Original: {block}</label>
                           <textarea 
                              rows={2}
                              value={pdfEdits[idx] !== undefined ? pdfEdits[idx] : block}
                              onChange={(e) => setPdfEdits({...pdfEdits, [idx]: e.target.value})}
                              style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
                           />
                        </div>
                     ))
                 )}
                 <button 
                    onClick={handleBatchPdfEdit} 
                    disabled={isEditingPdf}
                    style={{ marginTop: '20px', padding: '10px', backgroundColor: isEditingPdf ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: isEditingPdf ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                 >
                    {isEditingPdf ? 'Applying Updates...' : 'Apply All Updates to PDF'}
                 </button>
              </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '14px' }}>
"""

content = content.replace("<div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '14px' }}>", csv_board_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected CSV board UI")
