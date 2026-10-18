# Privacy Policy — Chat Filter for Twitch

*Last updated: October 18, 2026*

Chat Filter for Twitch ("the extension") is a browser extension that filters the Twitch chat by rules you set up (users, roles, badges, keywords). This policy explains what data the extension works with and where it is kept.

**In short: the extension has no servers, sends no data anywhere, and contains no analytics or tracking. Everything stays in your browser.**

## What the extension reads

- **Chat messages on twitch.tv pages.** The extension reads the chat on the Twitch page you have open, including user badges (moderator, VIP, etc.), so it can show or hide messages based on your settings. Messages are processed in your browser only.
- **Messages you save or export.** If "Keep history" is on (the default), messages that passed your filter in live chat are saved so they stay after reloading the page (see below). Export copies the messages shown in the filtered chat to the clipboard or a file only when you click it.
- **Your Twitch username.** The extension reads the username of the logged-in account from the Twitch page, so that your own messages are always shown in the filtered chat. It is not saved or sent anywhere.
- **The address of the open Twitch tab.** When you open the extension menu, it reads the address of the current tab (only on twitch.tv) to find out which channel you are watching and show the preset bound to it. The address is not saved or sent anywhere.
- **Notifications, only if you turn them on.** For new messages of the filtered chat, the extension can show a desktop notification with the author and text of the message. This needs the "notifications" permission, which is asked only when you turn on desktop notifications in Settings. Notifications are shown by your browser and are not sent anywhere.
- **The Twitch chat server, only for notifications in a background tab.** While the Twitch tab is hidden (another tab is open or the browser is minimized), Twitch stops drawing new chat messages. If notifications are turned on, the extension then connects to the official Twitch chat server (`irc-ws.chat.twitch.tv`) as an anonymous guest, the same way a logged-out viewer reads the chat, to receive messages of the open channel. It sends only the channel name; your account, token and messages are not used or sent. The connection is closed when you return to the tab.
- **The clipboard, only when you import a preset.** The import window may read the clipboard to paste a copied preset. Nothing else is read from the clipboard.

## What the extension stores

| Data | Where it is stored |
|---|---|
| Your filter rules and presets, channels bound to presets, on/off state, interface language | Chrome extension storage (`chrome.storage.sync`). If Chrome sync is turned on, Google syncs these settings between your devices, like any other extension settings. |
| Chat panel size; how many messages each rule matched and when it last did | Chrome extension storage on this device only (`chrome.storage.local`) |
| Filtered chat history: up to 1000 latest matching messages per channel (time, username, text, badges and how the message looked) | The extension's own database in your browser (IndexedDB), on this device only. Twitch pages cannot read it. |
| A backup copy of your rules and settings | The twitch.tv website storage (`localStorage`) in your browser. It lets the extension restore your rules if you reinstall it. Pages from twitch.tv can technically read this storage. |

## What the extension does not do

- It does not send any data to the developer or to third parties. The only connection it makes itself is the read-only connection to the Twitch chat server described above.
- It does not sell, share, or transfer data.
- It does not use data for advertising, credit checks, or any purpose other than filtering the chat.
- It does not load code from remote servers.

## How to delete your data

- Rules can be deleted in the extension menu (select them with **Edit**, then delete); presets are deleted from the preset menu.
- The filtered chat history is cleared with **Clear** in the extension settings; turning off **Keep history** stops saving new messages.
- Removing the extension deletes everything it stored in Chrome extension storage and its history database.
- To remove the backup copy on twitch.tv, clear site data for twitch.tv in Chrome settings (Privacy and security → Third-party cookies → See all site data and permissions → twitch.tv → Delete).

## Changes to this policy

If the extension starts handling data differently, this policy will be updated and the date at the top will change.

## Contact

Questions about this policy: risher.dev@outlook.com

*Chat Filter for Twitch is not affiliated with or endorsed by Twitch Interactive, Inc.*

---

# Политика конфиденциальности — Chat Filter for Twitch

*Последнее обновление: 18 октября 2026 г.*

Chat Filter for Twitch («расширение») — расширение для браузера, которое фильтрует чат Twitch по заданным вами правилам (ники, роли, значки, ключевые слова). Здесь описано, с какими данными работает расширение и где они хранятся.

**Коротко: у расширения нет серверов, оно никуда не отправляет данные и не содержит аналитики или отслеживания. Всё остаётся в вашем браузере.**

## Что читает расширение

