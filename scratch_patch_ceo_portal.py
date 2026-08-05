import re

with open("backend/app/routers/ceo_portal.py", "r", encoding="utf-8") as f:
    content = f.read()

new_endpoints = """
@router.post("/payroll/upload-pdf-template")
async def upload_pdf_template(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    verify_ceo_role(current_user)
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only .pdf files are supported")
    
    content = await file.read()
    
    template = db.query(models.GlobalTemplate).filter(models.GlobalTemplate.template_type == "payslip_pdf_mapped").first()
    if not template:
        template = models.GlobalTemplate(template_type="payslip_pdf_mapped")
        db.add(template)
    template.file_data = content
    db.commit()
    
    return {"message": "PDF Template uploaded successfully"}

class PDFMappingRequest(BaseModel):
    mapping: dict

@router.post("/payroll/save-pdf-mapping")
def save_pdf_mapping(
    req: PDFMappingRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    verify_ceo_role(current_user)
    template = db.query(models.GlobalTemplate).filter(models.GlobalTemplate.template_type == "payslip_pdf_mapped").first()
    if not template:
        raise HTTPException(status_code=404, detail="Upload a PDF template first.")
    
    template.field_mappings = req.mapping
    db.commit()
    return {"message": "Mapping saved successfully"}

@router.get("/payroll/pdf-template-info")
def get_pdf_template_info(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    template = db.query(models.GlobalTemplate).filter(models.GlobalTemplate.template_type == "payslip_pdf_mapped").first()
    if not template or not template.file_data:
        return {"exists": False}
    return {
        "exists": True,
        "mapping": template.field_mappings or {}
    }

@router.get("/payroll/download-pdf-template")
def download_pdf_template(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    template = db.query(models.GlobalTemplate).filter(models.GlobalTemplate.template_type == "payslip_pdf_mapped").first()
    if not template or not template.file_data:
        raise HTTPException(status_code=404, detail="Template not found")
    
    from fastapi import Response
    return Response(content=template.file_data, media_type="application/pdf")

@router.post("/payroll/generate-mapped-pdf")
def generate_mapped_pdf(
    data: dict,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Generates a filled PDF based on coordinates
    template = db.query(models.GlobalTemplate).filter(models.GlobalTemplate.template_type == "payslip_pdf_mapped").first()
    if not template or not template.file_data or not template.field_mappings:
        raise HTTPException(status_code=400, detail="Mapped PDF template not set up.")
        
    import fitz
    doc = fitz.open(stream=template.file_data, filetype="pdf")
    page = doc[0] # assuming single page template
    
    mapping = template.field_mappings
    
    # helper for formatting numbers
    def fmt(val):
        if val is None or val == "":
            return ""
        try:
            return "{:.2f}".format(float(val))
        except:
            return str(val)
            
    # Prepare values
    month_names = ['January','February','March','April','May','June','July','August','September','October','November','December']
    try:
        m_idx = int(data.get("month", 1)) - 1
    except:
        m_idx = 0
    m_name = month_names[m_idx] if 0 <= m_idx < 12 else ""
    month_year = f"{m_name} {data.get('year', '')}"
    
    values = {
        "employee_name": str(data.get("employee_name", "")),
        "employee_id": str(data.get("employee_id", "")),
        "designation": str(data.get("designation", "")),
        "month_year": month_year,
        "basic": fmt(data.get("basic")),
        "hra": fmt(data.get("hra")),
        "allowances": fmt(data.get("allowances")),
        "bonus": fmt(data.get("bonus")),
        "epf": fmt(data.get("epf")),
        "tds": fmt(data.get("tds")),
        "lop": fmt(data.get("lop")),
        "net": fmt(data.get("net")),
        "pf_number": str(data.get("pf_number", "")),
        "uan": str(data.get("uan", "")),
        "esi_number": str(data.get("esi_number", "")),
        "pan_number": str(data.get("pan_number", "")),
        "location": str(data.get("location", "")),
        "worked_days": fmt(data.get("worked_days")),
        "arrear_days": fmt(data.get("arrear_days")),
        "lop_days": fmt(data.get("lop_days"))
    }
    
    # Helper to convert words
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
        finalStr = words.strip() + ' Rupees only'
        return finalStr.capitalize()
        
    try:
        net_num = float(data.get("net") or 0)
        values["net_words"] = in_words(int(round(net_num)))
    except:
        values["net_words"] = ""
        
    for field_key, coords in mapping.items():
        if field_key in values:
            val = values[field_key]
            if val:
                # Assuming frontend sends original PDF coordinate space (x, y)
                x = coords.get("x", 0)
                y = coords.get("y", 0)
                font_size = coords.get("fontSize", 10)
                
                try:
                    p = fitz.Point(float(x), float(y))
                    page.insert_text(p, val, fontsize=float(font_size), fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")

    pdf_bytes = doc.write()
    doc.close()
    
    from fastapi import Response
    return Response(content=pdf_bytes, media_type="application/pdf")
"""

target = "class PayslipGenerationData(BaseModel):"
content = content.replace(target, new_endpoints + "\n" + target)

with open("backend/app/routers/ceo_portal.py", "w", encoding="utf-8") as f:
    f.write(content)
