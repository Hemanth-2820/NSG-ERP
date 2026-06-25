import re

file_path = r"backend\app\routers\hr_portal.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoint_code = """
import fitz
import io
from fastapi.responses import Response

@router.post("/onboarding/edit-pdf-text")
async def edit_pdf_text(
    file: UploadFile = File(...),
    search_text: str = Form(...),
    replace_text: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["HR", "CEO", "Admin", "SuperAdmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        for page in doc:
            # Search for the exact string
            text_instances = page.search_for(search_text)
            
            for inst in text_instances:
                # Redact the old text
                page.add_redact_annot(inst, fill=(1, 1, 1)) # White background
                page.apply_redactions()
                
                # Insert the new text. Try to match standard font sizes based on rect height.
                # height of rect is approximately the font size
                fontsize = inst.y1 - inst.y0
                page.insert_text(
                    (inst.x0, inst.y1 - (fontsize * 0.2)), # adjust y-baseline slightly
                    replace_text,
                    fontsize=fontsize * 0.9,
                    color=(0, 0, 0)
                )
                
        # Return as modified PDF bytes
        modified_pdf = doc.write()
        doc.close()
        
        return Response(content=modified_pdf, media_type="application/pdf")
        
    except Exception as e:
        print(f"Error editing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
"""

if "edit_pdf_text" not in content:
    content += "\n" + endpoint_code

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
