import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ErrorState from './ErrorState.jsx';
describe('ErrorState', () => {
    test('показывает ошибку и вызывает повторную загрузку', () => {
        const onRetry = vi.fn();
        render(
            <ErrorState
                message="Сервер недоступен"
                onRetry={onRetry}
            />
        );
        expect(
            screen.getByText('Сервер недоступен')
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});