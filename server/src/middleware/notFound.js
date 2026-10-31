export function notFound(req, res) {
    res.status(404).json({
        message: `Маршрут ${req.method} ${req.originalUrl} не найден`,
    });
}