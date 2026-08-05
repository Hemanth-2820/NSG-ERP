import re

file_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components\ceo\pages\Payroll\CeoPayroll.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

docx_generate_code = """
      if (docxMapping) {
          showNotification(`Generating DOCX Payslip for ${record.employee_name}...`, 'info');
          const token = localStorage.getItem('nsg_jwt_token');
          
          const values = {
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

          const res = await fetch('/api/ceo-portal/payroll/template/docx/generate', {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ values })
          });
          
          if (!res.ok) throw new Error('Failed to generate DOCX');
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
"""

if "if (docxMapping) {" not in content:
    content = content.replace("if (currentPdfFile && Object.keys(customFieldMappings).length > 0) {", docx_generate_code + "\n      if (currentPdfFile && Object.keys(customFieldMappings).length > 0) {")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched downloadPDF")
