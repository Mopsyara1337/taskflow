export default function TaskToolbar({
    search,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onResetFilters,
}) {
    return (
        <div className="toolbar">
            <label className="searchField">
                <span>Поиск</span>
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Название или проект" />
            </label>
            <label className="filterField">
                <span>Статус</span>
                <select
                    value={statusFilter}
                    onChange={(event) => onStatusFilterChange(event.target.value)}
                >
                    <option value="Все">Все</option>
                    <option value="Нужно сделать">Нужно сделать</option>
                    <option value="В работе">В работе</option>
                    <option value="Готово">Готово</option>
                </select>
            </label>
            <button
                className="ghostButton toolbarButton"
                type="button"
                onClick={onResetFilters}
            >
                Сбросить
            </button>
        </div>
    );
}