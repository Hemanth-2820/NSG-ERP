import re

file_path = r'c:\Users\vivek chamanthula\Desktop\Nsg Erp\NSG-ERP\backend\app\routers\hr_portal.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def repl(m):
    return m.group(1) + "skip: int = 0, limit: int = 100, " + m.group(2)

pattern = r'(def get_\w+\(\s*)(current_user: models\.User = Depends)'
content = re.sub(pattern, repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
