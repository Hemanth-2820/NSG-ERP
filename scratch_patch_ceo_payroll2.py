import re

file_path = "src/components/ceo/pages/Payroll/CeoPayroll.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state variables
state_vars = """
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingImage, setMappingImage] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({});
  const [selectedField, setSelectedField] = useState('employee_name');
  const [hasMappedTemplate, setHasMappedTemplate] = useState(false);
  const [pdfScale, setPdfScale] = useState(1);

  const MAPPABLE_FIELDS = [
    { id: 'employee_name', label: 'Employee Name' },
    { id: 'employee_id', label: 'Employee ID' },
    { id: 'designation', label: 'Designation' },
    { id: 'month_year', label: 'Month & Year' },
    { id: 'basic', label: 'Basic' },
    { id: 'hra', label: 'HRA' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'bonus', label: 'Bonus' },
    { id: 'epf', label: 'EPF' },
    { id: 'tds', label: 'TDS' },
    { id: 'lop', label: 'LOP' },
    { id: 'net', label: 'Net Pay' },
    { id: 'net_words', label: 'Net Pay (Words)' }
  ];
"""
content = content.replace("const [notification, setNotification] = useState(null);", "const [notification, setNotification] = useState(null);\n" + state_vars)


# 2. Add fetch template mapping
fetch_mapping = """
  const fetchPdfTemplateInfo = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/ceo-portal/payroll/pdf-template-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHasMappedTemplate(data.exists);
        if (data.exists && data.mapping) {
            setFieldMappings(data.mapping);
        }
      }
    } catch (e) {
      console.error("Failed to fetch PDF template info", e);
    }
  };
"""
content = content.replace("const fetchGlobalTemplate = async () => {", fetch_mapping + "\n  const fetchGlobalTemplate = async () => {")

content = content.replace("fetchGlobalTemplate();", "fetchGlobalTemplate();\n    fetchPdfTemplateInfo();")

# 3. Intercept global PDF upload
upload_intercept_target = """        if (file.type === 'application/pdf') {"""
upload_intercept_repl = """        if (file.type === 'application/pdf') {
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
          }
"""
content = content.replace(upload_intercept_target, upload_intercept_repl)


# 4. Save mapping logic
save_mapping = """
  const handleSaveMapping = async () => {
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
  };
"""
content = content.replace("const clearCustomTemplate = () => {", save_mapping + "\n  const clearCustomTemplate = () => {")


# 5. Modify downloadPDF
download_target = """  const downloadPDF = async (record) => {
    try {
      if (record.custom_payslip_html) {"""
download_repl = """  const downloadPDF = async (record) => {
    try {
      if (hasMappedTemplate) {
        showNotification(`Generating mapped PDF for ${record.employee_name}...`, 'info');
        const token = localStorage.getItem('nsg_jwt_token');
        const payload = {
            ...record,
            month: month,
            year: year
        };
        const res = await fetch('/api/ceo-portal/payroll/generate-mapped-pdf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to generate mapped PDF');
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
      } else if (record.custom_payslip_html) {"""
content = content.replace(download_target, download_repl)

# 6. Add mapping modal UI to render
modal_ui = """
      {showMappingModal && (
        <div className="ceo-modal-overlay">
          <div className="ceo-modal" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ceo-modal-header">
              <h2>Map PDF Coordinates</h2>
              <button onClick={() => setShowMappingModal(false)} className="close-btn"><X size={20}/></button>
            </div>
            <div className="ceo-modal-body">
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>
                            Select a field from the dropdown, then click on the PDF where the value should appear.
                        </p>
                        <select 
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
                        >
                            {MAPPABLE_FIELDS.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.label} {fieldMappings[f.id] ? '(Mapped)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="ceo-btn ceo-btn-primary" onClick={handleSaveMapping}>Save Mapping</button>
                </div>
                
                <div style={{ position: 'relative', border: '1px solid #e2e8f0', display: 'inline-block', backgroundColor: '#f8fafc' }}>
                    <img 
                        src={mappingImage} 
                        alt="PDF Template Preview" 
                        style={{ display: 'block', maxWidth: '100%' }} 
                        onClick={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            const displayRatioX = e.target.naturalWidth / rect.width;
                            const displayRatioY = e.target.naturalHeight / rect.height;
                            
                            const clickX = (e.clientX - rect.left) * displayRatioX;
                            const clickY = (e.clientY - rect.top) * displayRatioY;
                            
                            const pdfX = clickX / pdfScale;
                            const pdfY = clickY / pdfScale;
                            
                            setFieldMappings(prev => ({
                                ...prev,
                                [selectedField]: { x: pdfX, y: pdfY, fontSize: 10 }
                            }));
                        }}
                    />
                    
                    {Object.entries(fieldMappings).map(([key, coords]) => {
                        const fieldDef = MAPPABLE_FIELDS.find(f => f.id === key);
                        if (!fieldDef) return null;
                        
                        return (
                            <div 
                                key={key}
                                title={fieldDef.label}
                                style={{
                                    position: 'absolute',
                                    top: `${coords.y * pdfScale}px`,
                                    left: `${coords.x * pdfScale}px`,
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: 'red',
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 0 2px white'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                                    backgroundColor: 'black', color: 'white', padding: '2px 6px', borderRadius: '4px',
                                    fontSize: '10px', whiteSpace: 'nowrap'
                                }}>
                                    {fieldDef.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>
      )}
"""
target_return = """  return (
    <div className="ceo-payroll-container">"""

content = content.replace(target_return, modal_ui + "\n" + target_return)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
