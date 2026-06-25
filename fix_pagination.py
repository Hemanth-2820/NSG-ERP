import os

dir_path = r"c:\Users\DELL\Desktop\NSG-ERP\src\components\hr"

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content.replace("{totalPages > 1 && (", "{totalPages > 0 && (")
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {file}")
