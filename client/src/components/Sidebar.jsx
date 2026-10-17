export default function Sidebar() {
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
 <button className="menuItem active" type="button">Обзор</button>
 <button className="menuItem" type="button">Мои задачи</button>
 <button className="menuItem" type="button">Доска</button>
 <button className="menuItem" type="button">Проекты</button>
 </nav>
 <div className="sidebarNote">
 <strong>Практика 1</strong>
 <span>Статический интерфейс на React</span>
 </div>
 </aside>
 );
}
