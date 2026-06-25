import fitz

def test_extract():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "JOB OFFER LETTER", fontsize=16)
    page.insert_text((50, 100), "Date: 18/12/2025", fontsize=12)
    doc.save("test_extract.pdf")

    doc = fitz.open("test_extract.pdf")
    page = doc[0]
    blocks = page.get_text("blocks")
    for b in blocks:
        # b = (x0, y0, x1, y1, text, block_no, block_type)
        if b[6] == 0: # text block
            print(f"Text: {b[4].strip()}")

test_extract()
