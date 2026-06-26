import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, MapPin, Loader, CheckCircle2, Building2, Save, Plus, Trash2, Sliders, FileText, X } from 'lucide-react';
import { getOfferLetterHTML, generateOfferLetterPDF } from '../../../../utils/offerLetterGenerator';

export function HrSettingsView() {
  const [geofence, setGeofence] = useState({
    enabled: true,
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 100
  });

  const [leavePolicies, setLeavePolicies] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });
  
  // Offer Letter State
  const [employees, setEmployees] = useState([]);
  const [selectedOfferEmpId, setSelectedOfferEmpId] = useState('');
  const [offerCtcLpa, setOfferCtcLpa] = useState('');
  const [offerMonthlyTakeHome, setOfferMonthlyTakeHome] = useState('');
  const [offerReportingTime, setOfferReportingTime] = useState('11:00 AM');
  const [offerRefStr, setOfferRefStr] = useState(`SS${new Date().getMonth()+1}${new Date().getFullYear().toString().slice(-2)}HYD${Math.floor(100 + Math.random() * 900)}`);
  
  const [showOfferPreviewModal, setShowOfferPreviewModal] = useState(false);
  const [offerPreviewHTML, setOfferPreviewHTML] = useState('');
  const [globalOfferTemplateHtml, setGlobalOfferTemplateHtml] = useState(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  
  // CSV Extraction State
  const [currentUploadedFile, setCurrentUploadedFile] = useState(null);
  const [pdfExtractedBlocks, setPdfExtractedBlocks] = useState([]);
  const [pdfEdits, setPdfEdits] = useState({});
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  
  const [showDocxPreviewModal, setShowDocxPreviewModal] = useState(false);
  const [docxExtractedBlocks, setDocxExtractedBlocks] = useState([]);
  const [docxEdits, setDocxEdits] = useState({});
  const [isExtractingDocx, setIsExtractingDocx] = useState(false);

  const offerPreviewRef = React.useRef(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePolicyChange = (id, newMax) => {
    setLeavePolicies(prev => prev.map(p => p.id === id ? { ...p, max_balance: Number(newMax) } : p));
  };

  const handleSavePolicies = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      await Promise.all(leavePolicies.map(p =>
        fetch(`/api/hr-portal/leave/policies/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ max_balance: p.max_balance, carryover_days: p.carryover_days })
        })
      ));
      if (window.toast) window.toast.success('Leave policies saved successfully!');
      else window.toast.success('Leave policies saved successfully!');
    } catch (err) { console.error(err); }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newHoliday.name, date: newHoliday.date, type: 'national' })
      });
      if (res.ok) {
        const saved = await res.json();
        setHolidays(prev => [...prev, saved]);
        setNewHoliday({ name: '', date: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      await fetch(`/api/hr-portal/holidays/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHolidays(prev => prev.filter(h => h.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSaveHolidays = () => {
    // Holidays are saved individually via handleAddHoliday — this is now a no-op UI confirmation
    if (window.toast) window.toast.success('Holiday calendar is up to date!');
    else window.toast.info('Holiday calendar is up to date!');
  };

  // --- SCHEMA BUILDER ---
  const [schemas, setSchemas] = useState({});
  const [selectedDept, setSelectedDept] = useState("IT");
  const [newField, setNewField] = useState({ name: '', label: '', type: 'text' });
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchSchemas();
    fetchLeavePolicies();
    fetchHolidays();
    fetchDepartments();
    fetchEmployees();
    fetchGlobalOfferTemplate();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEmployees(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchGlobalOfferTemplate = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/onboarding/global-template/offer_letter', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.html_content) setGlobalOfferTemplateHtml(data.html_content);
      }
    } catch (err) { console.error('Failed to fetch global offer template', err); }
  };

  const fetchLeavePolicies = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/leave/policies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setLeavePolicies(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setHolidays(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
        if (data.length > 0 && !data.some(d => d.name === "IT")) {
          setSelectedDept(data[0].name);
        }
      }
    } catch (err) { console.error(err); }
  };



  const fetchSchemas = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/schemas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSchemas(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddField = () => {
    if (!newField.label) {
      if (window.toast) window.toast.error("Please enter a Display Label before adding a field.");
      else window.toast.warning("Please enter a Display Label before adding a field.");
      return;
    }
    if (!newField.name) {
      if (window.toast) window.toast.error("Please enter a DB Field Name before adding a field.");
      else window.toast.warning("Please enter a DB Field Name before adding a field.");
      return;
    }
    const deptSchema = schemas[selectedDept] || [];
    setSchemas({
      ...schemas,
      [selectedDept]: [...deptSchema, { ...newField }]
    });
    setNewField({ name: '', label: '', type: 'text' });
  };

  const handleDeleteField = (idx) => {
    const deptSchema = [...(schemas[selectedDept] || [])];
    deptSchema.splice(idx, 1);
    setSchemas({
      ...schemas,
      [selectedDept]: deptSchema
    });
  };

  const handleSaveSchema = async () => {
    setSchemaLoading(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch(`/api/hr-portal/schemas/${selectedDept}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schema_fields: schemas[selectedDept] || [] })
      });
      if (res.ok) {
        if (window.toast) window.toast.success(`${selectedDept} Schema saved successfully!`);
        else window.toast.success(`${selectedDept} Schema saved successfully!`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (window.toast) window.toast.error(`Failed to save schema: ${errorData.detail || res.statusText}`);
        else window.toast.error(`Failed to save schema: ${errorData.detail || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      if (window.toast) window.toast.error("Network error while saving schema");
    }
    setSchemaLoading(false);
  };
  // ----------------------

  useEffect(() => {
    const fetchGeofenceSettings = async () => {
      const token = localStorage.getItem('nsg_jwt_token');
      try {
        const res = await fetch('/api/attendance/geofence-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGeofence({
            enabled: data.enabled,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius
          });
        }
      } catch (err) {
        console.error("Failed to fetch geofence settings", err);
      }
    };
    fetchGeofenceSettings();
  }, []);



  const handleSaveGeofence = async () => {
    const token = localStorage.getItem('nsg_jwt_token');
    let success = true;
    if (token) {
      try {
        const res = await fetch('/api/attendance/geofence-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            enabled: geofence.enabled,
            latitude: geofence.latitude,
            longitude: geofence.longitude,
            radius: geofence.radius
          })
        });
        if (!res.ok) success = false;
      } catch (err) {
        console.error("Failed to save geofence settings to backend", err);
        success = false;
      }
    } else {
      success = false;
    }

    if (success) {
      if (window.toast) {
        window.toast.success("Geofence settings saved successfully!");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } else {
      if (window.toast) {
        window.toast.error("Failed to save geofence settings.");
      } else {
        window.toast.error("Failed to save geofence settings.");
      }
    }
  };

  const handleLocateOffice = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeofence(prev => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6))
        }));
        setGpsLoading(false);
      },
      (error) => {
        if (window.toast) {
          window.toast.error("Failed to retrieve current location. Please ensure location permissions are enabled in your browser.");
        } else {
          window.toast.error("Failed to retrieve current location. Please ensure location permissions are enabled in your browser.");
        }
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (offerPreviewRef.current && offerPreviewHTML) {
      offerPreviewRef.current.innerHTML = offerPreviewHTML;
    }
  }, [offerPreviewHTML]);

  useEffect(() => {
    const container = offerPreviewRef.current;
    if (!container) return;
    const handleClick = (e) => {
       if (e.target.isContentEditable) return;
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
           newSpan.style.backgroundColor = "#fff";
           newSpan.onblur = function() {
               newSpan.style.outline = "none";
               newSpan.style.backgroundColor = "#fff";
               if (!newSpan.innerText.trim()) newSpan.remove();
           };
           newSpan.onfocus = function() {
               newSpan.style.outline = "2px dashed #3b82f6";
               newSpan.style.backgroundColor = "#fff";
           };
           newSpan.onkeydown = function(event) {
               if (event.key === 'Backspace' && newSpan.innerText.trim() === '') newSpan.remove();
           };
           e.target.appendChild(newSpan);
           setTimeout(() => { newSpan.focus(); }, 10);
       }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [offerPreviewHTML, showOfferPreviewModal]);

  const notify = (msg, type='info') => {
    if (window.toast) {
      if (type === 'error') window.toast.error(msg);
      else if (type === 'success') window.toast.success(msg);
      else if (type === 'warning') window.toast.warning(msg);
      else window.toast.info(msg);
    }
  };

  const handlePreviewDocxOffer = async (e) => {
    e.preventDefault();
    const offerEmp = employees.find(emp => emp.id.toString() === selectedOfferEmpId.toString());
    if (!offerEmp) return;

    setIsLoadingOffer(true);
    setIsExtractingDocx(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/onboarding/preview-docx-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          candidateName: offerEmp.name,
          offerRefStr: offerRefStr,
          offerReportingTime: offerReportingTime,
          offerCtcLpa: offerCtcLpa,
          offerMonthlyTakeHome: offerMonthlyTakeHome
        })
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate preview');
      
      const data = await res.json();
      setDocxExtractedBlocks(data.blocks || []);
      setDocxEdits({});
      setShowDocxPreviewModal(true);
    } catch (err) {
      notify(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoadingOffer(false);
      setIsExtractingDocx(false);
    }
  };

  const handleDownloadEditedDocxOffer = async () => {
    const offerEmp = employees.find(emp => emp.id.toString() === selectedOfferEmpId.toString());
    if (!offerEmp) return;
    setIsLoadingOffer(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/hr-portal/onboarding/generate-edited-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          candidateName: offerEmp.name,
          offerRefStr: offerRefStr,
          offerReportingTime: offerReportingTime,
          offerCtcLpa: offerCtcLpa,
          offerMonthlyTakeHome: offerMonthlyTakeHome,
          edits: docxEdits
        })
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offer_Letter_${offerEmp.name}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      notify(`Edited DOCX Offer Letter for ${offerEmp.name} generated successfully!`, 'success');
      setShowDocxPreviewModal(false);
    } catch (err) {
      notify(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoadingOffer(false);
    }
  };

  const handleGlobalTemplateUploadDocx = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoadingOffer(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/hr-portal/onboarding/upload-template-docx', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) notify('Global DOCX Template updated successfully!', 'success');
      else notify(`Upload failed: ${(await res.json()).detail}`, 'error');
    } catch (err) {
      notify(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoadingOffer(false);
      e.target.value = null;
    }
  };

  const handleOfferTemplateUpload = async (e, isGlobal = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setCurrentUploadedFile(file);
    setIsLoadingOffer(true);
    let pagesHtml = '';
    try {
      if (file.type === 'application/pdf') {
        try {
          setIsExtractingPdf(true);
          const token = localStorage.getItem('nsg_jwt_token');
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/hr-portal/onboarding/extract-pdf-text', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            setPdfExtractedBlocks(data.blocks || []);
            setPdfEdits({});
          }
        } catch (err) { console.error('Extraction failed', err); } 
        finally { setIsExtractingPdf(false); }

        const loadPdfJs = () => new Promise((resolve, reject) => {
          if (window.pdfjsLib) return resolve(window.pdfjsLib);
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const cssHeight = (viewport.height / viewport.width) * 100;
          pagesHtml += `<div style="position: relative; width: 100%; padding-bottom: ${cssHeight}%; background-image: url('${imgData}'); background-size: cover; background-repeat: no-repeat; background-position: top center; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`;
        }
      } else if (file.name.endsWith('.docx')) {
        const token = localStorage.getItem('nsg_jwt_token');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/hr-portal/onboarding/convert-doc', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.html_body) {
          pagesHtml = `<div style="display: flex; flex-direction: column; min-height: 297mm; width: 100%; padding: 40px; box-sizing: border-box; font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.6;">${data.header_html ? `<div contentEditable="false" style="flex-shrink: 0; user-select: none;">${data.header_html}</div>` : ''}<div contentEditable="true" style="flex-grow: 1; outline: none;">${data.html_body}</div>${data.footer_html ? `<div contentEditable="false" style="flex-shrink: 0; user-select: none; margin-top: auto;">${data.footer_html}</div>` : ''}</div>`;
        } else {
          pagesHtml = data.html ? `<div contentEditable="true" style="width: 100%; min-height: 297mm; outline: none; padding: 40px; box-sizing: border-box; font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.6;">${data.html}</div>` : "<div>Failed to convert document</div>";
        }
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        pagesHtml = await new Promise((resolve) => {
            reader.onload = (event) => resolve(`<div style="text-align: center;"><img src="${event.target.result}" style="max-width: 100%;" /></div>`);
            reader.readAsDataURL(file);
        });
      } else {
        pagesHtml = await file.text();
      }

      if (offerPreviewRef.current) offerPreviewRef.current.innerHTML = pagesHtml;

      if (isGlobal) {
        const token = localStorage.getItem('nsg_jwt_token');
        const res = await fetch('/api/hr-portal/onboarding/global-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ template_type: 'offer_letter', html_content: pagesHtml })
        });
        if (res.ok) {
          setGlobalOfferTemplateHtml(pagesHtml);
          notify('Global offer letter template saved successfully!', 'success');
        } else notify('Failed to save global template', 'error');
      }
    } catch (e) {
      console.error('Upload Error:', e);
      notify(`Failed to process uploaded file: ${e.message}`, 'error');
    } finally {
      setIsLoadingOffer(false);
    }
  };

  const handleBatchPdfEdit = async () => {
    if (!currentUploadedFile) return;
    const replacements = [];
    pdfExtractedBlocks.forEach((block, idx) => {
        if (pdfEdits[idx] !== undefined && pdfEdits[idx] !== block) replacements.push({ search: block, replace: pdfEdits[idx] });
    });
    if (replacements.length === 0) return notify('No changes made in the CSV board.', 'info');

    setIsEditingPdf(true);
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const formData = new FormData();
      formData.append('file', currentUploadedFile);
      formData.append('replacements', JSON.stringify(replacements));
      
      const res = await fetch('/api/hr-portal/onboarding/batch-edit-pdf-text', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to edit PDF');
      
      const blob = await res.blob();
      const newFile = new File([blob], currentUploadedFile.name, { type: 'application/pdf' });
      await handleOfferTemplateUpload({ target: { files: [newFile] } }, false);
      notify(`Successfully applied ${replacements.length} updates!`, 'success');
    } catch (error) { notify(`Error: ${error.message}`, 'error'); } 
    finally { setIsEditingPdf(false); }
  };

  const handlePreviewOfferLetter = (e) => {
    e.preventDefault();
    const offerEmp = employees.find(emp => emp.id.toString() === selectedOfferEmpId.toString());
    if (!offerEmp) {
      if (window.toast) window.toast.error("Please select an employee.");
      return;
    }
    
    const data = {
      refNumber: offerRefStr,
      offerDate: new Date().toLocaleDateString('en-GB'),
      candidateName: offerEmp.name,
      role: offerEmp.designation || 'EMPLOYEE',
      joiningDate: new Date(offerEmp.join_date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      reportingTime: offerReportingTime,
      ctcLpa: offerCtcLpa,
      monthlySalary: offerMonthlyTakeHome
    };
    
    const html = getOfferLetterHTML(data);
    setOfferPreviewHTML(html);
    setShowOfferPreviewModal(true);
    
    setTimeout(() => {
        if (globalOfferTemplateHtml && offerPreviewRef.current) {
            offerPreviewRef.current.innerHTML = globalOfferTemplateHtml;
        }
    }, 100);
  };

  const handleDownloadEditedOffer = async () => {
    const offerEmp = employees.find(emp => emp.id.toString() === selectedOfferEmpId.toString());
    if (!offerEmp) return;
    try {
      const data = { candidateName: offerEmp.name };
      const cleanHTML = offerPreviewRef.current.innerHTML.replace(/contenteditable=\"true\"/gi, '');
      await generateOfferLetterPDF(data, cleanHTML);
      if (window.toast) window.toast.success(`Offer Letter PDF for ${offerEmp.name} generated successfully.`);
      setShowOfferPreviewModal(false);
    } catch (err) {
      if (window.toast) window.toast.error(`Error generating PDF: ${err.message}`);
    }
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>HR Settings</h1>
        </div>
      </div>

      {/* Custom Task Forms (Schema Builder) */}
      <div className="card" style={{ borderLeft: '4px solid #8b5cf6', width: '100%', marginTop: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', border: 'none', padding: 0 }}>
            <Sliders size={20} style={{ color: '#8b5cf6' }} /> Custom Task Forms (Schema Builder)
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
          Dynamically manage custom input fields for <b>{selectedDept}</b> employee task submissions. These fields will be generated automatically in the Employee Tasks UI without requiring code changes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {/* Current Schema Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!schemas[selectedDept] || schemas[selectedDept].length === 0) ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No custom fields defined for {selectedDept}.</div>
            ) : (
              schemas[selectedDept].map((f, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', minWidth: '150px' }}>{f.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px' }}>name: {f.name}</span>
                    <span style={{ fontSize: '11px', color: '#8b5cf6', backgroundColor: '#8b5cf620', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>{f.type}</span>
                  </div>
                  <button onClick={() => handleDeleteField(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Field */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Display Label</label>
              <input 
                type="text" 
                placeholder="e.g. Deal Value" 
                value={newField.label}
                onChange={e => setNewField({...newField, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '6px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DB Field Name (Auto)</label>
              <input 
                type="text" 
                placeholder="deal_value" 
                value={newField.name}
                onChange={e => setNewField({...newField, name: e.target.value})}
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '6px', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Input Type</label>
              <select 
                value={newField.type}
                onChange={e => setNewField({...newField, type: e.target.value})}
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '6px', outline: 'none' }}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea (Long)</option>
                <option value="url">URL / Link</option>
                <option value="date">Date</option>
                <option value="file">File / Image Upload</option>
              </select>
            </div>
            <button onClick={handleAddField} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', transition: 'background-color 0.2s' }}>
              <Plus size={16} /> Add Field
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSaveSchema} 
            disabled={schemaLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '13px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}
          >
            {schemaLoading ? <Loader size={16} className="att-spin" /> : <Save size={16} />}
            {schemaLoading ? 'Saving...' : `Save ${selectedDept} Schema`}
          </button>
        </div>
      </div>


      {/* Offer Letter Generation */}
      <div className="card" style={{ borderLeft: '4px solid #10b981', width: '100%', marginTop: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', border: 'none', padding: 0 }}>
            <FileText size={20} style={{ color: '#10b981' }} /> Offer Letter Generation (Existing Employees)
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
          Generate customized offer letters for employees already registered in the system. The letter will use the Global Default Template if one is configured in the Onboarding module.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>Select Employee</label>
              <select 
                value={selectedOfferEmpId} 
                onChange={(e) => setSelectedOfferEmpId(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.emp_id})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>Ref String</label>
              <input 
                type="text" 
                value={offerRefStr}
                onChange={(e) => setOfferRefStr(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>Reporting Time</label>
              <input 
                type="text" 
                value={offerReportingTime}
                onChange={(e) => setOfferReportingTime(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>CTC (LPA)</label>
              <input 
                type="text" 
                value={offerCtcLpa}
                onChange={(e) => setOfferCtcLpa(e.target.value)}
                placeholder="e.g. 4.5"
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>Monthly Take Home</label>
              <input 
                type="text" 
                value={offerMonthlyTakeHome}
                onChange={(e) => setOfferMonthlyTakeHome(e.target.value)}
                placeholder="e.g. 35,000"
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-blue)', textTransform: 'uppercase' }}>Update Global DOCX Template</label>
                <input type="file" accept=".docx" onChange={handleGlobalTemplateUploadDocx} style={{ fontSize: '11px', maxWidth: '220px', border: '1px solid #d1d5db', padding: '4px', borderRadius: '4px' }} />
              </div>
              <button type="button" onClick={handlePreviewDocxOffer} disabled={isLoadingOffer || !selectedOfferEmpId} style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: selectedOfferEmpId ? 'pointer' : 'not-allowed', opacity: selectedOfferEmpId ? 1 : 0.6, whiteSpace: 'nowrap' }}>
                {isLoadingOffer ? 'Generating...' : '📥 Preview & Edit DOCX'}
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Want to upload or edit a PDF format instead?</div>
               <button type="button" onClick={handlePreviewOfferLetter} disabled={!selectedOfferEmpId} style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: selectedOfferEmpId ? 'pointer' : 'not-allowed', opacity: selectedOfferEmpId ? 1 : 0.6, whiteSpace: 'nowrap' }}>
                 Open PDF / HTML Editor
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 DOCX EDIT PREVIEW OVERLAY */}
      {showDocxPreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }} onClick={(e) => { if (e.target === e.currentTarget) { setShowDocxPreviewModal(false) } }}>
          <div className="card" style={{ width: '900px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📝 Edit DOCX Offer Letter (CSV Board)
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }} onClick={() => setShowDocxPreviewModal(false)}>✕</button>
            </div>

            <div className="custom-scroll" style={{ overflowY: 'auto', backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', maxHeight: '60vh' }}>
               <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Edit the extracted text blocks below. Click 'Download' when ready.</p>
               
               {isExtractingDocx ? (
                   <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}><Loader className="spin" size={24} /> Extracting DOCX...</div>
               ) : docxExtractedBlocks.length === 0 ? (
                   <div style={{ color: '#ef4444', padding: '10px', textAlign: 'center' }}>No editable text found in this template.</div>
               ) : (
                   docxExtractedBlocks.map((block, idx) => (
                      <div key={idx} style={{ marginBottom: '12px' }}>
                         <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Original: {block}</label>
                         <textarea 
                            rows={2}
                            value={docxEdits[idx] !== undefined ? docxEdits[idx] : block}
                            onChange={(e) => setDocxEdits({...docxEdits, [idx]: e.target.value})}
                            style={{ width: '100%', padding: '8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: '6px', resize: 'vertical', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                         />
                      </div>
                   ))
               )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={handleDownloadEditedDocxOffer} disabled={isLoadingOffer} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isLoadingOffer ? 'Generating...' : '📥 Download Edited DOCX'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Preview Modal (PDF/HTML) */}
      {showOfferPreviewModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '1600px', width: '95%', height: '95vh', display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <FileText size={20} style={{ color: '#10b981' }} />
                ✏️ Edit Offer Letter
                {isLoadingOffer && <span style={{ fontSize: '12px', color: 'var(--accent-pink)' }}>(Processing...)</span>}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', backgroundColor: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>⭐ Global Default PDF Format</label>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleOfferTemplateUpload(e, true)} style={{ fontSize: '11px', maxWidth: '180px', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Upload Custom Format (PDF Only)</label>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleOfferTemplateUpload(e, false)} style={{ fontSize: '12px', maxWidth: '200px', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
                <button onClick={() => setShowOfferPreviewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', height: 'calc(100vh - 140px)', marginTop: '20px' }}>
              <div className="custom-scroll" style={{ flex: currentUploadedFile && currentUploadedFile.type === 'application/pdf' ? '0 0 65%' : 1, overflowY: 'auto', backgroundColor: '#e5e7eb', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '210mm', display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', flexShrink: 0 }}>
                   <button 
                     onClick={handleDownloadEditedOffer}
                     style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                   >
                     📥 Download PDF Preview
                   </button>
                </div>
                <div 
                  ref={offerPreviewRef}
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: (currentUploadedFile && currentUploadedFile.type === 'application/pdf') || globalOfferTemplateHtml ? '0' : '40px',
                    position: 'relative',
                    fontFamily: 'Arial, sans-serif',
                    zoom: '0.85',
                    color: '#000',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
              </div>

              {currentUploadedFile && currentUploadedFile.type === 'application/pdf' && (
              <div className="custom-scroll" style={{ flex: '0 0 35%', overflowY: 'auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column' }}>
                 <h3 style={{ fontSize: '15px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>CSV Board (Text Extracted from PDF)</h3>
                 {isExtractingPdf ? (
                     <div style={{ fontSize: '12px', color: '#6b7280', padding: '10px', textAlign: 'center' }}>Extracting text...</div>
                 ) : pdfExtractedBlocks.length === 0 ? (
                     <div style={{ fontSize: '13px', color: '#ef4444', padding: '10px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                         <strong>No editable text found!</strong><br/>
                         This PDF appears to be a scanned image or photograph. The extraction engine cannot read text from flat images. Please upload a digitally generated PDF or a Word Document instead.
                     </div>
                 ) : (
                     pdfExtractedBlocks.map((block, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                           <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Original: {block}</label>
                           <textarea 
                              rows={2}
                              value={pdfEdits[idx] !== undefined ? pdfEdits[idx] : block}
                              onChange={(e) => setPdfEdits({...pdfEdits, [idx]: e.target.value})}
                              style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical', color: '#111827' }}
                           />
                        </div>
                     ))
                 )}
                 <button 
                    onClick={handleBatchPdfEdit} 
                    disabled={isEditingPdf}
                    style={{ marginTop: '20px', padding: '10px', backgroundColor: isEditingPdf ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: isEditingPdf ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                 >
                    {isEditingPdf ? 'Applying Updates...' : 'Apply All Updates to PDF'}
                 </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 17. MESSAGING & MEET VIEW
