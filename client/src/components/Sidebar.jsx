import { NavLink } from 'react-router-dom';
export default function Sidebar({ user, onLogout }) {
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
                <NavLink className={linkClass} to="/profile">
                    Профиль
                </NavLink>
            </nav>
            <div className="sidebarUser">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <button
                    className="sidebarLogout"
                    type="button"
                    onClick={onLogout}
                >
                    Выйти
                </button>
            </div>
            <div className="sidebarNote">
                <strong>Практика 6</strong>
                <span>Сессии и персональные задачи</span>
            </div>
        </aside>
    );
}