import os

file_path = "src/components/employee/Messaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all occurrences of --ceo- with --tl-
content = content.replace("var(--ceo-", "var(--tl-")
content = content.replace("className=\"ceo-btn\"", "className=\"tk-confirm-btn\"") # or something else, but replacing var(--ceo-) is most important.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced CSS variables in Employee Messaging.jsx")
