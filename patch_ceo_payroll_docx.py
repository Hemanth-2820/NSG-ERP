import re

file_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components\ceo\pages\Payroll\CeoPayroll.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add fetchDocxTemplateInfo
if "fetchDocxTemplateInfo" not in content:
    fetch_info = """
  const fetchDocxTemplateInfo = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/ceo-portal/payroll/template/docx/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
            setDocxMapping(data.mapping);
            setHasMappedTemplate(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch DOCX template info", e);
    }
  };
"""
    content = content.replace("fetchPdfTemplateInfo();", "fetchPdfTemplateInfo();\n    fetchDocxTemplateInfo();")
    content = content.replace("const fetchGlobalTemplate = async () => {", fetch_info + "\n  const fetchGlobalTemplate = async () => {")

# Replace handleDocxTemplateUpload
upload_func = """
  const handleDocxTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const token = localStorage.getItem('nsg_jwt_token');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/ceo-portal/payroll/template/docx/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setDocxMapping(data.mapping);
          showNotification('DOCX Template Uploaded Successfully!', 'success');
        } else {
          showNotification('Failed to upload DOCX template', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Error uploading document', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const getDocxPreview = async () => {
    if (!selectedUser) return;
    
    // Construct values dict for the preview
    const values = {
        employee_name: selectedUser.employee_name,
        employee_id: selectedUser.employee_id,
        department: selectedUser.department || '',
        designation: selectedUser.role || '',
        month: `${month}`,
        month_year: `${month}/${year}`,
        working_days: workedDays || 22,
        paid_days: 22 - parseFloat(lopDays || 0),
        basic: selectedUser.basic || 0,
        hra: selectedUser.hra || 0,
        allowances: selectedUser.allowances || 0,
        bonus: selectedUser.bonus || 0,
        gross: (selectedUser.basic || 0) + (selectedUser.hra || 0) + (selectedUser.allowances || 0) + (selectedUser.bonus || 0),
        epf: selectedUser.epf || 0,
        tds: selectedUser.tds || 0,
        lop: selectedUser.lop || 0,
        net: selectedUser.net || 0,
        amount_words: numberToWords(selectedUser.net || 0),
        bank: selectedUser.bank_name || '',
        account_number: selectedUser.account_number || '',
        ifsc: selectedUser.ifsc_code || '',
        payment_mode: paymentMethod || ''
    };

    try {
        const token = localStorage.getItem('nsg_jwt_token');
        const res = await fetch('/api/ceo-portal/payroll/template/docx/preview', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values })
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setDocxPreviewUrl(url);
        } else {
            showNotification('Failed to generate preview', 'error');
        }
    } catch (err) {
        console.error(err);
    }
  };

  // Debounced preview update when values change
  useEffect(() => {
     if (docxMapping && selectedUser && showModal) {
         const timer = setTimeout(() => {
             getDocxPreview();
         }, 800);
         return () => clearTimeout(timer);
     }
  }, [workedDays, lopDays, paymentMethod, selectedUser, showModal]);
"""
content = re.sub(r'const handleDocxTemplateUpload.*?};\n', upload_func, content, flags=re.DOTALL)

# Replace the input element for DOCX upload to use the right handler
content = content.replace(
    '<input type="file" onChange={(e) => handleTemplateUpload(e, false)} style={{ width: \'100%\', fontSize: \'13px\', marginBottom: hasCustomTemplate ? \'8px\' : \'0\' }} id="custom-template-upload" />',
    '<input type="file" accept=".docx" onChange={handleDocxTemplateUpload} style={{ width: \'100%\', fontSize: \'13px\' }} id="custom-template-upload" />'
)
content = content.replace('Upload Custom Payslip Format (Any File)', 'Upload Custom Payslip Format (.docx only)')

# Change the Right Column to show the Preview PDF if docxPreviewUrl is available
preview_code = """
              {docxPreviewUrl ? (
                <div style={{ width: '100%', height: '70vh', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe src={`${docxPreviewUrl}#view=FitH`} style={{ width: '100%', height: '100%', border: 'none' }} title="Live Preview" />
                </div>
              ) : hasCustomTemplate ? (
"""
content = content.replace("{hasCustomTemplate ? (", preview_code)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched CeoPayroll.jsx")
