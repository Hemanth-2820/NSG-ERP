import fitz

def test_pymupdf_html():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "JOB OFFER LETTER", fontsize=16)
    page.insert_text((50, 100), "Date: 18/12/2025", fontsize=12)
    doc.save("test.pdf")

    # Now read it to HTML
    doc = fitz.open("test.pdf")
    page = doc[0]
    html = page.get_text("html")
    print(html)

test_pymupdf_html()
