import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
export default function AppLayout({ user, onLogout }) {
    return (
        <div className="appShell">
            <Sidebar user={user} onLogout={onLogout} />
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}