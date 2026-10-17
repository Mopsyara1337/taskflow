function getStatusClass(status) {
 if (status === 'Готово') return 'status done';
 if (status === 'В работе') return 'status progress';
 return 'status todo';
}
export default function TaskCard({ task }) {
 return (
 <article className="taskCard">
    <div className="taskMain">
 <div className="taskTopLine">
 <span className={getStatusClass(task.status)}>{task.status}</span>
 <span className="priority">{task.priority}</span>
 </div>
 <h3>{task.title}</h3>
 <p>{task.project}</p>
 </div>
 <div className="taskDate">
 <span>Срок</span>
 <strong>{task.dueDate}</strong>
 </div>
 </article>
 );
}