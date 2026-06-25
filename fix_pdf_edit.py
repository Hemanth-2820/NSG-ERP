import os
import re

onboarding_file = r"src\components\hr\modules\onboarding\OnboardingView.jsx"
generator_file = r"src\utils\offerLetterGenerator.js"

# Fix 1: Update OnboardingView.jsx
with open(onboarding_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the div rendering
pattern_div = r"<div\s+ref=\{offerPreviewRef\}\s+contentEditable\s+suppressContentEditableWarning\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*offerPreviewHTML\s*\}\}\s+style=\{\{([^}]+)\}\}\s*/>"
replacement_div = r"<div ref={offerPreviewRef} style={{\g<1>, color: '#000', fontSize: '15px'}} />"

content = re.sub(pattern_div, replacement_div, content, flags=re.DOTALL)

# Let's find: `const [offerPreviewHTML, setOfferPreviewHTML] = useState('');`
pattern_state = r"(const \[offerPreviewHTML, setOfferPreviewHTML\] = useState\(''\);)"
replacement_state = r"\1\n  useEffect(() => {\n    if (offerPreviewRef.current && offerPreviewHTML) {\n      offerPreviewRef.current.innerHTML = offerPreviewHTML;\n    }\n  }, [offerPreviewHTML]);"

if "offerPreviewRef.current.innerHTML = offerPreviewHTML;" not in content:
    content = re.sub(pattern_state, replacement_state, content)

# In handleDownloadEditedOffer, html2pdf has issues with contentEditable elements sometimes.
# So let's strip contenteditable attributes before passing.
pattern_download = r"(// Pass the edited innerHTML as customHTML\s*)await generateOfferLetterPDF\(data, offerPreviewRef\.current\.innerHTML\);"
replacement_download = r"\1const cleanHTML = offerPreviewRef.current.innerHTML.replace(/contenteditable=\"true\"/gi, '');\n        await generateOfferLetterPDF(data, cleanHTML);"

content = re.sub(pattern_download, replacement_download, content)

with open(onboarding_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix 2: Update offerLetterGenerator.js
with open(generator_file, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Add contentEditable="true" to the root div of getOfferLetterHTML
pattern_root_div = r"(<div style=\"background-color: #fff; color: #000; font-family: 'Times New Roman', Times, serif; width: 210mm;\">)"
replacement_root_div = r"<div contentEditable=\"true\" style=\"background-color: #fff; color: #000; font-family: 'Times New Roman', Times, serif; width: 210mm; outline: none;\">"

content2 = re.sub(pattern_root_div, replacement_root_div, content2)

with open(generator_file, 'w', encoding='utf-8') as f:
    f.write(content2)

print("Done")
