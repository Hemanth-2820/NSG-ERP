import re

file_path = "backend/app/routers/ceo_portal.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """        if field_key in values:
            val = values[field_key]
            if val:
                try:
                    p = fitz.Point(float(coords.get("x", 0)), float(coords.get("y", 0)))
                    page.insert_text(p, val, fontsize=float(coords.get("fontSize", 10)), fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")"""

repl = """        if field_key in values:
            val = values[field_key]
            if val:
                try:
                    font_size = float(coords.get("fontSize", 10))
                    p = fitz.Point(float(coords.get("x", 0)), float(coords.get("y", 0)))
                    # Draw a white rectangle behind the text to cover any existing lines/underscores
                    w = fitz.get_text_length(str(val), fontname="helv", fontsize=font_size)
                    rect = fitz.Rect(p.x, p.y - font_size, p.x + w, p.y + font_size * 0.2)
                    page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))
                    # Insert the text
                    page.insert_text(p, str(val), fontsize=font_size, fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")"""

if "page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))" not in content:
    content = content.replace(target, repl)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
