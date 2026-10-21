import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { getTask } from '../api/tasksApi.js';
export default function TaskDetailsPage() {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadTask() {
            setLoading(true);
            setError('');
            try {
                const data = await getTask(id);
                if (active) {
                    setTask(data);
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        loadTask();
        return () => {
            active = false;
        };
    }, [id]);
    if (loading) {
        return <LoadingState />;
    }
    if (error) {
        return (
            <>
                <ErrorState message={error} />
                <Link className="ghostButton linkButton" to="/tasks">
                    К списку задач
                </Link>
            </>
        );
    }
    return (
        <section className="detailCard">
            <div>
                <p className="eyebrow">Задача</p>
                <h1>{task.title}</h1>
                <p className="subtitle">{task.project}</p>
            </div>
            <dl className="detailGrid">
                <div>
                    <dt>Статус</dt>
                    <dd>{task.status}</dd>
                </div>
                <div>
                    <dt>Приоритет</dt>
                    <dd>{task.priority}</dd>
                </div>
                <div>
                    <dt>Срок</dt>
                    <dd>{task.dueDate || 'Не указан'}</dd>
                </div>
                <div>
                    <dt>ID</dt>
                    <dd>{task.id}</dd>
                </div>
            </dl>
            <Link className="ghostButton linkButton" to="/tasks">
                К списку задач
            </Link>
        </section>
    );
}
