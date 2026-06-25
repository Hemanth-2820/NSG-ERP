import re

file_path = r"src\components\ceo\pages\Payroll\CeoPayroll.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State variables
state_vars = """
  const [currentPdfFile, setCurrentPdfFile] = useState(null);
  const [pdfExtractedBlocks, setPdfExtractedBlocks] = useState([]);
  const [pdfEdits, setPdfEdits] = useState({});
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const [showDocxPreviewModal, setShowDocxPreviewModal] = useState(false);
  const [docxExtractedBlocks, setDocxExtractedBlocks] = useState([]);
  const [docxEdits, setDocxEdits] = useState({});
  const [isExtractingDocx, setIsExtractingDocx] = useState(false);
"""
if "const [currentPdfFile" not in content:
    content = re.sub(r"(const \[notification, setNotification\] = useState\(null\);)", r"\1\n" + state_vars, content)

# 2. Extract PDF text logic in handleTemplateUpload
pdf_extract_logic = """
        if (file.type === 'application/pdf') {
          if (!isGlobal) {
            setCurrentPdfFile(file);
            setIsExtractingPdf(true);
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
            finally { setIsExtractingPdf(false); }
          }
"""
content = content.replace("if (file.type === 'application/pdf') {", pdf_extract_logic)

# 3. Rename downloadDocx to previewDocx and add handleDocxDownload and handleBatchPdfEdit
funcs = """
  const handleBatchPdfEdit = async () => {
    if (!currentPdfFile) return;
    
    const replacements = [];
    pdfExtractedBlocks.forEach((block, idx) => {
        if (pdfEdits[idx] !== undefined && pdfEdits[idx] !== block) {
            replacements.push({ search: block, replace: pdfEdits[idx] });
        }
    });

    if (replacements.length === 0) {
        showNotification('No changes made in the CSV board.', 'info');
        return;
    }

    setIsEditingPdf(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const formData = new FormData();
      formData.append('file', currentPdfFile);
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
      const newFile = new File([blob], currentPdfFile.name, { type: 'application/pdf' });
      
      await handleTemplateUpload({ target: { files: [newFile] } }, false);
      
      showNotification(`Successfully applied ${replacements.length} updates!`, 'success');
    } catch (error) {
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setIsEditingPdf(false);
    }
  };

  const previewDocx = async () => {
    showNotification('Extracting DOCX Payslip...', 'info');
    setIsExtractingDocx(true);
    setShowDocxPreviewModal(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const payload = {
        employee_id: String(selectedUser.employee_id),
        employee_name: selectedUser.employee_name,
        month: String(month),
        year: String(year),
        basic: selectedUser.basic || 0,
        hra: selectedUser.hra || 0,
        allowances: (selectedUser.allowances || 0) + (selectedUser.bonus || 0),
        epf: selectedUser.epf || 0,
        tds: selectedUser.tds || 0,
        lop: selectedUser.lop || 0,
        net: selectedUser.net || 0,
        worked_days: parseFloat(workedDays) || 22,
        arrear_days: parseFloat(arrearDays) || 0,
        lop_days: parseFloat(lopDays) || 0,
        pf_number: selectedUser.pf_number || '',
        uan: selectedUser.uan || '',
        esi_number: selectedUser.esi_number || '',
        pan_number: selectedUser.pan_number || '',
        designation: selectedUser.role || '',
        location: selectedUser.location || ''
      };
      
      const res = await fetch('/api/ceo-portal/payroll/preview-docx-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
         const data = await res.json();
         setDocxExtractedBlocks(data.blocks || []);
         setDocxEdits({});
      }
    } catch(err) {
      console.error(err);
      showNotification(`Failed: ${err.message}`, 'error');
    } finally {
      setIsExtractingDocx(false);
    }
  };

  const handleDocxDownload = async () => {
    showNotification('Applying Edits & Generating DOCX...', 'info');
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const payload = {
        employee_id: String(selectedUser.employee_id),
        employee_name: selectedUser.employee_name,
        month: String(month),
        year: String(year),
        basic: selectedUser.basic || 0,
        hra: selectedUser.hra || 0,
        allowances: (selectedUser.allowances || 0) + (selectedUser.bonus || 0),
        epf: selectedUser.epf || 0,
        tds: selectedUser.tds || 0,
        lop: selectedUser.lop || 0,
        net: selectedUser.net || 0,
        worked_days: parseFloat(workedDays) || 22,
        arrear_days: parseFloat(arrearDays) || 0,
        lop_days: parseFloat(lopDays) || 0,
        pf_number: selectedUser.pf_number || '',
        uan: selectedUser.uan || '',
        esi_number: selectedUser.esi_number || '',
        pan_number: selectedUser.pan_number || '',
        designation: selectedUser.role || '',
        location: selectedUser.location || '',
        edits: docxEdits
      };
      
      const res = await fetch('/api/ceo-portal/payroll/generate-edited-docx', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to generate DOCX');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${selectedUser.employee_name}_${month}_${year}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('DOCX Generated Successfully!', 'success');
      setShowDocxPreviewModal(false);
    } catch(err) {
      console.error(err);
      showNotification(`Failed: ${err.message}`, 'error');
    }
  };

  const processPayment = async () => {
"""

