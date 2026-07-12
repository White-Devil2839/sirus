import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './features/home/Home.jsx';
import Login from './features/auth/Login.jsx';
import Signup from './features/auth/Signup.jsx';
import MetadataStep from './features/create/MetadataStep.jsx';
import UploadStep from './features/create/UploadStep.jsx';
import InstantPreview from './features/preview/InstantPreview.jsx';
import QuotationForm from './features/quote/QuotationForm.jsx';
import Dashboard from './features/client/Dashboard.jsx';
import ReportView from './features/client/ReportView.jsx';
import Intake from './features/admin/Intake.jsx';
import RequestDetail from './features/admin/RequestDetail.jsx';

function Protected({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/create" element={<Protected role="client"><MetadataStep /></Protected>} />
        <Route path="/create/:id/upload" element={<Protected role="client"><UploadStep /></Protected>} />
        <Route path="/create/:id/preview" element={<Protected role="client"><InstantPreview /></Protected>} />
        <Route path="/create/:id/quote" element={<Protected role="client"><QuotationForm /></Protected>} />

        <Route path="/dashboard" element={<Protected role="client"><Dashboard /></Protected>} />
        <Route path="/reports/:id" element={<Protected role="client"><ReportView /></Protected>} />

        <Route path="/admin" element={<Protected role="admin"><Intake /></Protected>} />
        <Route path="/admin/:id" element={<Protected role="admin"><RequestDetail /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
