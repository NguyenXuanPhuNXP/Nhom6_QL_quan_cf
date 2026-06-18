import { RouterProvider } from 'react-router';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
