import re

file_path = r"backend\app\routers\hr_portal.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("current_user: User = Depends(get_current_user)", "current_user: models.User = Depends(security.get_current_user)")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed")
