from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
import json

from app import models, database
from app.core import security

router = APIRouter(
    prefix="/ceo-portal",
    tags=["ceo-portal"]
)

# Verify CEO or Admin roles
def verify_ceo_role(user: models.User):
    if user.role not in ["ceo", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden. CEO/Admin privileges required."
        )

# ─── Pydantic Validation Schemas ──────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    title: str
    body: str
    priority: Optional[str] = "Normal"  # Urgent, Normal, Low
    audience: Optional[str] = "All Employees"

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    body: str
    priority: str
    audience: str
    created_at: datetime
    author: str
    read_count: int
    read_pct: float

    class Config:
        from_attributes = True

class PayrollRunResponse(BaseModel):
    id: int
    month: int
    year: int
    status: str
    maker_id: Optional[str]
    maker_signed_at: Optional[datetime]
    checker_id: Optional[str]
    checker_signed_at: Optional[datetime]
    bank_transfer_at: Optional[datetime]

    class Config:
        from_attributes = True

class LoanResponse(BaseModel):
    id: int
    user_id: int
    loan_amount: float
    emi_amount: float
    tenure: int
    disbursed_at: Optional[datetime]
    outstanding_balance: float
    status: str

    class Config:
        from_attributes = True

class ExpenseClaimResponse(BaseModel):
    id: int
    user_id: int
    claim_date: date
    amount: float
    category: str
    receipt_url: Optional[str]
    tl_approval: str
    hr_approval: str
    status: str

    class Config:
        from_attributes = True

class LeaveRequestResponse(BaseModel):
    id: int
    user_id: int
    leave_type: str
    from_date: date
    to_date: date
    days: float
    reason: str
    status: str
    tl_approved_at: Optional[datetime]
    hr_approved_at: Optional[datetime]

    class Config:
        from_attributes = True

class EscalationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    task_link: str
    submitted_at: datetime
    severity: str
    ceo_viewed: bool
    resolved: bool
    dependencies: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    initiator_id: str
    module: str
    record_id: Optional[int]
    action_type: str
    change_diff: Optional[str]
    ip_address: Optional[str]
    client_agent: Optional[str]

    class Config:
        from_attributes = True

class ConfigValueRequest(BaseModel):
    key: str
    value: str

# ─── Endpoints ───────────────────────────────────────────────────────────────

# 1. Telemetry Dashboard
@router.get("/dashboard/summary")
def get_dashboard_summary(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)

    total_headcount = db.query(models.User).filter(models.User.role == "employee", models.User.status == "active").count()
    active_blockers = db.query(models.Escalation).filter(models.Escalation.resolved == False).count()
    
    # Pendings count
    pending_payroll = db.query(models.PayrollRun).filter(models.PayrollRun.status == "maker_signed").count()
    pending_loans = db.query(models.Loan).filter(models.Loan.status == "active", models.Loan.outstanding_balance > 0).count() # Simply active loans
    pending_claims = db.query(models.ExpenseClaim).filter(models.ExpenseClaim.status == "pending").count()
    pending_leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "tl_approved").count() # ready for final sign-off
    
    total_approvals = pending_payroll + pending_claims + pending_leaves
    
    return {
        "headcount": total_headcount,
        "activeBlockers": active_blockers,
        "pendingApprovalsCount": total_approvals,
        "okrProgressAverage": 75.0, # Strategy completion average placeholder
        "riskIndex": "Low" if active_blockers <= 2 else "High"
    }

