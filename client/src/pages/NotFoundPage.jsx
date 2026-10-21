import { Link } from 'react-router-dom';
export default function NotFoundPage() {
    return (
        <section className="notFoundCard">
            <p className="eyebrow">404</p>
            <h1>Страница не найдена</h1>
            <p>Проверьте адрес или вернитесь к задачам.</p>
            <Link className="primaryButton linkButton" to="/tasks">
                Открыть задачи
            </Link>
        </section>
    );
}
