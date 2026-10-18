export default function Header({ onCreateTask }) {
    return (
        <header className="topbar">
            <div>
                <p className="eyebrow">Учебный проект</p>
                <h1>Добро пожаловать в TaskFlow</h1>
                <p className="subtitle">
                    Управляйте задачами, фильтрами и прогрессом.
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

