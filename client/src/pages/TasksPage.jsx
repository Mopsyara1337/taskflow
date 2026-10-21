import ErrorState from '../components/ErrorState.jsx';
import Header from '../components/Header.jsx';
import LoadingState from '../components/LoadingState.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskToolbar from '../components/TaskToolbar.jsx';
export default function TasksPage({
    filteredTasks,
    loading,
    error,
    search,
    statusFilter,
    isFormOpen,
    editingTask,
    onRetry,
    onSearchChange,
    onStatusFilterChange,
    onResetFilters,
    onCreateTask,
    onEditTask,
    onCloseForm,
    onSaveTask,
    onDeleteTask,
    onStatusChange,
    priorityFilter,
    onPriorityFilterChange,
    onRefresh,
}) {
    if (loading) {
        return <LoadingState />;
    }
    return (
        <>
            <Header onCreateTask={onCreateTask} />
            {error && (
                <ErrorState message={error} onRetry={onRetry} />
            )}
            <section className="panel">
                <div className="sectionHeading">
                    <div>
                        <p className="eyebrow">Задачи</p>
                        <h2>Все задачи</h2>
                    </div>

                    <button
                        className="ghostButton"
                        type="button"
                        onClick={onRefresh}
                    >
                        Обновить
                    </button>
                </div>
                <TaskToolbar
                    search={search}
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                    onSearchChange={onSearchChange}
                    onStatusFilterChange={onStatusFilterChange}
                    onPriorityFilterChange={onPriorityFilterChange}
                    onResetFilters={onResetFilters}
                />
                <div className="taskList">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                onStatusChange={onStatusChange}
                            />
                        ))
                    ) : (
                        <div className="emptyState">
                            <strong>Задачи не найдены</strong>
                            <p>Измените поиск или фильтр.</p>
                        </div>
                    )}
                </div>
            </section>
            {isFormOpen && (
                <TaskForm
                    task={editingTask}
                    onSave={onSaveTask}
                    onCancel={onCloseForm}
                />
            )}
        </>
    );
}