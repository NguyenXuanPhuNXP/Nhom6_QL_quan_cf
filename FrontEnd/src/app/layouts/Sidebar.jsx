import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  DollarSign,
  FileText,
  Bell,
  User,
  Coffee,
  X,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Nhân viên', path: '/employees' },
  { icon: Calendar, label: 'Phân ca', path: '/schedule' },
  { icon: ClipboardCheck, label: 'Chấm công', path: '/attendance' },
  { icon: DollarSign, label: 'Lương', path: '/payroll' },
  { icon: FileText, label: 'Nghỉ phép', path: '/leave-requests' },
  { icon: Bell, label: 'Thông báo', path: '/notifications' },
  { icon: User, label: 'Hồ sơ', path: '/profile' },
];

export const Sidebar = ({ isOpen = false, onClose }) => {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={onClose}
          aria-label="Đóng menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#0f172a] text-white transition-transform duration-200 md:z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-[#1e293b] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]">
              <Coffee className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">Cafe Manager</h1>
              <p className="truncate text-xs text-slate-400">Quản lý nhân sự</p>
            </div>
            <button
              type="button"
              className="ml-auto rounded-md p-2 text-slate-300 hover:bg-[#1e293b] hover:text-white md:hidden"
              onClick={onClose}
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-lg'
                        : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#1e293b] p-4">
          <div className="text-center text-xs text-slate-400">
            © 2026 Cafe Manager
          </div>
        </div>
      </aside>
    </>
  );
};
