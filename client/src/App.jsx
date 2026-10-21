import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskDetailsPage from './pages/TaskDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from './api/tasksApi.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [priorityFilter, setPriorityFilter] = useState('Все');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  useEffect(() => {
    async function loadInitialTasks() {
      setLoading(true);
      setError('');
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
    loadInitialTasks();
  }, []);
  async function reloadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }
  const filteredTasks = tasks.filter((task) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.project.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === 'Все' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'Все' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  function openCreateForm() {
    setEditingTask(null);
    setIsFormOpen(true);
  }
  function openEditForm(task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }
  function closeForm() {
    setEditingTask(null);
    setIsFormOpen(false);
  }
  async function handleSaveTask(taskData) {
    setError('');
    try {
      if (editingTask) {
        const updated = await updateTask(
          editingTask.id,
          taskData
        );
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === updated.id ? updated : task
          )
        );
      } else {
        const created = await createTask(taskData);
        setTasks((currentTasks) => [created, ...currentTasks]);
      }
      closeForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm('Удалить эту задачу?');
    if (!confirmed) {
      return;
    }
    setError('');
    try {
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  async function handleStatusChange(taskId, status) {
    setError('');
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updated.id ? updated : task
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return (
    <div className="appShell">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                tasks={tasks}
                loading={loading}
                error={error}
                onRetry={reloadTasks}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksPage
                filteredTasks={filteredTasks}
                onRefresh={reloadTasks}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                loading={loading}
                error={error}
                search={search}
                statusFilter={statusFilter}
                isFormOpen={isFormOpen}
                editingTask={editingTask}
                onRetry={reloadTasks}
                onSearchChange={setSearch}
                onStatusFilterChange={setStatusFilter}
                onResetFilters={() => {
                  setSearch('');
                  setStatusFilter('Все');
                  setPriorityFilter('Все');
                }}
                onCreateTask={openCreateForm}
                onEditTask={openEditForm}
                onCloseForm={closeForm}
                onSaveTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            }
          />
          <Route
            path="/tasks/:id"
            element={<TaskDetailsPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}