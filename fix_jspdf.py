import os
import re

dir_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components"

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            new_content = re.sub(r"import\s+jsPDF\s+from\s+['\"]jspdf['\"];?", "import { jsPDF } from 'jspdf';", new_content)
            new_content = re.sub(r"import\s+['\"]jspdf-autotable['\"];?", "import autoTable from 'jspdf-autotable';", new_content)
            new_content = new_content.replace("doc.autoTable({", "autoTable(doc, {")
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {file}")
