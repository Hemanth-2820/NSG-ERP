import React, { useState, useEffect } from 'react';import { HrDashboardView } from './modules/dashboard/HrDashboardView';
import { RecruitmentView } from './modules/recruitment/RecruitmentView';
import { EmployeeRegistryView } from './modules/employees/EmployeeRegistryView';
import { OnboardingView } from './modules/onboarding/OnboardingView';
import { AttendanceRegisterView } from './modules/attendance/AttendanceRegisterView';
import { TimesheetExceptionsView } from './modules/timesheets/TimesheetExceptionsView';
import { LeaveManagementView } from './modules/leave/LeaveManagementView';
import { PayrollBuilderView } from './modules/payroll/PayrollBuilderView';
import { AppraisalsView } from './modules/appraisals/AppraisalsView';
import { ExitFnFView } from './modules/exits/ExitFnFView';
import { LearningLndView } from './modules/lnd/LearningLndView';
import { ReportsEngineView } from './modules/reports/ReportsEngineView';
import { HrSettingsView } from './modules/settings/HrSettingsView';
import { HrMessagingView } from './modules/messaging/HrMessagingView';

export default function Hr({ activeTab, queryParams, setQueryParams, currentUser }) {

  // Router for rendering the 17 custom-stylized HR modules
  const renderTabContent = () => {
    const props = { queryParams, setQueryParams, currentUser };
    switch (activeTab) {
      case 'dashboard':
        return <HrDashboardView {...props} />;
      case 'recruitment':
        return <RecruitmentView {...props} />;
      case 'employees':
        return <EmployeeRegistryView {...props} />;
      case 'onboarding':
        return <OnboardingView {...props} />;
      case 'attendance':
        return <AttendanceRegisterView {...props} />;
      case 'timesheets':
        return <TimesheetExceptionsView {...props} />;
      case 'leave':
        return <LeaveManagementView {...props} />;
      case 'payroll':
        return <PayrollBuilderView {...props} userRole="HR" />;
      case 'appraisals':
        return <AppraisalsView {...props} />;
      case 'exits':
        return <ExitFnFView {...props} />;
      case 'lnd':
        return <LearningLndView {...props} />;
      case 'reports':
        return <ReportsEngineView {...props} />;
      case 'settings':
        return <HrSettingsView {...props} />;
      case 'messaging':
        return <HrMessagingView {...props} />;
      default:
        return <HrDashboardView {...props} />;
    }
  };

  return renderTabContent();
}
