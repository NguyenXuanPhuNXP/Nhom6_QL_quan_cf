import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeePage } from './pages/EmployeePage';
import { SchedulePage } from './pages/SchedulePage';
import { EmployeeSchedulePage } from './pages/EmployeeSchedulePage';
import { AttendancePage } from './pages/AttendancePage';
import { PayrollPage } from './pages/PayrollPage';
import { LeaveRequestPage } from './pages/LeaveRequestPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccountPage } from './pages/AccountPage';
import { MainLayout } from './layouts/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'employees',
        element: <EmployeePage />,
      },
      {
        path: 'accounts',
        element: <AccountPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'my-schedule',
        element: <EmployeeSchedulePage />,
      },
      {
        path: 'attendance',
        element: <AttendancePage />,
      },
      {
        path: 'payroll',
        element: <PayrollPage />,
      },
      {
        path: 'leave-requests',
        element: <LeaveRequestPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
