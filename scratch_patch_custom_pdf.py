import re

file_path = "backend/app/routers/ceo_portal.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_endpoint = """
@router.post("/payroll/generate-custom-mapped-pdf")
async def generate_custom_mapped_pdf(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    data: str = Form(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    import json
    import fitz
    
    mapping_dict = json.loads(mapping)
    data_dict = json.loads(data)
    
    pdf_content = await file.read()
    doc = fitz.open(stream=pdf_content, filetype="pdf")
    page = doc[0]
    
    def fmt(val):
        if val is None or val == "": return ""
        try: return "{:.2f}".format(float(val))
        except: return str(val)
            
    month_names = ['January','February','March','April','May','June','July','August','September','October','November','December']
    try: m_idx = int(data_dict.get("month", 1)) - 1
    except: m_idx = 0
    m_name = month_names[m_idx] if 0 <= m_idx < 12 else ""
    month_year = f"{m_name} {data_dict.get('year', '')}"
    
    values = {
        "employee_name": str(data_dict.get("employee_name", "")),
        "employee_id": str(data_dict.get("employee_id", "")),
        "designation": str(data_dict.get("designation", "")),
        "month_year": month_year,
        "basic": fmt(data_dict.get("basic")),
        "hra": fmt(data_dict.get("hra")),
        "allowances": fmt(data_dict.get("allowances")),
        "bonus": fmt(data_dict.get("bonus")),
        "epf": fmt(data_dict.get("epf")),
        "tds": fmt(data_dict.get("tds")),
        "lop": fmt(data_dict.get("lop")),
        "net": fmt(data_dict.get("net")),
        "pf_number": str(data_dict.get("pf_number", "")),
        "uan": str(data_dict.get("uan", "")),
        "esi_number": str(data_dict.get("esi_number", "")),
        "pan_number": str(data_dict.get("pan_number", "")),
        "location": str(data_dict.get("location", "")),
        "worked_days": fmt(data_dict.get("worked_days")),
        "arrear_days": fmt(data_dict.get("arrear_days")),
        "lop_days": fmt(data_dict.get("lop_days"))
    }
    
    def in_words(num):
        if num == 0: return 'Zero'
        a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
        b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        def cvt(n):
            s = ''
            if n > 99: s += a[int(n / 100)] + ' Hundred '; n %= 100
            if n > 19: s += b[int(n / 10)] + ' '; n %= 10
            if n > 0: s += a[int(n)] + ' '
            return s
        words = ''
        if num >= 10000000: words += cvt(int(num / 10000000)) + 'Crore '; num %= 10000000
        if num >= 100000: words += cvt(int(num / 100000)) + 'Lakh '; num %= 100000
        if num >= 1000: words += cvt(int(num / 1000)) + 'Thousand '; num %= 1000
        if num > 0: words += cvt(num)
        return (words.strip() + ' Rupees only').capitalize()
        
    try: values["net_words"] = in_words(int(round(float(data_dict.get("net") or 0))))
    except: values["net_words"] = ""
        
    for field_key, coords in mapping_dict.items():
        if field_key in values:
            val = values[field_key]
            if val:
                try:
                    p = fitz.Point(float(coords.get("x", 0)), float(coords.get("y", 0)))
                    page.insert_text(p, val, fontsize=float(coords.get("fontSize", 10)), fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")

    pdf_bytes = doc.write()
    doc.close()
    
    from fastapi import Response
    return Response(content=pdf_bytes, media_type="application/pdf")
"""

target = "class PayslipGenerationData(BaseModel):"
if "/payroll/generate-custom-mapped-pdf" not in content:
    content = content.replace(target, new_endpoint + "\n" + target)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
