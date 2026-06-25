import fitz

def test_pymupdf():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Hello World! Date: 18/12/2025", fontsize=12)
    doc.save("test.pdf")

    # Now edit it
    doc = fitz.open("test.pdf")
    page = doc[0]
    
    # Search for text
    text_to_find = "18/12/2025"
    text_instances = page.search_for(text_to_find)
    
    for inst in text_instances:
        # Redact
        page.add_redact_annot(inst, fill=(1,1,1))
        page.apply_redactions()
        # Insert new text
        page.insert_text(inst[:2], "25/06/2026", fontsize=12, color=(0,0,0))
        
    doc.save("test_edited.pdf")
    print("Success")

test_pymupdf()
