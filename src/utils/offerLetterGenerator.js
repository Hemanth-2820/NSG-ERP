import html2pdf from 'html2pdf.js';

export const getOfferLetterHTML = (data) => {
  // Common Header HTML
  const headerHTML = `
    <div style="padding: 20px 40px 10px 40px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <img src="/hmns-logo.png" style="height: 65px;" alt="Logo" />
        <div style="font-size: 26px; font-weight: bold; color: #1e3a8a; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">HMNS SOFTWARE SOLUTION PVT LTD.</div>
      </div>
      <div style="margin-top: 15px; border-bottom: 1.5px solid #1e3a8a;"></div>
      <div style="margin-top: 2px; border-bottom: 2px solid #22c55e;"></div>
    </div>
  `;

  // Common Footer HTML
  const footerHTML = `
    <div style="position: absolute; bottom: 0; left: 0; right: 0;">
      <div style="padding: 0 40px 10px 40px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: bold;">
        <span style="color: #1e3a8a; font-size: 18px;">📍</span>
        <span>2nd floor, Madhavi Nagar, Kukatpally, Hyderabad, Telangana   500072</span>
      </div>
      <div style="background-color: #1e3a8a; height: 15px; width: 100%; position: relative;">
        <div style="position: absolute; top: 0; right: 0; background-color: #22c55e; height: 100%; width: 30%; clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);"></div>
      </div>
      <div style="position: absolute; bottom: 18px; left: 40px; font-size: 14px; color: #2563eb; text-decoration: underline;">
        www.hmnssoftware.com <span style="margin-left: 5px;">Email: hr@hmnssoftware.in</span>
      </div>
    </div>
  `;

  const pageWrapper = (content) => `
    <div style="width: 210mm; height: 296mm; position: relative; overflow: hidden; box-sizing: border-box; page-break-after: always; background: white;">
      ${headerHTML}
      <div style="padding: 20px 50px; font-size: 14.5px; line-height: 1.5; z-index: 10; position: relative; text-align: justify;">
        ${content}
      </div>
      ${footerHTML}
    </div>
  `;

  // PAGE 1 Content
  const page1 = pageWrapper(`
    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 20px; font-size: 15px;">
      <div>Ref: ${data.refNumber}</div>
      <div>${data.offerDate}</div>
    </div>
    
    <div style="margin-top: 30px; font-weight: bold; font-size: 15px;">
      MS. ${data.candidateName.toUpperCase()}
    </div>
    
    <div style="text-align: center; color: #0ea5e9; font-weight: bold; font-size: 18px; margin-top: 30px; text-decoration: underline;">
      CONFIDENTIAL – OFFER OF EMPLOYMENT
    </div>
    
    <div style="margin-top: 30px;">
      Dear <strong>${data.candidateName.toUpperCase()}</strong>,
    </div>
    
    <div style="margin-top: 20px; font-weight: bold; font-size: 15px;">
      Welcome to HMNS SOFTWARE SOLUTIONS PVT LTD.
    </div>
    
    <div style="margin-top: 15px;">
      Congratulations! We Welcome you on Board.
    </div>
    
    <div style="margin-top: 20px;">
      With reference to your application and subsequent interview, we accept to make you an Offer
      with HMNS SOFTWARE SOLUTIONS PVT LTD as <strong>${data.role.toUpperCase()}</strong> You are required
      to Report on ${data.joiningDate} at ${data.reportingTime}; at the address: HMNS SOFTWARE
      SOLUTIONS PVT LTD 2nd floor, Madhavi Co Operative Society, A/1, Usha Mullapudi Cardio
      Hospital road, Near South India Mall, Madhavi Nagar Kukatpally, Jaya Nagar, Kukatpally,
      Hyderabad, Telangana-500072. Please note that the remuneration for this position will be <strong>₹ ${data.ctcLpa}
      (Cost to Company)</strong> with a monthly take-home salary of ₹${data.monthlySalary}."
    </div>
    
    <div style="margin-top: 20px; font-weight: bold; font-size: 15px;">
      Acceptance Terms:
    </div>
    
    <div style="margin-top: 15px;">
      Your appointment will be effective on your Joining date, i.e., ${data.joiningDate}. Please contact us
      immediately if you require an alternative Joining date. If you do not confirm your acceptance or
      we are unable to set an alternative date, this offer will be withdrawn.
    </div>
    
    <div style="margin-top: 20px;">
      Please see the employment terms and conditions noted in this letter and the annexure for details
      related to your compensation structure. Once you have reviewed the letter in full, please sign each
      page of this letter in acceptance of the employment terms and conditions.
    </div>
    
    <div style="margin-top: 20px;">
      We very much look forward to welcoming you to HMNS SOFTWARE SOLUTIONS PVT LTD.
    </div>
  `);

  // PAGE 2 Content
  const page2 = pageWrapper(`
    <div style="margin-top: 10px; font-weight: bold; font-size: 15px;">Date of Joining:</div>
    <div style="margin-top: 5px;">
      If you accept this offer before the stipulated date you must report on duty and commence your job
      not later than ${data.joiningDate.toUpperCase()}. In case you do not report on the agreed upon date, HMNS
      SOFTWARE SOLUTIONS may deem that you have declined this offer.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Office Hours:</div>
    <div style="margin-top: 5px;">
      Our usual office hours are of 9-hours duration every day, Monday to Friday, with one hour
      normally allowed for lunch. Your office hours can change in the future since we support work
      requirements across different time zones globally.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Training:</div>
    <div style="margin-top: 5px;">
      You will hold yourself in readiness for any training at any place whenever required. Such training
      would be imparted to you at the company’s expense. Kindly note that refusal to participate in a
      training Program without any extraneous circumstances would lead to automatic termination of
      your employment.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Secrecy/Confidentiality:</div>
    <div style="margin-top: 5px;">
      You will not during the course of your employment with the company or at any time thereafter
      divulge or disclose to any person whomsoever, make any use whatsoever for your own purpose or
      for any other purpose other than that of the company, of any information or knowledge obtained
      by you during your employment as to the business or affairs of the company including
      development, process reports and reporting system and you will during the course of your
      employment here under also use your best endeavor to prevent any other person from doing so.
    </div>
    <div style="margin-top: 10px;">
      This offer letter and your employment with the company are subject to:<br/>
      Satisfactory results of a complete background and reference check carried out by the company.<br/><br/>
      You are required to sign of Employment Agreement, Non-Disclosure & Non-Compete
      Agreement and the annexure annexed herewith (if applicable). Please note that in the event it is
      found that you have not complied with these conditions, your employment can be terminated
      forthwith by the company without any notice period or compensation and without any reasons
      thereof.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Probation/Conformation:</div>
    <div style="margin-top: 5px;">
      A) You will initially be on probation for a period of Three to Six Months from the date of joining,
      which may be extended or reduced at the sole discretion of the company. If your services are either
      not confirmed or not terminated on completion of the initial period of probation, the probationary
      period will automatically be extended till the date of issue of confirmation or termination, (Based
      on Performance) as the case may be.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Assignments/Transfer/Deputation:</div>
    <div style="margin-top: 5px;">
      Your will be initially based in Hyderabad. However, HMNS SOFTWARE SOLUTIONS, at its
      discretion can transfer you to any of its subsidiary or affiliate company or client offices in India or
      overseas. In such cases, your employment may be governed by the terms and conditions applicable
      at the new location/ company.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Verification of particulars:</div>
    <div style="margin-top: 5px;">
      You acknowledge and agree that the company has offered you employment based on the specific
      information and records furnished by you. All particulars furnished by you vide your application
      are taken to be true and correct. In case any of these particulars turn out to be false or incorrect on
    </div>
  `);

  // PAGE 3 Content
  const page3 = pageWrapper(`
    <div style="margin-top: 10px;">
      verification, the company may at this absolute discretion elect to terminate or suspend your
      services without any notice or assigning any reason thereof.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Termination of Employment:</div>
    <div style="margin-top: 5px;">
      A) During the initial Probation period as mentioned in Offer letter, your performance would be
      closely monitored and if your performance is not up to the mark, The Company reserves the right
      to terminate your services without prior notice.
    </div>
    <div style="margin-top: 10px;">
      B) Unauthorized absence or absence without permission from duty for a continuous period of
      7working days would make you lose your lien on employment. In such case your employment
      shall automatically come to an end without any notice of termination or notice Pay.
    </div>
    <div style="margin-top: 10px;">
      C) You will be governed by the laid down code of conduct of the company and if there is any
      breach of the same or non-conformance of contractual obligation or with the terms and conditions
      laid down in this agreement, your service can be terminated without any notice; notwithstanding
      any other terms and conditions stipulated herein the company reserves the right to invoke other
      legal remedies as it deems fit to protect its legitimate interest.
    </div>
    <div style="margin-top: 20px;">
      You have to agree client Package and location after Your probation period (company Client or
      other company, Pan India Locations), otherwise company will terminate you.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Mandatory period of service:</div>
    <div style="margin-top: 5px;">
      In consideration of impartation of Probation, you shall work in the Company at least for a period
      of 12 months from the date of successful completion of Probation period.
    </div>
    <div style="margin-top: 10px;">
      During such period of Probation (including on job training) and Mandatory Period of Service of12
      months thereafter, you shall not leave, abandon or resign from the services of the Company.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Leave Policy:</div>
    <div style="margin-top: 5px;">
      Employee under probation is not entitled for any leave. After successful completion of probation,
      an employee is entitled for 01-day casual leave for every completed month. However, an employee
      should not avail more than 03 days of accumulated leave at a time. Leave application must be
      applied on hr@hmnssoftware.in at least 3 days prior to the date of availing the leave. Any absence
      without proper approval from the competent authority of the company will lead to deduction in
      the pay and also disciplinary action as per the existing rules of the company.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Code of conduct:</div>
    <div style="margin-top: 5px; display: flex; gap: 10px;">
      <div>A)</div>
      <div>Your individual remuneration is purely a matter between yourself and the company and has
      been arrived at based on your job, skills, specific background and professional merit.
      Accordingly, any changes made to it your salary are strictly confidential. You shall treat
      such matters accordingly, and any breach thereof would be viewed very seriously.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 10px;">
      <div>B)</div>
      <div>You shall maintain proper discipline and dignity of your office and shall deal with all matter
      with sobriety.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 10px;">
      <div>C)</div>
      <div>You shall inform the company of any changes in your personal data within three days of the
      occurrence of such change.</div>
    </div>
  `);

  // PAGE 4 Content
  const page4 = pageWrapper(`
    <div style="margin-top: 10px; display: flex; gap: 10px;">
      <div>D)</div>
      <div>your salary would count from your training starting date.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 10px;">
      <div>E)</div>
      <div>in your Reporting time you must submit Education Documents, Aadhar card and Pan Card
      at the time of reporting, you must submit. Non-Submission of the same may lead to
      cancellation of the offer letter.</div>
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Other Conditions:</div>
    <div style="margin-top: 5px;">
      I. The company expects you to work with a high standard of initiative, efficiency and
      economy.
    </div>
    <div style="margin-top: 10px;">
      II. You will devote your entire time to the work of the company and will not directly/ indirectly
      undertake any business or work for any company or entity or person other than HMNS
      SOFTWARE SOLUTIONS PVT LTD.
    </div>
    <div style="margin-top: 10px;">
      You will be responsible for the safekeeping and return in good condition and order all the property
      of the company which is in your possession, use, custody or charge. You shall make good of any
      loss or damage that occurs to any company property which is in your possession/ custody.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Annexure - I</div>
    <div style="margin-top: 5px;">
      1. You need to furnish the following Documents at the time of joining HMNS SOFTWARE
      SOLUTIONS.NOTE: Joining will not happen without these documents.
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>A</div>
      <div>Original copy of <strong>HMNS SOFTWARE SOLUTIONS</strong> offer letter</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>B</div>
      <div><strong>DATE OF BIRTH PROOF:</strong> Mandatory is Aadhar Card. If no Aadhar Card or incomplete
      details on Aadhar card then the following will apply- (Any ONE of the following:
      Birth Certificate, Xth, XIIth Mark Sheet with DOB details on it, Passport, PAN Card, Driving
      License, School/College Leaving Certificate) - 1 copy</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>C</div>
      <div><strong>HMNS OTO ID:</strong> Aadhar OR PAN Card in the absence of both then the following will
      apply- (ONE of the following: VotersID, Driving License, Passport, or Bank Passbook with
      HMNS photograph hmns, Banker verification, NSR (National Skills Registry) ID card - 1copy</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>D</div>
      <div><strong>PERMANENT ADDRESS PROOF:</strong> (ONE of the following: Passport, Driving License,
      Voter’s ID Nationalized Bank Passbook with HMNS photograph HMNS and address,
      Electricity Bill - latest of Self or Parent Ration Card, LIC & Insurance documents, Mobile
      Bill, Tele HMNS one Landline Bill – latest of Self Parents, or Current lease deed – with
      you or your parents / spouse as lessee or co-lessee) - 1 copy. The information for address
      needs to be verifiable during BGV and hence the same needs to be the latest permanent
      address proof.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>E</div>
      <div><strong>EDUCATION QUALIFICATION PROOF:</strong> (mark sheets & degree are important) (as
      applicable, 10th, inter, Graduation, Post-Graduation Certificate, Copy of Diploma, others)</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>F</div>
      <div><strong>PASSPORT SIZE HMNS OTOGRAHMNS S:</strong> 5 copies (with White Background ONLY)</div>
    </div>
  `);

  // PAGE 5 Content
  const page5 = pageWrapper(`
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>G</div>
      <div><strong>PAN NUMBER:</strong> HMNS photocopy of PAN Card. If you do not possess a PAN card then
      an application forgone will have to be made and a copy of the application receipt will have
      to be submitted.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>H</div>
      <div>Professional Relieving or Experience Letter from previous employer (last 2 employments)
      or Accepted Resignation Letter from previous employer.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>I</div>
      <div>Salary Slip / Salary certificate from previous employer (last 2 employments). Bank
      statement if no salary slips from the Company.</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>J</div>
      <div>Employee ID Proof: (HMNS photocopy of salary slips, appraisal letter which contains the
      employee id proof)</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>K</div>
      <div>Marriage Certificate (if applicable) OR Marriage Affidavit with Couple HMNS photocopy</div>
    </div>
    <div style="margin-top: 10px; display: flex; gap: 15px;">
      <div>L</div>
      <div>Self-declaration Medical Fitness form: Medical Fitness form needs to be duly filled and
      stamped by a doctor.</div>
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Annexure - II</div>
    <div style="margin-top: 5px;">
      Salary: Your salary will be paid monthly through bank, for which you would be required to open
      a Bank A/c with any of the Company specified Bank/s. Disbursement of Salary is subject to your
      regular attendance, submission and updating of Permanent Account Number (PAN) details in the
      Company's records. Variable pay is different from the package.
    </div>

    <div style="margin-top: 15px; font-weight: bold; font-size: 15px;">Amendments:</div>
    <div style="margin-top: 5px;">
      The Company, at its discretion, may alter, replace or annul any of the above, should circumstances
      so warrant either as a result of statute or otherwise. All changes will duly be updated on the
      company intranet and will be duly notified to the employees through proper channels. should have
      to follow the company rules Time-Time.
    </div>
    <div style="margin-top: 10px;">
      If you agree to accept this position, please notify in writing by signing your name and mentioning
      the date of joining at the bottom of this page indicating your acceptance of this appointment. A
      copy of this letter will be provided to you.
    </div>
    <div style="margin-top: 10px;">
      Irrespective of whether you join HMNS SOFTWARE SOLUTIONS Pvt. Ltd or not, you shall keep
      all the details contained in this letter confidential. please mark all of your correspondence
      "Confidential"
    </div>

    <div style="margin-top: 30px; font-weight: bold; font-size: 15px;">
      ${data.candidateName.toUpperCase()}, <span style="font-weight: normal;">I take this opportunity to welcome you to HMNS SOFTWARE
      SOLUTIONS PVT LTD,</span>
    </div>

    <div style="margin-top: 30px;">
      Acceptance:
    </div>

    <div style="margin-top: 20px; font-weight: bold;">
      I ${data.candidateName.toUpperCase()}, <span style="font-weight: normal;">hereby confirm acceptance of all of the above terms and conditions,
      and will join.</span>
    </div>

    <div style="margin-top: 40px; font-weight: bold; font-size: 15px;">
      Signature:
    </div>
  `);

  return `
    <div contentEditable=\"true\" style=\"background-color: #fff; color: #000; font-family: 'Times New Roman', Times, serif; width: 210mm; outline: none;\">
      ${page1}${page2}${page3}${page4}${page5}
    </div>
  `;
};

export const generateOfferLetterPDF = async (data, customHTML = null) => {
  const htmlContent = customHTML || getOfferLetterHTML(data);

  // Configure html2pdf options
  const opt = {
    margin:       0,
    filename:     `${data.candidateName.replace(/\s+/g, '_')}_Offerletter.pdf`,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generate and save the PDF
  try {
    await html2pdf().set(opt).from(htmlContent).save();
  } catch (err) {
    console.error("PDF Generation Error: ", err);
    throw err;
  }
};
