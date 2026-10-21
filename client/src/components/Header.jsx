export default function Header({ onCreateTask }) {
    return (
        <header className="topbar">
            <div>
                <p className="eyebrow">TaskFlow</p>
                <h1>Мои задачи</h1>
                <p className="subtitle">
                    Создавайте и изменяйте задачи через REST API.
                </p>
            </div>
            <button
                className="primaryButton"
                type="button"
                onClick={onCreateTask}
            >
                + Новая задача
            </button>
        </header>
    );
}