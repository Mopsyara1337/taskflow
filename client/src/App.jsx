import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';
import TaskCard from './components/TaskCard.jsx';
import { tasks } from './data/tasks.js';
export default function App() {
  return (
 <div className="appShell">
 <Sidebar />
 <main className="content">
 <Header />
 <section className="statsGrid" aria-label="Статистика">
 <StatCard label="Всего задач" value="12" note="+3 за эту неделю" />
 <StatCard label="В работе" value="4" note="Нужны сегодня" />
 <StatCard label="Готово" value="6" note="Хороший темп" />
 <StatCard label="Проектов" value="3" note="Учёба и портфолио" />
 </section>
 <section className="panel">
 <div className="sectionHeading">
 <div>
 <p className="eyebrow">Фокус</p>
 <h2>Ближайшие задачи</h2>
 </div>
 <button className="ghostButton" type="button">Показать все</button>
 </div>

<div className="taskList">
 {tasks.map((task) => (
 <TaskCard key={task.id} task={task} />
 ))}
 </div>
 </section>
 </main>
 </div>
 );
}
