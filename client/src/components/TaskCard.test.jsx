import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import TaskCard from './TaskCard.jsx';
const task = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Подготовить TaskFlow к защите',
    project: 'TaskFlow',
    status: 'В работе',
    priority: 'Высокий',
    dueDate: '2026-10-01',
};
describe('TaskCard', () => {
    test('показывает основные данные задачи', () => {
        render(
            <MemoryRouter>
                <TaskCard
                    task={task}
                    onEdit={vi.fn()}
                    onDelete={vi.fn()}
                    onStatusChange={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText('Подготовить TaskFlow к защите')
        ).toBeInTheDocument();
        expect(screen.getByText('TaskFlow')).toBeInTheDocument();
        expect(screen.getByText('В работе')).toBeInTheDocument();
    });
});