file_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components\ceo\pages\Payroll\CeoPayroll.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State Injection
state_injection = """  const [docxPreviewUrl, setDocxPreviewUrl] = useState(null);
  const [csvBoardEdits, setCsvBoardEdits] = useState({});"""
content = content.replace("const [docxPreviewUrl, setDocxPreviewUrl] = useState(null);", state_injection)

# 2. Add Base Values Helper just before getDocxPreview
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
content = content.replace("const getDocxPreview = async () => {", base_values_helper + "\n  const getDocxPreview = async () => {")

# 3. Replace values dict in getDocxPreview
old_preview_values = """    const values = {
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
    };"""
new_preview_values = "    const values = { ...getDocxBaseValues(), ...csvBoardEdits };"
content = content.replace(old_preview_values, new_preview_values)

# 4. Replace values dict in downloadPDF
# Note: downloadPDF uses `record.employee_name`, not `selectedUser.employee_name`, but getDocxBaseValues always uses selectedUser.
# Wait! In downloadPDF, we need to pass `record` instead of `selectedUser`? No, downloadPDF is only called for `selectedUser` from the modal anyway!
# Wait, downloadPDF(r) is used for bulk? Let's keep it safe and just merge csvBoardEdits into the record values.
old_download_values = """          const values = {
            employee_name: record.employee_name,
            employee_id: record.employee_id,
            department: record.department || '',
            designation: record.role || '',
            month: `${month}`,
            month_year: `${month}/${year}`,
            working_days: workedDays || 22,
            paid_days: 22 - parseFloat(lopDays || 0),
            basic: record.basic || 0,
            hra: record.hra || 0,
            allowances: record.allowances || 0,
            bonus: record.bonus || 0,
            gross: (record.basic || 0) + (record.hra || 0) + (record.allowances || 0) + (record.bonus || 0),
            epf: record.epf || 0,
            tds: record.tds || 0,
            lop: record.lop || 0,
            net: record.net || 0,
            amount_words: numberToWords(record.net || 0),
            bank: record.bank_name || '',
            account_number: record.account_number || '',
            ifsc: record.ifsc_code || '',
            payment_mode: paymentMethod || ''
          };"""
new_download_values = """          const baseRecordValues = {
            employee_name: record.employee_name,
            employee_id: record.employee_id,
            department: record.department || '',
            designation: record.role || '',
            month: `${month}`,
            month_year: `${month}/${year}`,
            working_days: workedDays || 22,
            paid_days: 22 - parseFloat(lopDays || 0),
            basic: record.basic || 0,
            hra: record.hra || 0,
            allowances: record.allowances || 0,
            bonus: record.bonus || 0,
            gross: (record.basic || 0) + (record.hra || 0) + (record.allowances || 0) + (record.bonus || 0),
            epf: record.epf || 0,
            tds: record.tds || 0,
            lop: record.lop || 0,
            net: record.net || 0,
            amount_words: numberToWords(record.net || 0),
            bank: record.bank_name || '',
            account_number: record.account_number || '',
            ifsc: record.ifsc_code || '',
            payment_mode: paymentMethod || ''
          };
          const values = { ...baseRecordValues, ...csvBoardEdits };"""
content = content.replace(old_download_values, new_download_values)

# 5. Fix useEffect dependencies
content = content.replace("}, [workedDays, lopDays, paymentMethod, selectedUser, showModal]);", "}, [workedDays, lopDays, paymentMethod, selectedUser, showModal, csvBoardEdits, docxMapping]);")

# 6. Inject the UI
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

target_ui = '<input type="file" accept=".docx" onChange={handleDocxTemplateUpload} style={{ width: \'100%\', fontSize: \'13px\' }} id="custom-template-upload" />\n                </div>'
content = content.replace(target_ui, target_ui + "\n" + csv_board_ui)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected CSV Board properly.")
