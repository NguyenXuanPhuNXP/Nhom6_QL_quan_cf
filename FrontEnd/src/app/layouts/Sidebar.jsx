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

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Cafe Manager</h1>
            <p className="text-xs text-slate-400">Quản lý nhân sự</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#3b82f6] text-white shadow-lg'
                      : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e293b]">
        <div className="text-xs text-slate-400 text-center">
          © 2026 Cafe Manager
        </div>
      </div>
    </aside>
  );
};
