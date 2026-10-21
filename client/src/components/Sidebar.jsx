import { NavLink } from 'react-router-dom';
export default function Sidebar() {
    function linkClass({ isActive }) {
        return isActive ? 'menuItem active' : 'menuItem';
    }
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brandMark">T</div>
                <div>
                    <strong>TaskFlow</strong>
                    <span>student edition</span>
                </div>
            </div>
            <nav className="menu" aria-label="Основная навигация">
                <NavLink className={linkClass} to="/" end>
                    Обзор
                </NavLink>
                <NavLink className={linkClass} to="/tasks">
                    Мои задачи
                </NavLink>
            </nav>
            <div className="sidebarNote">
                <strong>Практика 5</strong>
                <span>React + REST API + Router</span>
            </div>
        </aside>
    );
}
