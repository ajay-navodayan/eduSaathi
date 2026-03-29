import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Guiders from './pages/Guiders';
import GuiderProfile from './pages/GuiderProfile';
import Notifications from './pages/Notifications';
import Resources from './pages/Resources';
import Tutors from './pages/Tutors';
import Login from './pages/Login';
import Register from './pages/Register';
import GuiderDashboard from './pages/GuiderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guiders" element={<Guiders />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/tutors" element={<Tutors />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/guiders/:id" element={<GuiderProfile />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/guider-dashboard" element={<GuiderDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
