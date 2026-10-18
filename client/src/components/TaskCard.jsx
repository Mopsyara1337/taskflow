function getStatusClass(status) {
   if (status === 'Готово') return 'status done';
   if (status === 'В работе') return 'status progress';
   return 'status todo';
}
function formatDate(value) {
   if (!value) return 'Без срока';
   const date = new Date(`${value}T00:00:00`);
   return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
   }).format(date);
}
export default function TaskCard({
   task,
   onEdit,
   onDelete,
   onStatusChange,
}) {
   return (
      <article className="taskCard">
         <div className="taskMain">
            <div className="taskTopLine">
               <span className={getStatusClass(task.status)}>
                  {task.status}
               </span>
               <span className="priority">{task.priority}</span>
            </div>
            <h3>{task.title}</h3>
            <p>{task.project}</p>
            <div className="taskActions">
               {task.status !== 'В работе' && (
                  <button
                     type="button"
                     onClick={() => onStatusChange(task.id, 'В работе')}
                  >
                     В работу
                  </button>
               )}
               {task.status !== 'Готово' && (
                  <button
                     type="button"
                     onClick={() => onStatusChange(task.id, 'Готово')}
                  >
                     Готово
                  </button>
               )}
               <button
                  type="button"
                  onClick={() => onEdit(task)}
               >
                  Изменить
               </button>
               <button
                  className="dangerAction"
                  type="button"
                  onClick={() => onDelete(task.id)}
               >
                  Удалить
               </button>
            </div>
         </div>
         <div className="taskDate">
            <span>Срок</span>
            <strong>{formatDate(task.dueDate)}</strong>
         </div>
      </article>
   );
}
