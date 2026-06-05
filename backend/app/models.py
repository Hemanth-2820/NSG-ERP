from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # employee, tl, ceo, hr, admin
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    attendance_records = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    attendance_corrections = relationship("AttendanceCorrection", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    clock_in = Column(DateTime(timezone=True), nullable=True)
    clock_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="present")  # present, absent, late, half-day, leave
    total_hours = Column(Float, nullable=True)
    work_mode = Column(String, default="office")  # office, wfh
    is_late = Column(Boolean, default=False)
    exception_flag = Column(String, default="none")  # none, absent, missed-punch

    # Relationships
    user = relationship("User", back_populates="attendance_records")

class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    correction_date = Column(Date, nullable=False, index=True)
    requested_clock_in = Column(DateTime(timezone=True), nullable=False)
    requested_clock_out = Column(DateTime(timezone=True), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, approved, denied

    # Relationships
    user = relationship("User", back_populates="attendance_corrections")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    type = Column(String, default="warning")  # warning, success, danger, info
    read = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="notifications")

