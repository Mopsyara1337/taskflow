export function errorHandler(error, req, res, next) {
    console.error(error);
    if (error.code === '23505') {
        return res.status(409).json({
            message: 'Запись с такими данными уже существует',
        });
    }
    if (error.code === '23503') {
        return res.status(400).json({
            message: 'Нарушена связь данных в базе',
        });
    }
    if (error.code === '22P02') {
        return res.status(400).json({
            message: 'Некорректный идентификатор',
        });
    }
    if (error.code) {
        return res.status(500).json({
            message: 'Ошибка базы данных',
        });
    }
    res.status(500).json({
        message: 'Внутренняя ошибка сервера',
    });
}
