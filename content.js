class TwitchChatFilter {
    constructor() {
        this.usersList = [];
        this.isFilterEnabled = true;
        this.hiddenMessagesCount = 0;
        this.savedMessagesCount = 0;
        this.mode = 'whitelist';
        this.observer = null;
        this.chatContainer = null;
        this.customChatContainer = null;
        this.processedElements = new WeakSet();
        this.filteredMessages = [];
        this.maxDisplayedMessages = 200;
        this.currentLanguage = 'en';

        // Доля высоты фильтрованного чата (регулируется разделителем)
        this.splitRatio = 0.5;

        // Отдельное окно фильтрованного чата
        this.popoutWindow = null;
        this.popoutCheckTimer = null;

        // Логин текущего пользователя (его сообщения не фильтруются)
        this.ownLogin = null;

        // Отслеживание изменения размеров поля ввода
        this.inputResizeObserver = null;

        // Буфер сообщений для отложенной записи в storage
        this.pendingSavedMessages = [];

        // Таймеры (для отмены при навигации)
        this.waitTimer = null;
        this.processTimer = null;
        this.statsTimer = null;
        this.saveTimer = null;

        // Переводы для интерфейса
        this.translations = {
            en: {
                filteredChat: 'Filtered Chat',
                originalChat: 'Original Chat',
                messages: 'messages'
            },
            ru: {
                filteredChat: 'Фильтрованный чат',
                originalChat: 'Оригинальный чат',
                messages: 'сообщений'
            }
        };

        this.init();
    }

    async init() {
        await this.loadSettings();
        this.waitForChat();

        // Настройки меняются из popup через storage — работает для всех
        // открытых вкладок Twitch, а не только активной
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync') {
                let settingsChanged = false;

                if (changes.usersList) {
                    this.usersList = changes.usersList.newValue || [];
                    settingsChanged = true;
                }
                if (changes.isFilterEnabled) {
                    this.isFilterEnabled = changes.isFilterEnabled.newValue !== false;
                    settingsChanged = true;
                }
                if (changes.mode) {
                    this.mode = changes.mode.newValue || 'whitelist';
                    settingsChanged = true;
                }
                if (changes.language) {
                    this.currentLanguage = changes.language.newValue || 'en';
                    this.updateChatHeaders();
                }

                if (settingsChanged) {
                    this.applySettings();
                }
            }

            if (areaName === 'local') {
                // Сброс статистики из popup («Очистить все»)
                if (changes.hiddenMessagesCount &&
                    changes.hiddenMessagesCount.newValue === 0 &&
                    this.hiddenMessagesCount !== 0) {
                    this.hiddenMessagesCount = 0;
                }
                if (changes.savedMessagesCount &&
                    changes.savedMessagesCount.newValue === 0 &&
                    this.savedMessagesCount !== 0) {
                    this.savedMessagesCount = 0;
                    this.pendingSavedMessages = [];
                }
            }
        });
    }

    async loadSettings() {
        const syncData = await chrome.storage.sync.get([
            'usersList', 'isFilterEnabled', 'mode', 'language'
        ]);
        const localData = await chrome.storage.local.get([
            'hiddenMessagesCount', 'savedMessagesCount', 'chatSplitRatio'
        ]);

        this.usersList = syncData.usersList || [];
        this.isFilterEnabled = syncData.isFilterEnabled !== false;
        this.mode = syncData.mode || 'whitelist';
        this.currentLanguage = syncData.language || 'en';
        this.hiddenMessagesCount = localData.hiddenMessagesCount || 0;
        this.savedMessagesCount = localData.savedMessagesCount || 0;
        this.splitRatio = localData.chatSplitRatio || 0.5;
    }

    // Применение новых настроек: пересобираем состояние из текущего DOM
    applySettings() {
        this.processedElements = new WeakSet();
        this.filteredMessages = [];
        this.updateChatHeaders();
        this.processExistingMessages();
    }

    waitForChat() {
        if (this.waitTimer) {
            clearTimeout(this.waitTimer);
            this.waitTimer = null;
        }

        const checkChat = () => {
            // Чат уже найден и всё ещё в документе — ничего не делаем
            if (this.chatContainer && this.chatContainer.isConnected) {
                return;
            }

            const chatSelectors = [
                '.video-chat__message-list-wrapper',
                '.video-chat__message-list-wrapper ul',
                '[data-a-target="chat-scroller"]',
                '.chat-scrollable-area__message-container',
                '[data-test-selector="chat-scrollable-area__message-container"]',
                '.simplebar-scroll-content',
                '.chat-list',
                '[role="log"]',
                '.chat-room__content'
            ];

            for (const selector of chatSelectors) {
                let container = document.querySelector(selector);

                if (container) {
                    if (selector === '.video-chat__message-list-wrapper') {
                        const ul = container.querySelector('ul');
                        this.chatContainer = ul || container;
                    } else {
                        this.chatContainer = container;
                    }

                    this.createCustomChat();
                    this.startObserving();
                    this.processExistingMessages();
                    return;
                }
            }

            this.waitTimer = setTimeout(checkChat, 2000);
        };

        checkChat();
    }

    // Очистка при SPA-навигации между страницами Twitch
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        [this.waitTimer, this.processTimer].forEach(t => t && clearTimeout(t));
        this.waitTimer = null;
        this.processTimer = null;

        if (this.inputResizeObserver) {
            this.inputResizeObserver.disconnect();
            this.inputResizeObserver = null;
        }

        const dualContainer = document.getElementById('twitch-dual-chat-container');
        if (dualContainer) {
            // Возвращаем оригинальный чат на место, если он ещё жив
            const originalWrapper = dualContainer.querySelector('.twitch-original-content > *');
            if (originalWrapper && dualContainer.parentNode) {
                dualContainer.parentNode.insertBefore(originalWrapper, dualContainer);
            }
            dualContainer.remove();
        }

        this.chatContainer = null;
        this.customChatContainer = null;
        this.processedElements = new WeakSet();
        this.filteredMessages = [];
    }

    updateChatContent() {
        const t = this.translations[this.currentLanguage];
        this.customChatContainer.innerHTML = `
      <div class="twitch-filter-header">
        <span>${t.filteredChat} (${this.mode})</span>
        <span class="twitch-filter-header-controls">
          <span class="twitch-filter-count">0 ${t.messages}</span>
          <button class="twitch-popout-filtered" title="Open in separate window">⧉</button>
          <button class="twitch-toggle-filtered" title="Toggle filtered chat">👁</button>
        </span>
      </div>
      <div class="twitch-filter-messages"></div>
    `;
    }

    updateOriginalChatContent(container) {
        const t = this.translations[this.currentLanguage];
        container.innerHTML = `
      <div class="twitch-original-header">
        <span>${t.originalChat}</span>
        <span class="twitch-filter-header-controls">
          <button class="twitch-popout-original" title="Open chat in separate window">⧉</button>
          <button class="twitch-toggle-original" title="Toggle original chat">👁</button>
        </span>
      </div>
      <div class="twitch-original-content"></div>
    `;
    }

    updateChatHeaders() {
        if (!this.customChatContainer) return;

        const t = this.translations[this.currentLanguage];
        const filterHeader = this.customChatContainer.querySelector('.twitch-filter-header span:first-child');
        if (filterHeader) {
            filterHeader.textContent = `${t.filteredChat} (${this.mode})`;
        }

        const originalHeader = document.querySelector('#twitch-original-chat .twitch-original-header span:first-child');
        if (originalHeader) {
            originalHeader.textContent = t.originalChat;
        }

        const dualContainer = document.getElementById('twitch-dual-chat-container');
        if (dualContainer) {
            dualContainer.setAttribute('data-mode', this.mode);
        }
    }

    createCustomChat() {
        // Не создаем контейнер повторно
        if (document.getElementById('twitch-dual-chat-container')) {
            this.customChatContainer = document.getElementById('twitch-filter-chat');
            return;
        }

        // Находим оригинальный чат
        const originalChatWrapper = document.querySelector('.video-chat__message-list-wrapper') ||
            document.querySelector('[data-a-target="chat-scroller"]')?.closest('.chat-shell, .chat-room');

        if (!originalChatWrapper) return;

        // Запоминаем родительский элемент до манипуляций
        const chatParent = originalChatWrapper.parentNode;
        const nextSibling = originalChatWrapper.nextSibling;

        // Временно удаляем оригинальный чат из DOM
        originalChatWrapper.remove();

        // Создаем контейнер для двух чатов
        const dualChatContainer = document.createElement('div');
        dualChatContainer.id = 'twitch-dual-chat-container';
        dualChatContainer.setAttribute('data-mode', this.mode);

        // height: 100% не учитывает соседние элементы колонки (заголовок
        // «STREAM CHAT» и т.п.) — контейнер вылезает за низ экрана вместе
        // с кнопками поля ввода. В flex-колонке занимаем оставшееся место
        // через flex, как это делал сам chat-room
        const parentDisplay = window.getComputedStyle(chatParent).display;
        if (parentDisplay.includes('flex')) {
            dualChatContainer.style.height = 'auto';
            dualChatContainer.style.flex = '1 1 0%';
        } else {
            // Не flex: вычитаем из 100% высоту соседних элементов колонки
            const siblingsHeight = Array.from(chatParent.children)
                .reduce((sum, el) => sum + el.offsetHeight, 0);
            if (siblingsHeight > 0) {
                dualChatContainer.style.height = `calc(100% - ${siblingsHeight}px)`;
            }
        }
        dualChatContainer.style.minHeight = '0';
        dualChatContainer.style.maxHeight = '100%';

        // Создаем контейнер для фильтрованного чата
        this.customChatContainer = document.createElement('div');
        this.customChatContainer.id = 'twitch-filter-chat';
        this.updateChatContent();

        // Создаем контейнер для оригинального чата
        const originalChatContainer = document.createElement('div');
        originalChatContainer.id = 'twitch-original-chat';
        this.updateOriginalChatContent(originalChatContainer);

        // Перемещаем оригинальный чат в наш контейнер
        const originalContent = originalChatContainer.querySelector('.twitch-original-content');
        originalContent.appendChild(originalChatWrapper);

        // Разделитель для регулировки размеров чатов
        const resizer = document.createElement('div');
        resizer.id = 'twitch-chat-resizer';
        resizer.title = 'Drag to resize';

        // Собираем dual chat
        dualChatContainer.appendChild(this.customChatContainer);
        dualChatContainer.appendChild(resizer);
        dualChatContainer.appendChild(originalChatContainer);

        // Вставляем dual chat в DOM
        if (nextSibling) {
            chatParent.insertBefore(dualChatContainer, nextSibling);
        } else {
            chatParent.appendChild(dualChatContainer);
        }

        this.applySplitRatio();

        // Добавляем функциональность кнопок и разделителя
        this.setupToggleButton(originalChatContainer);
        this.setupFilteredToggleButton();
        this.setupResizer(resizer);
        this.setupFilteredPopout();
        this.setupOriginalPopout(originalChatContainer);
        this.setupInputWatcher(originalContent);
    }

    // Поле ввода меняет высоту (многострочный текст, панель эмодзи,
    // карусель значков) — пересчитываем минимальную высоту оригинального
    // чата, чтобы кнопки ввода не уходили за границы экрана
    setupInputWatcher(originalContent) {
        let attempts = 0;

        const tryObserve = () => {
            const input = originalContent.querySelector('.chat-input');
            if (input) {
                if (this.inputResizeObserver) {
                    this.inputResizeObserver.disconnect();
                }
                this.inputResizeObserver = new ResizeObserver(() => {
                    this.applySplitRatio();
                });
                this.inputResizeObserver.observe(input);
                return;
            }

            // Поле ввода может отрисоваться позже
            if (++attempts < 15) {
                setTimeout(tryObserve, 2000);
            }
        };

        tryObserve();
    }

    // Пропорции чатов задаются через flex-grow — при скрытии одного
    // из чатов CSS-правила с !important перекрывают инлайн-стили
    applySplitRatio() {
        const originalEl = document.getElementById('twitch-original-chat');
        if (!this.customChatContainer || !originalEl) return;

        this.customChatContainer.style.flex = `${this.splitRatio} 1 0%`;
        originalEl.style.flex = `${1 - this.splitRatio} 1 0%`;

        // Оригинальный чат не может стать ниже, чем заголовок + поле ввода:
        // поле ввода сообщения должно оставаться видимым всегда
        originalEl.style.minHeight = `${this.getMinOriginalHeight(originalEl)}px`;
    }

    getMinOriginalHeight(originalEl) {
        const header = originalEl.querySelector('.twitch-original-header');
        const input = originalEl.querySelector('.chat-input');
        const headerHeight = header ? header.offsetHeight : 30;
        const inputHeight = input ? input.offsetHeight : 0;

        // + минимальная высота списка сообщений
        return headerHeight + inputHeight + 60;
    }

    setupResizer(resizer) {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();

            const originalEl = document.getElementById('twitch-original-chat');
            if (!this.customChatContainer || !originalEl) return;

            const startY = e.clientY;
            const startFilterHeight = this.customChatContainer.getBoundingClientRect().height;
            const totalHeight = startFilterHeight + originalEl.getBoundingClientRect().height;
            const minOriginalHeight = this.getMinOriginalHeight(originalEl);
            const minFilterHeight = 80;

            const onMove = (ev) => {
                let newFilterHeight = startFilterHeight + ev.clientY - startY;
                newFilterHeight = Math.min(newFilterHeight, totalHeight - minOriginalHeight);
                newFilterHeight = Math.max(newFilterHeight, minFilterHeight);

                this.splitRatio = Math.max(0.05, Math.min(0.95, newFilterHeight / totalHeight));
                this.applySplitRatio();
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.userSelect = '';
                chrome.storage.local.set({ chatSplitRatio: this.splitRatio }).catch(() => { });
            };

            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // Скрытие через CSS-класс на контейнере: прячется только список
    // сообщений (поле ввода остается), стили переживают ре-рендеры Twitch
    setupToggleButton(originalChatContainer) {
        const toggleBtn = originalChatContainer.querySelector('.twitch-toggle-original');

        toggleBtn.addEventListener('click', () => {
            const dualContainer = document.getElementById('twitch-dual-chat-container');
            if (!dualContainer) return;

            const hidden = dualContainer.classList.toggle('original-hidden');
            toggleBtn.textContent = hidden ? '🙈' : '👁';
        });
    }

    setupFilteredToggleButton() {
        const toggleBtn = this.customChatContainer.querySelector('.twitch-toggle-filtered');

        toggleBtn.addEventListener('click', () => {
            const dualContainer = document.getElementById('twitch-dual-chat-container');
            if (!dualContainer) return;

            const hidden = dualContainer.classList.toggle('filtered-hidden');
            toggleBtn.textContent = hidden ? '🙈' : '👁';

            if (!hidden) {
                this.scrollToBottom(true);
            }
        });
    }

    // Оригинальный чат выносится штатным popout Twitch
    setupOriginalPopout(originalChatContainer) {
        const btn = originalChatContainer.querySelector('.twitch-popout-original');
        const channel = this.getChannelName();

        // На страницах без канала (например, VOD) popout недоступен
        if (!channel) {
            btn.style.display = 'none';
            return;
        }

        btn.addEventListener('click', () => {
            window.open(
                `https://www.twitch.tv/popout/${channel}/chat`,
                '_blank',
                'width=400,height=700,popup=yes'
            );
        });
    }

    getChannelName() {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const reserved = [
            'videos', 'directory', 'downloads', 'settings', 'wallet',
            'subscriptions', 'inventory', 'drops', 'popout', 'moderator', 'u'
        ];

        if (segments.length >= 1 && !reserved.includes(segments[0].toLowerCase())) {
            return segments[0];
        }
        if (segments[0] === 'moderator' && segments[1]) {
            return segments[1];
        }
        return null;
    }

    setupFilteredPopout() {
        const btn = this.customChatContainer.querySelector('.twitch-popout-filtered');

        btn.addEventListener('click', () => {
            this.openFilteredPopout();
        });
    }

    // Фильтрованный чат в отдельном окне: рисуем свой документ
    // и дублируем туда каждое новое сообщение
    openFilteredPopout() {
        if (this.popoutWindow && !this.popoutWindow.closed) {
            this.popoutWindow.focus();
            return;
        }

        const win = window.open('', '_blank', 'width=400,height=700,popup=yes');
        if (!win) return;

        this.popoutWindow = win;

        const t = this.translations[this.currentLanguage];
        win.document.title = `${t.filteredChat} (${this.mode})`;

        const style = win.document.createElement('style');
        style.textContent = `
            body {
                margin: 0;
                background: #0e0e10;
                color: #efeff1;
                font: 13px/20px Inter, Roobert, "Helvetica Neue", Helvetica, Arial, sans-serif;
            }
            .messages {
                height: 100vh;
                overflow-y: auto;
                padding: 4px 0;
                box-sizing: border-box;
            }
            .message { padding: 2px 12px; word-wrap: break-word; }
            .message:hover { background: rgba(255, 255, 255, 0.04); }
            .timestamp { color: #adadb8; font-size: 11px; margin-right: 8px; font-family: monospace; }
            .username { color: #9146ff; font-weight: 700; }
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: #18181b; }
            ::-webkit-scrollbar-thumb { background: #464649; border-radius: 3px; }
        `;
        win.document.head.appendChild(style);

        const list = win.document.createElement('div');
        list.className = 'messages';
        win.document.body.appendChild(list);

        // Переносим уже накопленные сообщения
        this.filteredMessages.forEach(msg => this.appendMessageToPopout(msg));
        list.scrollTop = list.scrollHeight;

        // Отслеживаем закрытие окна
        this.popoutCheckTimer = setInterval(() => {
            if (!this.popoutWindow || this.popoutWindow.closed) {
                clearInterval(this.popoutCheckTimer);
                this.popoutCheckTimer = null;
                this.popoutWindow = null;
            }
        }, 1000);
    }

    appendMessageToPopout(msgData) {
        const win = this.popoutWindow;
        if (!win || win.closed) return;

        const list = win.document.querySelector('.messages');
        if (!list) return;

        const div = win.document.createElement('div');
        div.className = 'message';

        const ts = win.document.createElement('span');
        ts.className = 'timestamp';
        ts.textContent = msgData.timestamp;

        const name = win.document.createElement('span');
        name.className = 'username';
        name.textContent = msgData.username;

        const text = win.document.createElement('span');
        text.textContent = `: ${msgData.text}`;

        div.append(ts, name, text);

        const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
        list.appendChild(div);

        while (list.children.length > this.maxDisplayedMessages) {
            list.firstChild.remove();
        }

        if (nearBottom) {
            list.scrollTop = list.scrollHeight;
        }
    }

    startObserving() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver((mutations) => {
            let hasNewMessages = false;

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && this.isMessageElement(node)) {
                        hasNewMessages = true;
                        break;
                    }
                }
                if (hasNewMessages) break;
            }

            if (hasNewMessages && !this.processTimer) {
                // Один отложенный проход вместо таймера на каждую мутацию
                this.processTimer = setTimeout(() => {
                    this.processTimer = null;
                    this.processNewMessages();
                }, 100);
            }
        });

        this.observer.observe(this.chatContainer, {
            childList: true,
            subtree: true
        });
    }

    isMessageElement(element) {
        // Live чат
        if (element.classList?.contains('chat-line__message') ||
            element.querySelector?.('.chat-line__message')) {
            return true;
        }

        // VOD
        if (element.tagName === 'LI') {
            if (element.querySelector('.vod-message')) {
                return true;
            }
        }

        if (element.querySelector) {
            const hasUsername = element.querySelector('[data-a-target="chat-message-username"]');
            const hasMessage = element.querySelector('[data-a-target="chat-message-text"]');

            if (hasUsername && hasMessage) {
                return true;
            }
        }

        return false;
    }

    processExistingMessages() {
        if (!this.customChatContainer) return;

        const messagesContainer = this.customChatContainer.querySelector('.twitch-filter-messages');
        if (messagesContainer) {
            messagesContainer.textContent = '';
        }

        // Окно popout тоже пересобираем
        if (this.popoutWindow && !this.popoutWindow.closed) {
            const popoutList = this.popoutWindow.document.querySelector('.messages');
            if (popoutList) popoutList.textContent = '';
        }

        this.findAllMessages().forEach((message) => {
            this.processMessage(message);
        });

        this.updateMessageCount();
        this.scrollToBottom(true);
    }

    processNewMessages() {
        this.findAllMessages().forEach((message) => {
            this.processMessage(message);
        });

        this.updateMessageCount();
    }

    processMessage(messageElement) {
        // Дедупликация по самому DOM-элементу: одно и то же сообщение
        // не обрабатывается повторно и не занимает память после удаления из чата
        if (this.processedElements.has(messageElement)) {
            return;
        }
        this.processedElements.add(messageElement);

        const username = this.extractUsername(messageElement);
        const messageText = this.extractMessageText(messageElement);

        if (!username || !messageText) return;

        // Для сравнения со списком используем логин (data-a-user) —
        // он всегда латиницей в нижнем регистре, в отличие от отображаемого имени
        const login = this.extractLogin(messageElement) || username;
        const shouldShow = this.shouldShowMessage(login);

        if (shouldShow) {
            const messageData = {
                username: username,
                text: messageText,
                timestamp: this.extractTimestamp(messageElement)
            };

            this.filteredMessages.push(messageData);
            if (this.filteredMessages.length > this.maxDisplayedMessages) {
                this.filteredMessages.shift();
            }

            this.appendMessageToChat(messageData);
            this.appendMessageToPopout(messageData);

            if (this.mode === 'whitelist' && this.usersList.includes(login.toLowerCase())) {
                this.saveWhitelistMessage(username, messageText);
            }
        } else {
            this.hiddenMessagesCount++;
            this.scheduleStatsWrite();
        }
    }

    // Безопасный рендер одного сообщения (textContent вместо innerHTML —
    // текст из чата не должен интерпретироваться как HTML)
    appendMessageToChat(msgData) {
        if (!this.customChatContainer) return;

        const messagesContainer = this.customChatContainer.querySelector('.twitch-filter-messages');
        if (!messagesContainer) return;

        const wasNearBottom = this.isNearBottom(messagesContainer);

        const messageDiv = document.createElement('div');
        messageDiv.className = 'twitch-filter-message';

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'twitch-filter-timestamp';
        timestampSpan.textContent = msgData.timestamp;

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'twitch-filter-username';
        usernameSpan.style.color = '#9146ff';
        usernameSpan.textContent = msgData.username;

        const textSpan = document.createElement('span');
        textSpan.className = 'twitch-filter-text';
        textSpan.textContent = `: ${msgData.text}`;

        messageDiv.append(timestampSpan, usernameSpan, textSpan);
        messagesContainer.appendChild(messageDiv);

        // Ограничиваем количество DOM-элементов
        while (messagesContainer.children.length > this.maxDisplayedMessages) {
            messagesContainer.firstChild.remove();
        }

        if (wasNearBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    isNearBottom(container) {
        return container.scrollHeight - container.scrollTop - container.clientHeight < 60;
    }

    scrollToBottom(force = false) {
        const messagesContainer = this.customChatContainer?.querySelector('.twitch-filter-messages');
        if (messagesContainer && (force || this.isNearBottom(messagesContainer))) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    updateMessageCount() {
        if (!this.customChatContainer) return;

        const countElement = this.customChatContainer.querySelector('.twitch-filter-count');
        if (countElement) {
            const t = this.translations[this.currentLanguage];
            countElement.textContent = `${this.filteredMessages.length} ${t.messages}`;
        }
    }

    findAllMessages() {
        if (!this.chatContainer) return [];

        const strategies = [
            // Live чат: сообщения — div.chat-line__message
            () => {
                return Array.from(this.chatContainer.querySelectorAll(
                    '.chat-line__message, [data-a-target="chat-line-message"], [data-test-selector="chat-line-message"]'
                ));
            },

            // VOD: сообщения — li с .vod-message внутри
            () => {
                const vodMessages = this.chatContainer.querySelectorAll('li .vod-message');
                return Array.from(vodMessages).map(vm => vm.closest('li')).filter(Boolean);
            },

            // Запасной вариант: поднимаемся от ника к корню сообщения
            () => {
                const usernames = this.chatContainer.querySelectorAll('[data-a-target="chat-message-username"]');
                return Array.from(usernames)
                    .map(el => el.closest('.chat-line__message, li'))
                    .filter(Boolean);
            }
        ];

        let allMessages = [];

        strategies.forEach((strategy) => {
            try {
                const messages = strategy();
                allMessages = [...allMessages, ...messages];
            } catch (error) {
                // Игнорируем ошибки
            }
        });

        return [...new Set(allMessages)];
    }

    shouldShowMessage(username) {
        const name = username.toLowerCase();

        // Собственные сообщения пользователя показываем всегда
        const ownLogin = this.getOwnLogin();
        if (ownLogin && name === ownLogin) return true;

        // При выключенном фильтре показываем всё
        if (!this.isFilterEnabled) return true;

        const isInList = this.usersList.includes(name);

        if (this.mode === 'whitelist') {
            return isInList;
        } else {
            return !isInList;
        }
    }

    // Логин текущего пользователя из cookie Twitch
    getOwnLogin() {
        if (this.ownLogin) return this.ownLogin;

        const match = document.cookie.match(/(?:^|;\s*)login=([^;]+)/);
        if (match) {
            this.ownLogin = decodeURIComponent(match[1]).toLowerCase();
        }
        return this.ownLogin;
    }

    // Логин пользователя из data-a-user (на корне сообщения в live чате
    // или на элементе с ником)
    extractLogin(messageElement) {
        if (messageElement.getAttribute) {
            const rootLogin = messageElement.getAttribute('data-a-user');
            if (rootLogin) return rootLogin;
        }

        const userElement = messageElement.querySelector?.('[data-a-user]');
        return userElement ? userElement.getAttribute('data-a-user') : null;
    }

    // Twitch показывает локализованные ники как «Имя (login)» —
    // для сравнения со списком нужен именно login
    normalizeUsername(username) {
        const match = username.match(/^.+\s\((\w+)\)$/);
        return match ? match[1] : username;
    }

    extractUsername(messageElement) {
        const strategies = [
            () => {
                const element = messageElement.querySelector('[data-a-target="chat-message-username"]');
                return element ? element.textContent.trim() : null;
            },

            () => {
                const element = messageElement.querySelector('[data-a-user]');
                return element ? element.getAttribute('data-a-user') : null;
            },

            () => {
                const element = messageElement.querySelector('.chat-author__display-name');
                return element ? element.textContent.trim() : null;
            },

            () => {
                const linkElement = messageElement.querySelector('a[href^="/"]');
                if (linkElement) {
                    const href = linkElement.getAttribute('href');
                    const username = href.replace('/', '');
                    if (username && !username.includes('/')) {
                        return username;
                    }
                }
                return null;
            }
        ];

        for (const strategy of strategies) {
            try {
                const username = strategy();
                if (username) {
                    return this.normalizeUsername(username);
                }
            } catch (error) {
                // Игнорируем ошибки
            }
        }

        return null;
    }

    extractMessageText(messageElement) {
        const selectors = [
            '[data-a-target="chat-message-text"]',
            '.text-fragment',
            '.video-chat__message .text-fragment',
            '.chat-line__message-text'
        ];

        for (const selector of selectors) {
            const textElement = messageElement.querySelector(selector);
            if (textElement) {
                return textElement.textContent.trim();
            }
        }

        return null;
    }

    extractTimestamp(messageElement) {
        // Временная метка в VOD сообщениях
        const timeElement = messageElement.querySelector('[data-test-selector="chat-timestamp"]') ||
            messageElement.querySelector('.vod-message__header p');
        if (timeElement) {
            const text = timeElement.textContent.trim();
            if (text) return text;
        }

        // Для live чата используем текущее время
        return new Date().toLocaleTimeString();
    }

    // Сохранение whitelist-сообщений: буферизуем и пишем в storage.local
    // пакетами, чтобы не упираться в лимиты записи
    saveWhitelistMessage(username, text) {
        this.pendingSavedMessages.push({
            username: username,
            text: text,
            timestamp: Date.now()
        });
        this.savedMessagesCount++;

        if (!this.saveTimer) {
            this.saveTimer = setTimeout(() => {
                this.saveTimer = null;
                this.flushSavedMessages();
            }, 2000);
        }
    }

    async flushSavedMessages() {
        if (this.pendingSavedMessages.length === 0) return;

        const batch = this.pendingSavedMessages;
        this.pendingSavedMessages = [];

        try {
            const result = await chrome.storage.local.get(['savedWhitelistMessages']);
            let saved = result.savedWhitelistMessages || [];
            saved = saved.concat(batch);

            // Храним последние 1000 сообщений
            if (saved.length > 1000) {
                saved = saved.slice(-1000);
            }

            await chrome.storage.local.set({
                savedWhitelistMessages: saved,
                savedMessagesCount: this.savedMessagesCount
            });
        } catch (error) {
            // Контекст расширения мог быть инвалидирован (обновление расширения)
        }
    }

    // Отложенная запись статистики — не чаще раза в 2 секунды
    scheduleStatsWrite() {
        if (this.statsTimer) return;

        this.statsTimer = setTimeout(() => {
            this.statsTimer = null;
            chrome.storage.local.set({
                hiddenMessagesCount: this.hiddenMessagesCount,
                savedMessagesCount: this.savedMessagesCount
            }).catch(() => { });
        }, 2000);
    }
}

// Инициализация фильтра
if (window.location.hostname.includes('twitch.tv')) {
    const filter = new TwitchChatFilter();

    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            filter.cleanup();
            setTimeout(() => {
                filter.waitForChat();
            }, 3000);
            return;
        }

        // Самовосстановление: если Twitch перемонтировал чат и наш
        // контейнер оторвался от документа — пересоздаем его
        if (filter.chatContainer && !filter.chatContainer.isConnected) {
            filter.cleanup();
            filter.waitForChat();
        }
    }, 1000);

    setTimeout(() => {
        if (!filter.chatContainer) {
            filter.waitForChat();
        }
    }, 5000);
}
