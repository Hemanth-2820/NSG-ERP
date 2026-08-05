import re

file_path = "src/components/ceo/pages/Payroll/CeoPayroll.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                 await page.render({ canvasContext: context, viewport }).promise;
                 setMappingImage(canvas.toDataURL('image/jpeg', 0.8));
                 
                 setPdfScale(scale);"""

repl = """                 await page.render({ canvasContext: context, viewport }).promise;
                 const imgData = canvas.toDataURL('image/jpeg', 0.8);
                 setMappingImage(imgData);
                 
                 if (!isGlobal) {
                     const cssHeight = (viewport.height / viewport.width) * 100;
                     const pagesHtml = `
                        <div style="position: relative; width: 100%; padding-bottom: ${cssHeight}%; background-image: url('${imgData}'); background-size: cover; background-repeat: no-repeat; background-position: top center; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                          <div contentEditable="true" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 40px; outline: none; z-index: 10; font-family: sans-serif; min-height: 100%;">
                            <div><br/></div>
                          </div>
                        </div>
                      `;
                     setCustomHtmlContent(pagesHtml);
                 }
                 
                 setPdfScale(scale);"""

if "setCustomHtmlContent(pagesHtml);" not in content:
    content = content.replace(target, repl)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
