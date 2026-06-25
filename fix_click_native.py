import re

file_path = r"src\components\hr\modules\onboarding\OnboardingView.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the React onClick handler from the div
pattern_div = r"<div ref=\{offerPreviewRef\}\s*onClick=\{\(e\) => \{[\s\S]*?\}\} style=\{\{([^}]+)\}\}\s*/>"
replacement_div = r"<div ref={offerPreviewRef} style={{\1}} />"
content = re.sub(pattern_div, replacement_div, content)

# 2. Add native addEventListener inside the useEffect that sets innerHTML
# Wait, there are multiple places where innerHTML is set:
# 1. useEffect for offerPreviewHTML
# 2. handleOfferTemplateUpload (isGlobal and not isGlobal)
# 3. fetchGlobalOfferTemplate

# Instead of attaching it everywhere, we can attach it ONCE in a useEffect that watches `offerPreviewRef.current`.
# Or we can just use event delegation on the document, but that's messy.
# We can attach it in the same useEffect that watches `offerPreviewHTML`:
#   useEffect(() => {
#     if (offerPreviewRef.current && offerPreviewHTML) {
#       offerPreviewRef.current.innerHTML = offerPreviewHTML;
#     }
#   }, [offerPreviewHTML]);

# Let's add a setup function for the click listener.
setup_listener_code = """
  useEffect(() => {
    const container = offerPreviewRef.current;
    if (!container) return;
    
    const handleClick = (e) => {
       if (e.target.isContentEditable) return;
       
       // If clicking on a page with background image (the pdf page wrapper) or the container itself
       if (e.target.style.backgroundImage || e.target.style.width === '210mm') {
           const newSpan = document.createElement('span');
           newSpan.contentEditable = "true";
           newSpan.style.position = "absolute";
           newSpan.style.left = e.offsetX + "px";
           newSpan.style.top = e.offsetY + "px";
           newSpan.style.minWidth = "60px";
           newSpan.style.minHeight = "24px";
           newSpan.style.display = "inline-block";
           newSpan.style.outline = "2px dashed #3b82f6";
           newSpan.style.padding = "2px 4px";
           newSpan.style.cursor = "text";
           newSpan.style.color = "#000";
           newSpan.style.fontSize = "15px";
           newSpan.style.whiteSpace = "pre-wrap";
           newSpan.style.zIndex = "50";
           newSpan.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // slight background to see it
           
           newSpan.onblur = function() {
               newSpan.style.outline = "none";
               newSpan.style.backgroundColor = "transparent";
               if (!newSpan.innerText.trim()) {
                   newSpan.remove();
               }
           };
           newSpan.onfocus = function() {
               newSpan.style.outline = "2px dashed #3b82f6";
               newSpan.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
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
           
           newSpan.onkeydown = function(event) {
               if (event.key === 'Backspace' && newSpan.innerText.trim() === '') {
                   newSpan.remove();
               }
           };

           e.target.appendChild(newSpan);
           // Delay focus to ensure it's in the DOM
           setTimeout(() => { newSpan.focus(); }, 10);
       }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [offerPreviewHTML, showOfferPreviewModal]);
"""

pattern_state = r"(const \[offerPreviewHTML, setOfferPreviewHTML\] = useState\(''\);[\s\S]*?\}, \[offerPreviewHTML\]\);)"
replacement_state = r"\1\n" + setup_listener_code

if "container.addEventListener('click', handleClick);" not in content:
    content = re.sub(pattern_state, replacement_state, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
