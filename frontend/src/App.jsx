import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaMicrophone, FaFont, FaHistory, FaHome, FaCog, FaSignOutAlt, FaImage, FaComments } from "react-icons/fa";
import api from "./api";
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import { Forgot, ResetPassword } from "./pages/Reset";
import Vision from "./pages/Vision";
import Conversation from "./pages/Conversation";
import Dash from "./pages/Dashboard";
import Voice from "./pages/Voice";
import Text from "./pages/Text";
import History from "./pages/History";
import Settings from "./pages/Settings";

const Guard = () => (localStorage.getItem("vt_token") ? <Shell /> : <Navigate to="/login" replace />);

function Shell() {
  const nav = useNavigate();
  const out = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("vt_token");
    nav("/");
  };

  const L = ({ to, icon, children }) => (
    <NavLink
      to={to}
      end={to === "/app"}
      className="navlink"
      aria-label={typeof children === "string" ? children : undefined}
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Application navigation">
        <h2 className="sidebar-header">VoiceTranslate</h2>
        <nav className="sidebar-nav">
          <L to="/app" icon={<FaHome />}>Dashboard</L>
          <L to="/app/voice" icon={<FaMicrophone />}>Voice translation</L>
          <L to="/app/text" icon={<FaFont />}>Text translation</L>
          <L to="/app/vision" icon={<FaImage />}>AI vision</L>
          <L to="/app/conversation" icon={<FaComments />}>Conversation</L>
          <L to="/app/history" icon={<FaHistory />}>History</L>
          <L to="/app/settings" icon={<FaCog />}>Settings</L>
        </nav>
        <div className="sidebar-footer">
          <button className="navlink" onClick={out} aria-label="Log out of VoiceTranslate">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<Forgot />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/app" element={<Guard />}>
        <Route index element={<Dash />} />
        <Route path="voice" element={<Voice />} />
        <Route path="text" element={<Text />} />
        <Route path="vision" element={<Vision />} />
        <Route path="conversation" element={<Conversation />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
