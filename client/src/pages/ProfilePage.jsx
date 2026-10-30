import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/authApi.js';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setError('');
            try {
                const data = await getCurrentUser();
                setProfile(data);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);
    if (loading) {
        return <LoadingState />;
    }
    if (error) {
        return <ErrorState message={error} />;
    }
    const registeredAt = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(profile.createdAt));
    return (
        <section className="profileCard">
            <p className="eyebrow">Личный кабинет</p>
            <h1>{profile.name}</h1>
            <dl className="profileGrid">
                <div>
                    <dt>Email</dt>
                    <dd>{profile.email}</dd>
                </div>
                <div>
                    <dt>Количество задач</dt>
                    <dd>{profile.taskCount}</dd>
                </div>
                <div>
                    <dt>Дата регистрации</dt>
                    <dd>{registeredAt}</dd>
                </div>
            </dl>
        </section>
    );
}
