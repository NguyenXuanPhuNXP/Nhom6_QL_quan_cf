import { Outlet } from 'react-router';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
      <main className="mt-16 p-4 sm:p-6 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};
