import re

file_path = r"backend\app\routers\hr_portal.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = """

@router.post("/onboarding/extract-pdf-text")
async def extract_pdf_text(
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.role.lower() not in ["hr", "ceo", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_blocks = []
        
        for page in doc:
            blocks = page.get_text("blocks")
            for b in blocks:
                if b[6] == 0:  # Text block
                    text = b[4].strip()
                    if text and len(text) > 1: # Filter out empty or single-character noise
                        # check if already added to avoid exact duplicates
                        if text not in extracted_blocks:
                            extracted_blocks.append(text)
                            
        doc.close()
        return {"blocks": extracted_blocks}
        
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/onboarding/batch-edit-pdf-text")
async def batch_edit_pdf_text(
    file: UploadFile = File(...),
    replacements: str = Form(...),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.role.lower() not in ["hr", "ceo", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        import json
        replacements_list = json.loads(replacements)
        
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        for page in doc:
            for rep in replacements_list:
                search_text = rep.get("search")
                replace_text = rep.get("replace")
                
                if not search_text or not replace_text:
                    continue
                    
                text_instances = page.search_for(search_text)
                for inst in text_instances:
                    page.add_redact_annot(inst, fill=(1, 1, 1))
                    page.apply_redactions()
                    
                    fontsize = inst.y1 - inst.y0
                    page.insert_text(
                        (inst.x0, inst.y1 - (fontsize * 0.2)),
                        replace_text,
                        fontsize=fontsize * 0.9,
                        color=(0, 0, 0)
                    )
                    
        modified_pdf = doc.write()
        doc.close()
        
        return Response(content=modified_pdf, media_type="application/pdf")
        
    except Exception as e:
        print(f"Error batch editing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
"""

if "extract_pdf_text" not in content:
    content += endpoints

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Endpoints injected")
