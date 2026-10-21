export default function LoadingState() {
    return (
        <div className="loadingCard" role="status">
            <span className="spinner" aria-hidden="true" />
            <div>
                <strong>Загрузка задач</strong>
                <p>TaskFlow получает данные с сервера.</p>
            </div>
        </div>
    );
}