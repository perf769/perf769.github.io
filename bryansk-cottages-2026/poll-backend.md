# Реальный учет голосов

Статический GitHub Pages не умеет надежно хранить общие голоса сам по себе. Лучший вариант для этой задачи: Telegram Login Widget + маленький backend.

## Рекомендованная схема

1. Telegram Login Widget подтверждает личность участника.
2. Backend проверяет подпись Telegram по bot token.
3. Backend записывает голос в Supabase или Cloudflare KV.
4. Один `telegram_id` может иметь только один активный голос.
5. При повторном голосовании запись обновляется, а не добавляет дубль.

## Минимальный API

`POST /api/vote`

```json
{
  "telegramUser": {
    "id": 123456789,
    "first_name": "Андрей",
    "auth_date": 1785670000,
    "hash": "telegram_hash"
  },
  "choice": "Экопарк Святобор"
}
```

`GET /api/results`

```json
{
  "results": [
    { "choice": "Экопарк Святобор", "count": 9 },
    { "choice": "Дом мечты на одну ночь", "count": 4 }
  ]
}
```

## Почему не только Telegram без backend

Telegram Login подтверждает, кто голосует, но не хранит голоса. Запись результата все равно нужна на сервере или в облачном хранилище. Для GitHub Pages самый простой внешний слой - Cloudflare Worker с KV или Supabase Edge Function + таблица votes.
