import re

file_path = r"backend\app\routers\hr_portal.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'if current_user.role not in ["HR", "CEO", "Admin", "SuperAdmin"]:', 
    'if current_user.role.lower() not in ["hr", "ceo", "admin", "superadmin"]:'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed roles case sensitivity")
