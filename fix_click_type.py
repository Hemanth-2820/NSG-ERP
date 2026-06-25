import re
import os

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the inner contentEditable div from pagesHtml
pattern_pages = r"(pagesHtml \+= `\s*<div style=\"position: relative; width: 100%; padding-bottom: \$\{cssHeight\}%; background-image:\s*url\('\$\{imgData\}'\); background-size: cover; background-repeat: no-repeat; background-position: top center;\s*margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgb\(0 0 0 / 0\.1\);\">)\s*<div contentEditable=\"true\" style=\"position: absolute; top: 0; left: 0; right: 0; bottom: 0;\s*padding: 40px; outline: none; z-index: 10; font-family: sans-serif; min-height: 100%;\">\s*<div><br/></div>\s*</div>\s*(</div>\s*`;)"

# Wait, let's just use string replacement or a simpler regex.
content = re.sub(
    r"<div contentEditable=\"true\" style=\"position: absolute; top: 0; left: 0; right: 0; bottom: 0;\s*padding: 40px; outline: none; z-index: 10; font-family: sans-serif; min-height: 100%;\">\s*<div><br/></div>\s*</div>",
    "",
    content
)

# 2. Add onClick to offerPreviewRef
# <div ref={offerPreviewRef} style={{ width: '210mm', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '297mm', backgroundColor: '#fff', zoom: '0.85' , color: '#000', fontSize: '15px'}} />

onclick_code = """
onClick={(e) => {
   if (e.target.isContentEditable) return;
   
   // If clicking on a page with background image (the pdf page wrapper)
   if (e.target.style.backgroundImage || e.target.style.width === '210mm') {
       const newSpan = document.createElement('span');
       newSpan.contentEditable = "true";
       newSpan.style.position = "absolute";
       newSpan.style.left = e.nativeEvent.offsetX + "px";
       newSpan.style.top = e.nativeEvent.offsetY + "px";
       newSpan.style.minWidth = "50px";
       newSpan.style.minHeight = "20px";
       newSpan.style.display = "inline-block";
       newSpan.style.outline = "1px dashed #000";
       newSpan.style.padding = "2px 4px";
       newSpan.style.cursor = "text";
       newSpan.style.color = "#000";
       newSpan.style.fontSize = "15px";
       newSpan.style.whiteSpace = "pre-wrap";
       newSpan.style.zIndex = "50";
       
       newSpan.onblur = function() {
           newSpan.style.outline = "none";
           if (!newSpan.innerText.trim()) {
               newSpan.remove();
           }
       };
       newSpan.onfocus = function() {
           newSpan.style.outline = "1px dashed #000";
       };
       
       // Allow dragging the text box by holding Shift
       newSpan.onmousedown = function(event) {
           if (event.shiftKey) {
               event.preventDefault();
               let shiftX = event.clientX - newSpan.getBoundingClientRect().left;
               let shiftY = event.clientY - newSpan.getBoundingClientRect().top;
               
               function moveAt(pageX, pageY) {
                   const containerRect = e.target.getBoundingClientRect();
                   newSpan.style.left = (pageX - containerRect.left - shiftX) / 0.85 + 'px';
                   newSpan.style.top = (pageY - containerRect.top - shiftY) / 0.85 + 'px';
               }
               
               function onMouseMove(event) {
                   moveAt(event.clientX, event.clientY);
               }
               
               document.addEventListener('mousemove', onMouseMove);
               document.onmouseup = function() {
                   document.removeEventListener('mousemove', onMouseMove);
                   document.onmouseup = null;
               };
           }
       };
       
       // Handle backspace deleting the element if empty
       newSpan.onkeydown = function(event) {
           if (event.key === 'Backspace' && newSpan.innerText.trim() === '') {
               newSpan.remove();
           }
       };

       if (e.target.style.width === '210mm') {
           // Clicked the container itself, position relative to container
           newSpan.style.left = e.nativeEvent.offsetX + "px";
           newSpan.style.top = e.nativeEvent.offsetY + "px";
       }

       e.target.appendChild(newSpan);
       setTimeout(() => newSpan.focus(), 0);
   }
}}"""

# Find the div and inject onClick
pattern_div = r"<div ref=\{offerPreviewRef\} style=\{\{([^}]+)\}\}\s*/>"
replacement_div = r"<div ref={offerPreviewRef} " + onclick_code + r" style={{\1}} />"

# wait, we must be careful with regex group \1
content = re.sub(pattern_div, replacement_div, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
