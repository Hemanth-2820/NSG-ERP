import re

file_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components\ceo\pages\Payroll\CeoPayroll.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add csvBoardEdits state
state_injection = """  const [docxPreviewUrl, setDocxPreviewUrl] = useState(null);
  const [csvBoardEdits, setCsvBoardEdits] = useState({});"""
content = content.replace("const [docxPreviewUrl, setDocxPreviewUrl] = useState(null);", state_injection)

# 2. Extract base values logic to a helper function
base_values_helper = """
  const getDocxBaseValues = () => {
    if (!selectedUser) return {};
    return {
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
  };
"""

# Replace the values block in getDocxPreview
preview_values_regex = r"const values = \{.*?payment_mode: paymentMethod \|\| ''\n    \};"
new_preview_values = """const values = { ...getDocxBaseValues(), ...csvBoardEdits };"""
content = re.sub(preview_values_regex, new_preview_values, content, flags=re.DOTALL)

# Inject base_values_helper before getDocxPreview
content = content.replace("const getDocxPreview = async () => {", base_values_helper + "\n  const getDocxPreview = async () => {")

# Update useEffect dependencies to include csvBoardEdits
content = content.replace("}, [workedDays, lopDays, paymentMethod, selectedUser, showModal]);", "}, [workedDays, lopDays, paymentMethod, selectedUser, showModal, csvBoardEdits]);")

# Update downloadPDF to use csvBoardEdits too
download_pdf_regex = r"const values = \{.*?payment_mode: paymentMethod \|\| ''\n          \};"
new_download_values = """const values = { ...getDocxBaseValues(), ...csvBoardEdits };"""
content = re.sub(download_pdf_regex, new_download_values, content, flags=re.DOTALL)

# 3. Add the CSV Board UI
csv_board_ui = """
                {docxMapping && (
                    <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#1e293b' }}>DOCX CSV Board (Mapped Fields)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {Object.keys(docxMapping).map(key => (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</label>
                                    <input 
                                        type="text" 
                                        style={{ padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                        value={csvBoardEdits[key] !== undefined ? csvBoardEdits[key] : (getDocxBaseValues()[key] || '')}
                                        onChange={e => setCsvBoardEdits(prev => ({ ...prev, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
"""

# Insert the CSV Board UI below the "Upload Custom Payslip Format" div
upload_custom_payslip_regex = r'(<label>Upload Custom Payslip Format \(\.docx only\)</label>\s*<input type="file" accept="\.docx" onChange=\{handleDocxTemplateUpload\} style=\{\{ width: \'100%\', fontSize: \'13px\' \}\} id="custom-template-upload" />\s*(?:\{hasCustomTemplate.*?\}\s*\)\}\s*)?</div>)'

content = re.sub(upload_custom_payslip_regex, r'\1\n' + csv_board_ui, content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected CSV Board successfully.")
