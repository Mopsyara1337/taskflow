import { render, screen } from '@testing-library/react';
import {
    MemoryRouter,
    Route,
    Routes,
} from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import ProtectedRoute from './ProtectedRoute.jsx';
function renderRoutes(user) {
    render(
        <MemoryRouter initialEntries={['/private']}>
            <Routes>
                <Route path="/login" element={<p>Страница входа</p>} />
                <Route element={<ProtectedRoute user={user} />}>
                    <Route path="/private" element={<p>Закрытая страница</p>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}
describe('ProtectedRoute', () => {
    test('неавторизованного пользователя отправляет на login', () => {
        renderRoutes(null);
        expect(
            screen.getByText('Страница входа')
        ).toBeInTheDocument();
    });
    test('авторизованному пользователю показывает страницу', () => {
        renderRoutes({ id: 'user-1', name: 'Student' });
        expect(
            screen.getByText('Закрытая страница')
        ).toBeInTheDocument();
    });
});