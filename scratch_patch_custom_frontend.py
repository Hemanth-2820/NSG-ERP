import re

file_path = "src/components/ceo/pages/Payroll/CeoPayroll.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state variables
state_vars_target = "const [hasMappedTemplate, setHasMappedTemplate] = useState(false);"
state_vars_repl = """const [hasMappedTemplate, setHasMappedTemplate] = useState(false);
  const [isMappingGlobal, setIsMappingGlobal] = useState(true);
  const [customFieldMappings, setCustomFieldMappings] = useState({});"""
if "const [isMappingGlobal" not in content:
    content = content.replace(state_vars_target, state_vars_repl)

# 2. Update handleTemplateUpload interception
old_intercept = """        if (file.type === 'application/pdf') {
          if (isGlobal) {
             const token = localStorage.getItem('nsg_jwt_token');
             const formData = new FormData();
             formData.append('file', file);
             const upRes = await fetch('/api/ceo-portal/payroll/upload-pdf-template', {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${token}` },
                 body: formData
             });
             if (upRes.ok) {
                 const pdfjsLib = await import('pdfjs-dist');
                 pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                 const page = await pdf.getPage(1); // Usually template is 1 page
                 
                 // Render at a fixed scale for mapping consistency
                 const scale = 1.5; 
                 const viewport = page.getViewport({ scale: scale });
                 const canvas = document.createElement('canvas');
                 const context = canvas.getContext('2d');
                 canvas.width = viewport.width;
                 canvas.height = viewport.height;
                 
                 await page.render({ canvasContext: context, viewport }).promise;
                 setMappingImage(canvas.toDataURL('image/jpeg', 0.8));
                 
                 setPdfScale(scale);
                 setFieldMappings({});
                 setShowMappingModal(true);
                 setLoading(false);
                 e.target.value = null;
                 return;
             }
          }"""

new_intercept = """        if (file.type === 'application/pdf') {
             setIsMappingGlobal(isGlobal);
             setLoading(true);
             
             if (isGlobal) {
                 const token = localStorage.getItem('nsg_jwt_token');
                 const formData = new FormData();
                 formData.append('file', file);
                 const upRes = await fetch('/api/ceo-portal/payroll/upload-pdf-template', {
                     method: 'POST',
                     headers: { 'Authorization': `Bearer ${token}` },
                     body: formData
                 });
                 if (!upRes.ok) {
                     setLoading(false);
                     setNotification({ msg: 'Failed to upload global PDF template', type: 'error' });
                     return;
                 }
             } else {
                 setOriginalPdfFile(file);
                 setCurrentPdfFile(file);
                 setHasCustomTemplate(true);
                 setCustomHtmlContent('');
             }
             
             try {
                 const pdfjsLib = await import('pdfjs-dist');
                 pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                 const page = await pdf.getPage(1);
                 
                 const scale = 1.5; 
                 const viewport = page.getViewport({ scale: scale });
                 const canvas = document.createElement('canvas');
                 const context = canvas.getContext('2d');
                 canvas.width = viewport.width;
                 canvas.height = viewport.height;
                 
                 await page.render({ canvasContext: context, viewport }).promise;
                 setMappingImage(canvas.toDataURL('image/jpeg', 0.8));
                 
                 setPdfScale(scale);
                 setFieldMappings({}); // Start fresh
                 setShowMappingModal(true);
                 setLoading(false);
                 e.target.value = null;
                 return;
             } catch (err) {
                 console.error(err);
                 setLoading(false);
                 setNotification({ msg: 'Error parsing PDF for mapping', type: 'error' });
                 return;
             }
"""
content = content.replace(old_intercept, new_intercept)


# 3. Update handleSaveMapping to handle custom saving
old_save = """  const handleSaveMapping = async () => {
      try {
          setLoading(true);
          const token = localStorage.getItem('nsg_jwt_token');
          const res = await fetch('/api/ceo-portal/payroll/save-pdf-mapping', {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ mapping: fieldMappings })
          });
          if (res.ok) {
              // Now we can use normal notification instead of showNotification if we want, but showNotification is here
              setNotification({ msg: 'PDF Mapping Saved Successfully!', type: 'success' });
              setTimeout(() => setNotification(null), 3000);
              setShowMappingModal(false);
              setHasMappedTemplate(true);
          } else {
              setNotification({ msg: 'Failed to save mapping', type: 'error' });
              setTimeout(() => setNotification(null), 3000);
          }
      } catch (e) {
          setNotification({ msg: 'Error saving mapping', type: 'error' });
          setTimeout(() => setNotification(null), 3000);
      } finally {
          setLoading(false);
      }
  };"""