if "const previewDocx = async () => {" not in content:
    # Remove old downloadDocx
    import re
    content = re.sub(r"const downloadDocx = async \(\) => \{[\s\S]*?const processPayment = async \(\) => \{", funcs, content)


# 4. Modify UI to use previewDocx instead of downloadDocx
content = content.replace("onClick={downloadDocx}", "onClick={previewDocx}")

# 5. Clear currentPdfFile on remove template
if "setCurrentPdfFile(null);" not in content:
    content = content.replace("setHasCustomTemplate(false);", "setHasCustomTemplate(false);\n    setCurrentPdfFile(null);")


# 6. UI adjustments for PDF CSV Board
# We need to wrap the Right Column 
# find: {/* Right Column: Live PDF WYSIWYG Editor */} \n              <div style={{ flex: '1'
# replace with: <div style={{ flex: '1', display: 'flex', gap: '24px' }}> \n <div style={{ flex: currentPdfFile ? '0 0 65%' : '1'

pattern_right = r"(<div style=\{\{\s*flex:\s*'1',\s*backgroundColor:\s*'#e2e8f0',\s*padding:\s*'24px',\s*borderRadius:\s*'8px',\s*overflowY:\s*'auto',\s*maxHeight:\s*'70vh',\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*alignItems:\s*'center'\s*\}\}>)"

replacement_right = r"""<div style={{ flex: '1', display: 'flex', gap: '24px' }}>
              <div style={{ flex: currentPdfFile ? '0 0 65%' : '1', backgroundColor: '#e2e8f0', padding: '24px', borderRadius: '8px', overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>"""

if "currentPdfFile ?" not in content:
    content = re.sub(pattern_right, replacement_right, content)

# 7. Close the div and append the CSV board
# find: </div> \n            </div> \n          </div> \n        </div> \n      )} \n    </div> \n  ); \n}
# The structure is:
#               </div> (closes wysiwyg)
#             </div> (closes modal-body)
#           </div> (closes modal)
#         </div> (closes modal-overlay)

csv_board_ui = """
              </div>
              
              {/* CSV Board Right Panel */}
              {currentPdfFile && (
              <div className="custom-scroll" style={{ flex: '0 0 35%', overflowY: 'auto', maxHeight: '70vh', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column' }}>
                 <h3 style={{ fontSize: '15px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>CSV Board (Text Extracted from PDF)</h3>
                 {isExtractingPdf ? (
                     <div style={{ fontSize: '12px', color: '#6b7280', padding: '10px', textAlign: 'center' }}>
                         Extracting text...
                     </div>
                 ) : pdfExtractedBlocks.length === 0 ? (
                     <div style={{ fontSize: '13px', color: '#ef4444', padding: '10px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                         <strong>No editable text found!</strong>
                     </div>
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
"""

# Wait, the end of wysiwyg editor is after the closing table:
#                   </table>
#                 </div>
#               </div>

content = content.replace("                  </table>\n                </div>\n              </div>", "                  </table>\n                </div>\n" + csv_board_ui)


# 8. DOCX Preview Modal UI
docx_modal_ui = """
      {showDocxPreviewModal && (
        <div className="ceo-modal-overlay" style={{ alignItems: 'center', zIndex: 10000 }}>
          <div className="ceo-modal" style={{ width: '600px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✏️ Edit DOCX Payslip Content
              </h3>
              <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px' }} onClick={() => setShowDocxPreviewModal(false)}>✕</button>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9fafb', padding: '24px', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '15px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>DOCX CSV Board (Paragraphs)</h3>
               {isExtractingDocx ? (
                   <div style={{ fontSize: '12px', color: '#6b7280', padding: '10px', textAlign: 'center' }}>
                       Extracting text...
                   </div>
               ) : docxExtractedBlocks.length === 0 ? (
                   <div style={{ fontSize: '13px', color: '#ef4444', padding: '10px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                       <strong>No text found!</strong>
                   </div>
               ) : (
                   docxExtractedBlocks.map((block, idx) => (
                      <div key={idx} style={{ marginBottom: '12px' }}>
                         <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Original: {block}</label>
                         <textarea 
                            rows={2}
                            value={docxEdits[idx] !== undefined ? docxEdits[idx] : block}
                            onChange={(e) => setDocxEdits({...docxEdits, [idx]: e.target.value})}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
                         />
                      </div>
                   ))
               )}
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button onClick={() => setShowDocxPreviewModal(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
               <button onClick={handleDocxDownload} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Apply Edits & Download</button>
            </div>
          </div>
        </div>
      )}
"""
if "showDocxPreviewModal && (" not in content:
    content = content.replace("{/* Payment Modal */}", docx_modal_ui + "\n      {/* Payment Modal */}")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected CSV Boards!")
