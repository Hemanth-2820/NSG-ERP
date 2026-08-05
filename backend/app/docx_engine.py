import os
from docx import Document
from rapidfuzz import process, fuzz

KNOWN_LABELS = {
    "Employee Name": "employee_name",
    "Employee ID": "employee_id",
    "Department": "department",
    "Designation": "designation",
    "Month": "month",
    "Month & Year": "month_year",
    "Working Days": "working_days",
    "Paid Days": "paid_days",
    "Basic": "basic",
    "Basic Salary": "basic",
    "HRA": "hra",
    "Allowances": "allowances",
    "Bonus": "bonus",
    "Gross Salary": "gross",
    "EPF": "epf",
    "TDS": "tds",
    "LOP": "lop",
    "Net Pay": "net",
    "Net Salary": "net",
    "Bank": "bank",
    "Account Number": "account_number",
    "IFSC": "ifsc",
    "Payment Mode": "payment_mode",
    "Amount in Words": "amount_words"
}

def normalize_text(text):
    return text.strip().replace(":", "").replace("_", "").strip()

def extract_docx_fields(file_path):
    """
    Reads a DOCX file and uses fuzzy matching to find known labels.
    Returns a mapping JSON of where the editable values belong.
    """
    doc = Document(file_path)
    mapping = {}
    
    label_keys = list(KNOWN_LABELS.keys())
    
    # Check tables
    for table_idx, table in enumerate(doc.tables):
        for row_idx, row in enumerate(table.rows):
            for col_idx, cell in enumerate(row.cells):
                text = normalize_text(cell.text)
                if not text:
                    continue
                
                # Fuzzy match text against known labels
                match = process.extractOne(text, label_keys, scorer=fuzz.ratio, score_cutoff=85)
                if match:
                    matched_label, score, _ = match
                    field_id = KNOWN_LABELS[matched_label]
                    
                    # Assume the value is in the next column if available
                    if col_idx + 1 < len(row.cells):
                        mapping[field_id] = {
                            "type": "table_cell",
                            "table": table_idx,
                            "row": row_idx,
                            "column": col_idx + 1
                        }

    # Check paragraphs
    for p_idx, paragraph in enumerate(doc.paragraphs):
        text = normalize_text(paragraph.text)
        if not text:
            continue
            
        # Try to find a label at the start of the paragraph
        # e.g., "Employee Name : __________"
        match = process.extractOne(text, label_keys, scorer=fuzz.partial_ratio, score_cutoff=85)
        if match:
            matched_label, score, _ = match
            field_id = KNOWN_LABELS[matched_label]
            
            # Since paragraph contains label + value, we want to replace the value part.
            # We store the run that represents the blank line or the value.
            # Simplified approach: We store paragraph index. We will append to it or replace runs.
            mapping[field_id] = {
                "type": "paragraph",
                "paragraph": p_idx,
                "label_found": matched_label
            }

    return mapping


def fill_docx_template(template_path, mapping_json, values_dict, output_path):
    """
    Loads the template, injects values_dict based on mapping_json, and saves to output_path.
    """
    doc = Document(template_path)
    
    for field_id, location in mapping_json.items():
        if field_id not in values_dict:
            continue
            
        value = str(values_dict[field_id])
        
        if location["type"] == "table_cell":
            table_idx = location["table"]
            row_idx = location["row"]
            col_idx = location["column"]
            
            try:
                cell = doc.tables[table_idx].rows[row_idx].cells[col_idx]
                # Preserve formatting by replacing text in the first run and clearing the rest
                if cell.paragraphs:
                    para = cell.paragraphs[0]
                    if para.runs:
                        para.runs[0].text = value
                        for r in para.runs[1:]:
                            r.text = ""
                    else:
                        para.add_run(value)
            except Exception as e:
                print(f"Error filling table cell for {field_id}: {e}")
                
        elif location["type"] == "paragraph":
            p_idx = location["paragraph"]
            try:
                para = doc.paragraphs[p_idx]
                label_text = location.get("label_found", "")
                
                # If paragraph text is "Employee Name : _______"
                # We replace everything after the label with the value
                # This is a bit tricky to preserve formatting, so we'll just reconstruct the text
                # or clear runs and add one.
                original_text = para.text
                if ":" in original_text:
                    prefix = original_text.split(":")[0] + ": "
                else:
                    prefix = label_text + " "
                
                # Keep first run's style
                style = para.runs[0].style if para.runs else None
                for r in para.runs:
                    r.text = ""
                    
                run = para.add_run(prefix + value)
                if style:
                    run.style = style
                    
            except Exception as e:
                print(f"Error filling paragraph for {field_id}: {e}")

    doc.save(output_path)