new_save = """  const handleSaveMapping = async () => {
      if (isMappingGlobal) {
          try {
              setLoading(true);
              const token = localStorage.getItem('nsg_jwt_token');
              const res = await fetch('/api/ceo-portal/payroll/save-pdf-mapping', {
                  method: 'POST',
                  headers: { 
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ mapping: fieldMappings })
              });
              if (res.ok) {
                  setNotification({ msg: 'PDF Mapping Saved Successfully!', type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                  setShowMappingModal(false);
                  setHasMappedTemplate(true);
              } else {
                  setNotification({ msg: 'Failed to save mapping', type: 'error' });
                  setTimeout(() => setNotification(null), 3000);
              }
          } catch (e) {
              setNotification({ msg: 'Error saving mapping', type: 'error' });
              setTimeout(() => setNotification(null), 3000);
          } finally {
              setLoading(false);
          }
      } else {
          // Custom mapping, just save to state
          setCustomFieldMappings(fieldMappings);
          setShowMappingModal(false);
          setNotification({ msg: 'Custom Template Mapping Saved locally!', type: 'success' });
          setTimeout(() => setNotification(null), 3000);
      }
  };"""
content = content.replace(old_save, new_save)


# 4. Modify downloadPDF and processPayment logic
# It currently intercepts `downloadPDF` by checking `hasMappedTemplate`.
# We need to intercept BOTH Global and Custom mapping downloads.
# In downloadPreview, we just use downloadPDF.
download_target = """  const downloadPDF = async (record) => {
    try {
      if (hasMappedTemplate) {"""

download_repl = """  const downloadPDF = async (record) => {
    try {
      const payload = {
          ...record,
          month: month,
          year: year
      };
      
      // If Custom PDF is mapped
      if (currentPdfFile && Object.keys(customFieldMappings).length > 0) {
          showNotification(`Generating custom mapped PDF for ${record.employee_name}...`, 'info');
          const token = localStorage.getItem('nsg_jwt_token');
          const formData = new FormData();
          formData.append('file', currentPdfFile);
          formData.append('mapping', JSON.stringify(customFieldMappings));
          formData.append('data', JSON.stringify(payload));
          
          const res = await fetch('/api/ceo-portal/payroll/generate-custom-mapped-pdf', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
          });
          if (!res.ok) throw new Error('Failed to generate custom mapped PDF');
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Payslip_${record.employee_name}_${month}_${year}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showNotification(`Downloaded PDF for ${record.employee_name}`, 'success');
          return;
      }
      
      if (hasMappedTemplate) {"""
content = content.replace(download_target, download_repl)

# 5. Hide CSV Board when Custom PDF is mapped
# Around line 1420 (CSV Board Right Panel)
# `if (currentPdfFile && Object.keys(customFieldMappings).length === 0)`
csv_board_target = """              {/* CSV Board Right Panel */}
              {currentPdfFile && ("""
csv_board_repl = """              {/* CSV Board Right Panel */}
              {currentPdfFile && Object.keys(customFieldMappings).length === 0 && ("""
content = content.replace(csv_board_target, csv_board_repl)


# 6. Show Custom mapped success message instead of CSV board
csv_board_close = """                 </button>
              </div>
              )}
              </div>"""
csv_board_close_repl = """                 </button>
              </div>
              )}
              {currentPdfFile && Object.keys(customFieldMappings).length > 0 && (
              <div style={{ flex: '0 0 35%', backgroundColor: '#f0fdf4', border: '1px solid #4ade80', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h3 style={{ color: '#166534', marginBottom: '8px' }}>Custom Template Mapped Successfully!</h3>
                  <p style={{ color: '#15803d', textAlign: 'center', fontSize: '14px' }}>Click "Download Preview" or "Process to Pay" to generate the final PDF.</p>
                  <button className="ceo-btn" onClick={() => {
                     setFieldMappings(customFieldMappings);
                     setIsMappingGlobal(false);
                     setShowMappingModal(true);
                  }} style={{ marginTop: '16px', backgroundColor: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                     Edit Mapping
                  </button>
              </div>
              )}
              </div>"""
content = content.replace(csv_board_close, csv_board_close_repl)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
