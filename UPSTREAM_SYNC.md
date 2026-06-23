# Обновление из исходного проекта

Исходный репозиторий подключен как remote `upstream`:

```powershell
git fetch upstream main
```

Не используйте прямой `git merge upstream/main`: upstream содержит английские HTML-файлы,
другую структуру URL и чужие настройки аналитики/домена.

Безопасный порядок обновления:

1. Посмотреть новые кодовые коммиты:

   ```powershell
   git log --oneline main..upstream/main -- . ':(exclude)data.json'
   ```

2. Посмотреть изменения конкретного файла:

   ```powershell
   git diff main..upstream/main -- .github/workflows/fetch-scores.yml
   ```

3. Переносить автономные файлы выборочно или вручную адаптировать нужный фрагмент.
4. После переноса проверить русский интерфейс, внутренние ссылки, CNAME и Метрику.

## Минутное обновление live-счета

GitHub `schedule` не гарантирует запуск каждые 5 минут. Оригинальный проект получает
минутные запуски через внешний `workflow_dispatch`.

Внешний cron должен раз в минуту отправлять:

```http
POST https://api.github.com/repos/viktormalyuchenko/worldcup2026/actions/workflows/fetch-scores.yml/dispatches
Authorization: Bearer <FINE_GRAINED_TOKEN>
Accept: application/vnd.github+json
Content-Type: application/json

{"ref":"main"}
```

Для fine-grained token достаточно доступа только к репозиторию `worldcup2026` и
разрешения `Actions: Read and write`. Токен нельзя добавлять в репозиторий или HTML.
