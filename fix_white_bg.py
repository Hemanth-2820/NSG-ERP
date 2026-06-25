import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change the background color of the newSpan from transparent to solid white when blurred
# so it can act as "whiteout" to cover old text on the PDF image.

pattern = r"(newSpan\.style\.backgroundColor = )\"transparent\"(;\s*if \(!newSpan\.innerText\.trim\(\)\))"
replacement = r'\1"#fff"\2'

content = re.sub(pattern, replacement, content)

# Also when it's created, give it white background immediately, not just on focus/blur
pattern_create = r'(newSpan\.style\.zIndex = "50";\s*newSpan\.style\.backgroundColor = )"rgba\(255, 255, 255, 0\.5\)"(;\s*// slight background to see it)'
replacement_create = r'\1"#fff"\2'

content = re.sub(pattern_create, replacement_create, content)

# On focus, also keep it white
pattern_focus = r'(newSpan\.onfocus = function\(\) \{\s*newSpan\.style\.outline = "2px dashed #3b82f6";\s*newSpan\.style\.backgroundColor = )"rgba\(255, 255, 255, 0\.5\)"(;)'
replacement_focus = r'\1"#fff"\2'

content = re.sub(pattern_focus, replacement_focus, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
