# Privacy Policy — Chat Filter for Twitch

*Last updated: September 29, 2026*

Chat Filter for Twitch ("the extension") is a browser extension that filters the Twitch chat by rules you set up (users, roles, badges, keywords). This policy explains what data the extension works with and where it is kept.

**In short: the extension has no servers, sends no data anywhere, and contains no analytics or tracking. Everything stays in your browser.**

## What the extension reads

- **Chat messages on twitch.tv pages.** The extension reads the chat on the Twitch page you have open, including user badges (moderator, VIP, etc.), so it can show or hide messages based on your settings. Messages are processed in your browser only.
- **Your Twitch username.** The extension reads the username of the logged-in account from the Twitch page, so that your own messages are always shown in the filtered chat. It is not saved or sent anywhere.
- **The address of the open Twitch tab.** When you open the extension menu, it reads the address of the current tab (only on twitch.tv) to find out which channel you are watching and show the preset bound to it. The address is not saved or sent anywhere.
- **The clipboard, only when you import a preset.** The import window may read the clipboard to paste a copied preset. Nothing else is read from the clipboard.

## What the extension stores

| Data | Where it is stored |
|---|---|
| Your filter rules and presets, channels bound to presets, on/off state, interface language | Chrome extension storage (`chrome.storage.sync`). If Chrome sync is turned on, Google syncs these settings between your devices, like any other extension settings. |
| Chat panel size | Chrome extension storage on this device only (`chrome.storage.local`) |
| A backup copy of your rules and settings | The twitch.tv website storage (`localStorage`) in your browser. It lets the extension restore your rules if you reinstall it. Pages from twitch.tv can technically read this storage. |

## What the extension does not do

- It does not send any data to the developer or to third parties.
- It does not sell, share, or transfer data.
- It does not use data for advertising, credit checks, or any purpose other than filtering the chat.
- It does not load code from remote servers.

## How to delete your data

- Rules can be deleted in the extension menu (select them with **Edit**, then delete); presets are deleted from the preset menu.
- Removing the extension deletes everything it stored in Chrome extension storage.
- To remove the backup copy on twitch.tv, clear site data for twitch.tv in Chrome settings (Privacy and security → Third-party cookies → See all site data and permissions → twitch.tv → Delete).

## Changes to this policy

If the extension starts handling data differently, this policy will be updated and the date at the top will change.

## Contact

Questions about this policy: risher.dev@outlook.com

*Chat Filter for Twitch is not affiliated with or endorsed by Twitch Interactive, Inc.*

---

# Политика конфиденциальности — Chat Filter for Twitch

*Последнее обновление: 29 сентября 2026 г.*

Chat Filter for Twitch («расширение») — расширение для браузера, которое фильтрует чат Twitch по заданным вами правилам (ники, роли, значки, ключевые слова). Здесь описано, с какими данными работает расширение и где они хранятся.

**Коротко: у расширения нет серверов, оно никуда не отправляет данные и не содержит аналитики или отслеживания. Всё остаётся в вашем браузере.**

## Что читает расширение

- **Сообщения чата на страницах twitch.tv.** Расширение читает чат на открытой странице Twitch, включая значки пользователей (модератор, VIP и т.п.), чтобы показывать или скрывать сообщения по вашим настройкам. Сообщения обрабатываются только в вашем браузере.
- **Ваш ник на Twitch.** Расширение берёт со страницы Twitch ник аккаунта, под которым вы вошли, чтобы ваши собственные сообщения всегда были видны в фильтрованном чате. Ник не сохраняется и никуда не передаётся.
- **Адрес открытой вкладки Twitch.** Когда вы открываете меню расширения, оно читает адрес текущей вкладки (только на twitch.tv), чтобы узнать, какой канал вы смотрите, и показать привязанный к нему набор. Адрес не сохраняется и никуда не передаётся.
- **Буфер обмена — только при импорте набора.** Окно импорта может прочитать буфер обмена, чтобы вставить скопированный набор. Больше ничего из буфера обмена не читается.

## Что хранит расширение

| Данные | Где хранятся |
|---|---|
| Правила фильтра и наборы правил, каналы, привязанные к наборам, включён ли фильтр, язык интерфейса | Хранилище расширения Chrome (`chrome.storage.sync`). Если в Chrome включена синхронизация, Google синхронизирует эти настройки между вашими устройствами, как настройки любых расширений. |
| Размер панели чата | Хранилище расширения Chrome, только на этом устройстве (`chrome.storage.local`) |
| Резервная копия правил и настроек | Хранилище сайта twitch.tv (`localStorage`) в вашем браузере. По ней расширение восстанавливает правила после переустановки. Технически страницы twitch.tv могут прочитать это хранилище. |

## Чего расширение не делает

- Не отправляет данные разработчику или третьим лицам.
- Не продаёт и не передаёт данные.
- Не использует данные для рекламы, оценки кредитоспособности или любых целей, кроме фильтрации чата.
- Не загружает код с удалённых серверов.

## Как удалить данные

- Правила удаляются в меню расширения (отметьте их кнопкой **«Выбрать»** и удалите); наборы удаляются в меню наборов.
- При удалении расширения стирается всё, что оно хранило в хранилище расширения Chrome.
- Чтобы удалить резервную копию на twitch.tv, очистите данные сайта twitch.tv в настройках Chrome (Конфиденциальность и безопасность → Сторонние файлы cookie → Все разрешения и данные сайтов → twitch.tv → Удалить).

## Изменения политики

Если расширение начнёт работать с данными иначе, политика будет обновлена, а дата вверху изменится.

## Контакты

Вопросы о политике: risher.dev@outlook.com

*Chat Filter for Twitch не связано с Twitch Interactive, Inc. и не одобрено ею.*
