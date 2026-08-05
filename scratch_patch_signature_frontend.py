import re

file_path = "src/components/ceo/pages/Payroll/CeoPayroll.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Import for SignatureCanvas
if "import SignatureCanvas" not in content:
    content = content.replace("import { generatePayslipPDF }", "import SignatureCanvas from 'react-signature-canvas';\nimport { generatePayslipPDF }")

# 2. Add signature to MAPPABLE_FIELDS
mappable_target = "{ id: 'net_words', label: 'Net Pay (Words)' }"
mappable_repl = "{ id: 'net_words', label: 'Net Pay (Words)' },\n    { id: 'signature', label: 'Authorized Signatory (Signature)' }"
if "{ id: 'signature'" not in content:
    content = content.replace(mappable_target, mappable_repl)

# 3. Add signature states
state_target = "const [lopDaysReversed, setLopDaysReversed] = useState('');"
state_repl = """const [lopDaysReversed, setLopDaysReversed] = useState('');
  const [signatureBase64, setSignatureBase64] = useState('');
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'upload'
  const sigPad = useRef({});"""
if "const [signatureBase64" not in content:
    content = content.replace(state_target, state_repl)

# 4. Add UI for Signature in the form
# We will insert it before "Upload Letterhead (Logo)"
ui_target = """<div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Upload Letterhead (Logo)</label>"""
ui_repl = """
                <hr style={{ margin: '8px 0', border: '1px solid #e2e8f0' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#334155' }}>Authorized Signature</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button className={`ceo-btn ${signatureType === 'draw' ? 'ceo-btn-primary' : 'ceo-btn-outline'}`} onClick={() => setSignatureType('draw')} style={{ flex: 1, padding: '4px', fontSize: '12px' }}>Draw</button>
                    <button className={`ceo-btn ${signatureType === 'upload' ? 'ceo-btn-primary' : 'ceo-btn-outline'}`} onClick={() => setSignatureType('upload')} style={{ flex: 1, padding: '4px', fontSize: '12px' }}>Upload</button>
                </div>
                {signatureType === 'draw' && (
                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', position: 'relative' }}>
                        <SignatureCanvas 
                            ref={sigPad}
                            penColor="black"
                            canvasProps={{width: 320, height: 100, className: 'sigCanvas'}}
                            onEnd={() => setSignatureBase64(sigPad.current.getTrimmedCanvas().toDataURL('image/png'))}
                        />
                        <button onClick={() => { sigPad.current.clear(); setSignatureBase64(''); }} style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '10px', padding: '2px 4px', cursor: 'pointer' }}>Clear</button>
                    </div>
                )}
                {signatureType === 'upload' && (
                    <div className="form-group">
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setSignatureBase64(reader.result);
                                reader.readAsDataURL(file);
                            }
                        }} style={{ width: '100%', fontSize: '13px' }} />
                    </div>
                )}
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Upload Letterhead (Logo)</label>"""
if "Authorized Signature" not in content:
    content = content.replace(ui_target, ui_repl)


# 5. Add signature to payload for Custom and Global mapped pdfs
payload_target = """      const payload = {
          ...record,
          month: month,
          year: year
      };"""
payload_repl = """      const payload = {
          ...record,
          month: month,
          year: year,
          signature_base64: signatureBase64
      };"""
if "signature_base64: signatureBase64" not in content:
    content = content.replace(payload_target, payload_repl)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