- **Сообщения чата на страницах twitch.tv.** Расширение читает чат на открытой странице Twitch, включая значки пользователей (модератор, VIP и т.п.), чтобы показывать или скрывать сообщения по вашим настройкам. Сообщения обрабатываются только в вашем браузере.
- **Сообщения, которые вы сохраняете или экспортируете.** Если включено «Сохранять историю» (по умолчанию), сообщения из живого чата, прошедшие фильтр, сохраняются, чтобы остаться после перезагрузки страницы (см. ниже). Экспорт копирует сообщения фильтрованного чата в буфер обмена или файл только по вашему нажатию.
- **Ваш ник на Twitch.** Расширение берёт со страницы Twitch ник аккаунта, под которым вы вошли, чтобы ваши собственные сообщения всегда были видны в фильтрованном чате. Ник не сохраняется и никуда не передаётся.
- **Адрес открытой вкладки Twitch.** Когда вы открываете меню расширения, оно читает адрес текущей вкладки (только на twitch.tv), чтобы узнать, какой канал вы смотрите, и показать привязанный к нему набор. Адрес не сохраняется и никуда не передаётся.
- **Уведомления — только если вы их включили.** Для новых сообщений фильтрованного чата расширение может показать уведомление на рабочем столе с автором и текстом сообщения. Для этого нужно разрешение «notifications»; оно запрашивается, только когда вы включаете уведомления в настройках. Уведомления показывает ваш браузер, никуда они не отправляются.
- **Чат-сервер Twitch — только для оповещений в фоновой вкладке.** Пока вкладка Twitch скрыта (открыта другая вкладка или браузер свёрнут), Twitch не выводит новые сообщения чата. Если оповещения включены, расширение в это время подключается к официальному чат-серверу Twitch (`irc-ws.chat.twitch.tv`) как анонимный гость — так же, как чат читает зритель без входа в аккаунт, — и получает сообщения открытого канала. Передаётся только название канала; ваш аккаунт, токен и сообщения не используются и не отправляются. Подключение закрывается, когда вы возвращаетесь на вкладку.
- **Буфер обмена — только при импорте набора.** Окно импорта может прочитать буфер обмена, чтобы вставить скопированный набор. Больше ничего из буфера обмена не читается.

## Что хранит расширение

| Данные | Где хранятся |
|---|---|
| Правила фильтра и наборы правил, каналы, привязанные к наборам, включён ли фильтр, язык интерфейса | Хранилище расширения Chrome (`chrome.storage.sync`). Если в Chrome включена синхронизация, Google синхронизирует эти настройки между вашими устройствами, как настройки любых расширений. |
| Размер панели чата; сколько сообщений поймало каждое правило и когда в последний раз | Хранилище расширения Chrome, только на этом устройстве (`chrome.storage.local`) |
| История фильтрованного чата: до 1000 последних подходящих сообщений на канал (время, ник, текст, значки и вид сообщения) | Собственная база данных расширения в браузере (IndexedDB), только на этом устройстве. Страницы Twitch не могут её прочитать. |
| Резервная копия правил и настроек | Хранилище сайта twitch.tv (`localStorage`) в вашем браузере. По ней расширение восстанавливает правила после переустановки. Технически страницы twitch.tv могут прочитать это хранилище. |

## Чего расширение не делает

- Не отправляет данные разработчику или третьим лицам. Единственное подключение, которое расширение делает само, — описанное выше подключение к чат-серверу Twitch только для чтения.
- Не продаёт и не передаёт данные.
- Не использует данные для рекламы, оценки кредитоспособности или любых целей, кроме фильтрации чата.
- Не загружает код с удалённых серверов.

## Как удалить данные

- Правила удаляются в меню расширения (отметьте их кнопкой **«Выбрать»** и удалите); наборы удаляются в меню наборов.
- История фильтрованного чата очищается кнопкой **«Очистить»** в настройках расширения; если выключить **«Сохранять историю»**, новые сообщения перестанут сохраняться.
- При удалении расширения стирается всё, что оно хранило в хранилище расширения Chrome, и его база истории.
- Чтобы удалить резервную копию на twitch.tv, очистите данные сайта twitch.tv в настройках Chrome (Конфиденциальность и безопасность → Сторонние файлы cookie → Все разрешения и данные сайтов → twitch.tv → Удалить).

## Изменения политики

Если расширение начнёт работать с данными иначе, политика будет обновлена, а дата вверху изменится.

## Контакты

Вопросы о политике: risher.dev@outlook.com

*Chat Filter for Twitch не связано с Twitch Interactive, Inc. и не одобрено ею.*