# 2. Corporate Announcements
@router.get("/announcements", response_model=List[AnnouncementResponse])
def get_announcements(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    # Open to all authenticated users so employees can see announcements
    return db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()

@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(req: AnnouncementCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    
    # Calculate mock reads metrics
    total_users = db.query(models.User).count()
    read_count = int(total_users * 0.65) if total_users > 0 else 0
    read_pct = 65.0
    
    ann = models.Announcement(
        title=req.title,
        body=req.body,
        priority=req.priority,
        audience=req.audience,
        author="CEO Office",
        read_count=read_count,
        read_pct=read_pct
    )
    db.add(ann)
    
    # Auto register audit trail
    db_log = models.AuditLog(
        initiator_id=current_user.name,
        module="Announcements",
        action_type="create",
        change_diff=json.dumps({"announcement_title": req.title})
    )
    db.add(db_log)
    
    db.commit()
    db.refresh(ann)
    return ann

@router.delete("/announcements/{id}")
def delete_announcement(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    ann = db.query(models.Announcement).filter(models.Announcement.id == id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    
    db.delete(ann)
    db.commit()
    return {"status": "success", "message": "Announcement removed."}

# 3. CEO Checker Approvals
@router.get("/approvals/pending")
def get_pending_approvals(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    
    payroll = db.query(models.PayrollRun).filter(models.PayrollRun.status == "maker_signed").all()
    claims = db.query(models.ExpenseClaim).filter(models.ExpenseClaim.status == "pending").all()
    leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "tl_approved").all()
    loans = db.query(models.Loan).filter(models.Loan.status == "active").all()
    
    return {
        "payrollRuns": payroll,
        "expenseClaims": claims,
        "leaveRequests": leaves,
        "loans": loans
    }

@router.post("/payroll/runs/{id}/sign-checker", response_model=PayrollRunResponse)
def sign_payroll_checker(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    run = db.query(models.PayrollRun).filter(models.PayrollRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Payroll run not found.")
        
    run.status = "checker_signed"
    run.checker_id = current_user.name
    run.checker_signed_at = datetime.now()
    
    db_log = models.AuditLog(
        initiator_id=current_user.name,
        module="Finance",
        record_id=id,
        action_type="verify_doc",
        change_diff=json.dumps({"payroll_state": "checker_signed"})
    )
    db.add(db_log)
    
    db.commit()
    db.refresh(run)
    return run

@router.post("/payroll/runs/{id}/transfer-bank", response_model=PayrollRunResponse)
def transfer_payroll_bank(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    run = db.query(models.PayrollRun).filter(models.PayrollRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Payroll run not found.")
        
    run.status = "bank_transferred"
    run.bank_transfer_at = datetime.now()
    
    db_log = models.AuditLog(
        initiator_id=current_user.name,
        module="Finance",
        record_id=id,
        action_type="verify_doc",
        change_diff=json.dumps({"payroll_state": "bank_transferred"})
    )
    db.add(db_log)
    db.commit()
    db.refresh(run)
    return run

@router.post("/loans/{id}/approve", response_model=LoanResponse)
def approve_loan_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    loan = db.query(models.Loan).filter(models.Loan.id == id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan application not found.")
        
    loan.status = "active"
    loan.disbursed_at = datetime.now()
    
    db_notify = models.Notification(
        user_id=loan.user_id,
        message=f"Your loan of ₹{loan.loan_amount} has been approved and disbursed by the CEO.",
        type="success"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(loan)
    return loan

@router.post("/loans/{id}/reject", response_model=LoanResponse)
def reject_loan_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    loan = db.query(models.Loan).filter(models.Loan.id == id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan application not found.")
        
    loan.status = "rejected"
    loan.outstanding_balance = 0.0
    
    db_notify = models.Notification(
        user_id=loan.user_id,
        message=f"Your loan application of ₹{loan.loan_amount} was rejected by the CEO.",
        type="danger"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(loan)
    return loan

@router.post("/expenses/{id}/approve", response_model=ExpenseClaimResponse)
def approve_expense_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    claim = db.query(models.ExpenseClaim).filter(models.ExpenseClaim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Expense claim not found.")
        
    claim.status = "approved"
    
    db_notify = models.Notification(
        user_id=claim.user_id,
        message=f"Your expense claim of ₹{claim.amount} has been approved by the CEO.",
        type="success"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/expenses/{id}/reject", response_model=ExpenseClaimResponse)
def reject_expense_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    claim = db.query(models.ExpenseClaim).filter(models.ExpenseClaim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Expense claim not found.")
        
    claim.status = "rejected"
    
    db_notify = models.Notification(
        user_id=claim.user_id,
        message=f"Your expense claim of ₹{claim.amount} was rejected by the CEO.",
        type="danger"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/leaves/{id}/approve", response_model=LeaveRequestResponse)
def approve_leave_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    req = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found.")
        
    req.status = "hr_approved" # Set to final approved status
    req.hr_approved_at = datetime.now()
    
    # Adjust balance
    bal = db.query(models.LeaveBalance).filter(models.LeaveBalance.user_id == req.user_id).first()
    if bal and hasattr(bal, req.leave_type):
        current_bal = getattr(bal, req.leave_type)
        setattr(bal, req.leave_type, max(0.0, current_bal - req.days))
        
    db_notify = models.Notification(
        user_id=req.user_id,
        message=f"Your leave request from {req.from_date} to {req.to_date} was approved by the CEO.",
        type="success"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(req)
    return req

@router.post("/leaves/{id}/reject", response_model=LeaveRequestResponse)
def reject_leave_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    req = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found.")
        
    req.status = "denied"
    
    db_notify = models.Notification(
        user_id=req.user_id,
        message=f"Your leave request from {req.from_date} to {req.to_date} was rejected by the CEO.",
        type="danger"
    )
    db.add(db_notify)
    db.commit()
    db.refresh(req)
    return req

# 4. Projects & Blocker Escalations
@router.get("/projects/escalations", response_model=List[EscalationResponse])
def get_escalations(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    
    # Mark viewed by CEO
    escalations = db.query(models.Escalation).all()
    for esc in escalations:
        if not esc.ceo_viewed:
            esc.ceo_viewed = True
            
    db.commit()
    return escalations

@router.post("/projects/escalations/{id}/resolve", response_model=EscalationResponse)
def resolve_escalation_ceo(id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    esc = db.query(models.Escalation).filter(models.Escalation.id == id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found.")
        
    esc.resolved = True
    db.commit()
    db.refresh(esc)
    return esc

# 5. Configs & Audit Trails
@router.get("/audit-trail", response_model=List[AuditLogResponse])
def get_audit_trail(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

@router.get("/configs")
def get_system_settings(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    settings_list = db.query(models.SystemSetting).all()
    return {s.key: s.value for s in settings_list}

@router.post("/configs")
def update_system_setting(req: ConfigValueRequest, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    verify_ceo_role(current_user)
    
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == req.key).first()
    if not setting:
        setting = models.SystemSetting(key=req.key, value=req.value)
        db.add(setting)
    else:
        setting.value = req.value
        
    db_log = models.AuditLog(
        initiator_id=current_user.name,
        module="Settings",
        action_type="verify_doc",
        change_diff=json.dumps({"config_key": req.key, "new_value": req.value})
    )
    db.add(db_log)
    db.commit()
    return {"status": "success", "key": req.key, "value": req.value}
