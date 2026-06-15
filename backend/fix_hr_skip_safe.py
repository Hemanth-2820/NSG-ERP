import re

file_path = r'c:\Users\vivek chamanthula\Desktop\Nsg Erp\NSG-ERP\backend\app\routers\hr_portal.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix signatures missing skip and limit safely
def repl(m):
    return m.group(1) + "skip: int = 0, limit: int = 100, " + m.group(2)

# Only match if "skip:" is NOT already in the signature
pattern = r'(def get_\w+\(\s*)(?!.*?skip:\s*int)(current_user:\s*models\.User\s*=\s*Depends)'
content = re.sub(pattern, repl, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed skip/limit safely")
