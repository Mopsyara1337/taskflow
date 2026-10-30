import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingState from './components/LoadingState.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskDetailsPage from './pages/TaskDetailsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { getCurrentUser, logoutUser } from './api/authApi.js';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from './api/tasksApi.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    loadTasks();
  }, [user]);
  async function loadTasks() {
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
  function handleAuthenticated(currentUser) {
    setUser(currentUser);
    setTasks([]);
  }
  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setTasks([]);
      setError('');
    }
  }
  const filteredTasks = tasks.filter((task) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.project.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === 'Все' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        const updated = await updateTask(editingTask.id, taskData);
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
    if (!confirmed) return;
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
  if (authLoading) {
    return (
      <main className="authPage">
        <LoadingState />
      </main>
    );
  }
  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterPage onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route element={<ProtectedRoute user={user} />}>
        <Route
          element={
            <AppLayout user={user} onLogout={handleLogout} />
          }
        >
          <Route
            path="/"
            element={
              <DashboardPage
                tasks={tasks}
                loading={loading}
                error={error}
                onRetry={loadTasks}
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
                loading={loading}
                error={error}
                search={search}
                statusFilter={statusFilter}
                isFormOpen={isFormOpen}
                editingTask={editingTask}
                onRetry={loadTasks}
                onSearchChange={setSearch}
                onStatusFilterChange={setStatusFilter}
                onResetFilters={() => {
                  setSearch('');
                  setStatusFilter('Все');
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
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
