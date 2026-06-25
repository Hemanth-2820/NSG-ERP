import docx
import base64

def get_images(docx_file):
    doc = docx.Document(docx_file)
    for i, section in enumerate(doc.sections):
        print(f"Section {i}")
        if section.header:
            header_part = section.header.part
            if header_part is not None:
                for rel in header_part.rels.values():
                    if "image" in rel.reltype:
                        blob = rel.target_part.blob
                        ctype = rel.target_part.content_type
                        b64 = base64.b64encode(blob).decode('utf-8')
                        print(f"Header Image: {ctype}, size: {len(b64)}")
        
        if section.footer:
            footer_part = section.footer.part
            if footer_part is not None:
                for rel in footer_part.rels.values():
                    if "image" in rel.reltype:
                        blob = rel.target_part.blob
                        ctype = rel.target_part.content_type
                        b64 = base64.b64encode(blob).decode('utf-8')
                        print(f"Footer Image: {ctype}, size: {len(b64)}")

if __name__ == "__main__":
    # We don't have the user's specific docx, but we can write the code.
    print("Done")
