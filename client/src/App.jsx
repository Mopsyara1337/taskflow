import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskToolbar from './components/TaskToolbar.jsx';
import { initialTasks } from './data/tasks.js';

const STORAGE_KEY = 'taskflow.tasks';

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return initialTasks;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialTasks;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );
  }, [tasks]);
  const filteredTasks = tasks.filter((task) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.project.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === 'Все' ||
      task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalCount = tasks.length;
  const progressCount = tasks.filter(
    (task) => task.status === 'В работе'
  ).length;
  const doneCount = tasks.filter(
    (task) => task.status === 'Готово'
  ).length;
  const projectCount = new Set(
    tasks.map((task) => task.project)
  ).size;

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

  function handleSaveTask(taskData) {
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
      closeForm();
      return;
    }
    const newTask = {
      id: crypto.randomUUID(),
      ...taskData,
    };
    setTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);
    closeForm();
  }

  function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Удалить эту задачу?'
    );
    if (!confirmed) {
      return;
    }
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  }
  
  function handleStatusChange(taskId, status) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status }
          : task
      )
    );
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('Все');
  }

  function resetTasks() {
    const confirmed = window.confirm(
      'Вернуть исходные учебные задачи?'
    );
    if (!confirmed) {
      return;
    }
    setTasks(initialTasks);
    resetFilters();
  }
  return (
    <div className="appShell">
      <Sidebar />
      <main className="content">
        <Header onCreateTask={openCreateForm} />
        <section
          className="statsGrid"
          aria-label="Статистика"
        >
          <StatCard
            label="Всего задач"
            value={totalCount}
            note="Все текущие задачи"
          />
          <StatCard
            label="В работе"
            value={progressCount}
            note="Активные задачи"
          />
          <StatCard
            label="Готово"
            value={doneCount}
            note="Завершенные задачи"
          />
          <StatCard
            label="Проектов"
            value={projectCount}
            note="Уникальные проекты"
          />
        </section>
        <section className="panel">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Фокус</p>
              <h2>Задачи</h2>
            </div>
            <button
              className="ghostButton"
              type="button"
              onClick={resetTasks}
            >
              Исходные задачи
            </button>
          </div>
          <TaskToolbar
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={resetFilters}
          />
          <div className="resultLine">
            Найдено задач: {filteredTasks.length}
          </div>
          <div className="taskList">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="emptyState">
                <strong>Задачи не найдены</strong>
                <span>
                  Измените запрос или сбросьте фильтры.
                </span>
              </div>
            )}
          </div>
        </section>
      </main>
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
