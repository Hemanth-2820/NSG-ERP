import re

file_path = "backend/app/routers/ceo_portal.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Target for `generate_mapped_pdf` and `generate_custom_mapped_pdf`
# The logic to stamp text looks like this:
text_stamp_target = """        if field_key in values:
            val = values[field_key]
            if val:
                try:
                    p = fitz.Point(float(coords.get("x", 0)), float(coords.get("y", 0)))
                    page.insert_text(p, val, fontsize=float(coords.get("fontSize", 10)), fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")"""

text_stamp_repl = """        if field_key == "signature":
            import base64
            sig_b64 = data_dict.get("signature_base64", "")
            if sig_b64 and sig_b64.startswith("data:image"):
                try:
                    header, encoded = sig_b64.split(",", 1)
                    img_bytes = base64.b64decode(encoded)
                    x = float(coords.get("x", 0))
                    y = float(coords.get("y", 0))
                    # Signature box: 100px wide, 40px high, positioned above the baseline
                    rect = fitz.Rect(x, y - 40, x + 100, y)
                    page.insert_image(rect, stream=img_bytes, keep_proportion=True)
                except Exception as ex:
                    print(f"Error drawing signature: {ex}")
            continue

        if field_key in values:
            val = values[field_key]
            if val:
                try:
                    p = fitz.Point(float(coords.get("x", 0)), float(coords.get("y", 0)))
                    page.insert_text(p, val, fontsize=float(coords.get("fontSize", 10)), fontname="helv", color=(0,0,0))
                except Exception as ex:
                    print(f"Error drawing text for {field_key}: {ex}")"""

if "field_key == \"signature\":" not in content:
    content = content.replace(text_stamp_target, text_stamp_repl)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
