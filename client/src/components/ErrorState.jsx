export default function ErrorState({ message, onRetry }) {
    return (
        <div className="errorCard" role="alert">
            <div>
                <strong>Не удалось выполнить запрос</strong>
                <p>{message}</p>
            </div>
            {onRetry && (
                <button
                    className="ghostButton"
                    type="button"
                    onClick={onRetry}
                >
                    Повторить
                </button>
            )}
        </div>
    );
}
