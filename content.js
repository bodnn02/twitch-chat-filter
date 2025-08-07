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
        this.processedMessages = new Set();
        this.filteredMessages = [];
        this.currentLanguage = 'en';

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

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'updateFilter') {
                this.usersList = request.usersList || [];
                this.isFilterEnabled = request.isFilterEnabled;
                this.mode = request.mode || 'whitelist';
                this.currentLanguage = request.language || 'en';
                this.updateChatHeaders();
                this.rebuildCustomChat();
            }
        });
    }

    updateChatContent() {
        const t = this.translations[this.currentLanguage];
        this.customChatContainer.innerHTML = `
      <div class="twitch-filter-header">
        <span>${t.filteredChat} (${this.mode})</span>
        <span class="twitch-filter-count">0 ${t.messages}</span>
      </div>
      <div class="twitch-filter-messages"></div>
    `;
    }

    updateOriginalChatContent(container) {
        const t = this.translations[this.currentLanguage];
        container.innerHTML = `
      <div class="twitch-original-header">
        <span>${t.originalChat}</span>
        <button class="twitch-toggle-original" title="Toggle original chat">👁</button>
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
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                'usersList', 'isFilterEnabled', 'hiddenMessagesCount',
                'savedMessagesCount', 'mode', 'language'
            ], (result) => {
                this.usersList = result.usersList || [];
                this.isFilterEnabled = result.isFilterEnabled !== false;
                this.hiddenMessagesCount = result.hiddenMessagesCount || 0;
                this.savedMessagesCount = result.savedMessagesCount || 0;
                this.mode = result.mode || 'whitelist';
                this.currentLanguage = result.language || 'en';
                resolve();
            });
        });
    }

    waitForChat() {
        const checkChat = () => {
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
                        if (ul) {
                            this.chatContainer = ul;
                        } else {
                            this.chatContainer = container;
                        }
                    } else {
                        this.chatContainer = container;
                    }

                    this.createCustomChat();
                    this.startObserving();
                    this.processExistingMessages();
                    return;
                }
            }

            setTimeout(checkChat, 2000);
        };

        checkChat();
    }

    createCustomChat() {
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

        // Собираем dual chat
        dualChatContainer.appendChild(this.customChatContainer);
        dualChatContainer.appendChild(originalChatContainer);

        // Вставляем dual chat в DOM
        if (nextSibling) {
            chatParent.insertBefore(dualChatContainer, nextSibling);
        } else {
            chatParent.appendChild(dualChatContainer);
        }

        // Добавляем функциональность переключения оригинального чата
        this.setupToggleButton(originalChatContainer, originalContent);
    }

    setupToggleButton(originalChatContainer, originalContent) {
        const toggleBtn = originalChatContainer.querySelector('.twitch-toggle-original');
        let originalVisible = true;

        toggleBtn.addEventListener('click', () => {
            originalVisible = !originalVisible;
            originalContent.style.display = originalVisible ? 'block' : 'none';
            toggleBtn.textContent = originalVisible ? '👁' : '🙈';

            // Обновляем размеры
            const dualContainer = document.getElementById('twitch-dual-chat-container');
            if (originalVisible) {
                dualContainer.classList.remove('original-hidden');
            } else {
                dualContainer.classList.add('original-hidden');
            }
        });
    }

    startObserving() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver((mutations) => {
            let hasNewMessages = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && this.isMessageElement(node)) {
                            hasNewMessages = true;
                        }
                    });
                }
            });

            if (hasNewMessages) {
                setTimeout(() => this.processNewMessages(), 100);
            }
        });

        this.observer.observe(this.chatContainer, {
            childList: true,
            subtree: true
        });
    }

    isMessageElement(element) {
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
        const messages = this.findAllMessages();
        this.filteredMessages = [];

        messages.forEach((message) => {
            this.processMessage(message);
        });

        this.rebuildCustomChat();
    }

    processNewMessages() {
        const messages = this.findAllMessages();

        messages.forEach((message) => {
            const messageId = this.getMessageId(message);
            if (!this.processedMessages.has(messageId)) {
                this.processMessage(message);
            }
        });

        this.rebuildCustomChat();
    }

    processMessage(messageElement) {
        const messageId = this.getMessageId(messageElement);
        if (this.processedMessages.has(messageId)) {
            return;
        }

        this.processedMessages.add(messageId);

        const username = this.extractUsername(messageElement);
        const messageText = this.extractMessageText(messageElement);
        const timestamp = this.extractTimestamp(messageElement);

        if (username && messageText) {
            const shouldShow = this.shouldShowMessage(username);

            if (shouldShow) {
                const messageData = {
                    id: messageId,
                    username: username,
                    text: messageText,
                    timestamp: timestamp,
                    element: messageElement.cloneNode(true)
                };

                this.filteredMessages.push(messageData);

                if (this.mode === 'whitelist') {
                    this.saveWhitelistMessage(username, messageText);
                }
            } else {
                this.hiddenMessagesCount++;
            }
        }
    }

    rebuildCustomChat() {
        if (!this.customChatContainer) return;

        const messagesContainer = this.customChatContainer.querySelector('.twitch-filter-messages');
        const countElement = this.customChatContainer.querySelector('.twitch-filter-count');

        if (!messagesContainer || !countElement) return;

        // Очищаем контейнер
        messagesContainer.innerHTML = '';

        // Фильтруем сообщения в зависимости от настроек
        let displayMessages = [];

        if (this.isFilterEnabled) {
            displayMessages = this.filteredMessages.filter(msg =>
                this.shouldShowMessage(msg.username)
            );
        } else {
            displayMessages = this.filteredMessages;
        }

        // Показываем последние 100 сообщений
        const recentMessages = displayMessages.slice(-100);

        recentMessages.forEach(msgData => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'twitch-filter-message';

            // Создаем упрощенную версию сообщения
            messageDiv.innerHTML = `
        <span class="twitch-filter-timestamp">${msgData.timestamp}</span>
        <span class="twitch-filter-username" style="color: #9146ff;">${msgData.username}</span>
        <span class="twitch-filter-text">: ${msgData.text}</span>
      `;

            messagesContainer.appendChild(messageDiv);
        });

        // Обновляем счетчик
        countElement.textContent = `${displayMessages.length} ${this.translations[this.currentLanguage].messages}`;

        // Обновляем заголовок с режимом
        const headerSpan = this.customChatContainer.querySelector('.twitch-filter-header span');
        if (headerSpan) {
            const t = this.translations[this.currentLanguage];
            headerSpan.textContent = `${t.filteredChat} (${this.mode})`;
        }

        // Устанавливаем атрибут режима для стилизации
        const dualContainer = document.getElementById('twitch-dual-chat-container');
        if (dualContainer) {
            dualContainer.setAttribute('data-mode', this.mode);
        }

        // Прокручиваем вниз
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.updateStats();
    }

    findAllMessages() {
        if (!this.chatContainer) return [];

        const strategies = [
            () => {
                const vodMessages = this.chatContainer.querySelectorAll('li .vod-message');
                const liElements = Array.from(vodMessages).map(vm => vm.closest('li')).filter(Boolean);
                const chatMessages = this.chatContainer.querySelectorAll('[data-test-selector="chat-line-message"]');

                return [...liElements, ...Array.from(chatMessages)];
            },

            () => {
                const allLiElements = this.chatContainer.querySelectorAll('li');
                return Array.from(allLiElements).filter(li => {
                    const hasUsername = li.querySelector('[data-a-target="chat-message-username"]');
                    const hasMessage = li.querySelector('[data-a-target="chat-message-text"]');

                    return hasUsername && hasMessage;
                });
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
        const isInList = this.usersList.includes(username.toLowerCase());

        if (this.mode === 'whitelist') {
            return isInList;
        } else {
            return !isInList;
        }
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
                    return username;
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
        // Ищем временную метку в VOD сообщениях
        const timeElement = messageElement.querySelector('.CoreText-sc-1txzju1-0');
        if (timeElement) {
            return timeElement.textContent.trim();
        }

        // Для live чата используем текущее время
        const now = new Date();
        return now.toLocaleTimeString();
    }

    getMessageId(messageElement) {
        const username = this.extractUsername(messageElement);
        const text = this.extractMessageText(messageElement);
        const timestamp = this.extractTimestamp(messageElement);

        return `${username || 'unknown'}-${(text || '').substring(0, 20)}-${timestamp}`.replace(/\s+/g, '');
    }

    saveWhitelistMessage(username, text) {
        const message = {
            username: username,
            text: text,
            timestamp: Date.now()
        };

        this.savedMessagesCount++;

        chrome.runtime.sendMessage({
            action: 'updateStats',
            hiddenCount: this.hiddenMessagesCount,
            savedCount: this.savedMessagesCount,
            newMessage: message
        }).catch(() => { });
    }

    updateStats() {
        chrome.storage.sync.set({
            hiddenMessagesCount: this.hiddenMessagesCount,
            savedMessagesCount: this.savedMessagesCount
        });

        chrome.runtime.sendMessage({
            action: 'updateStats',
            hiddenCount: this.hiddenMessagesCount,
            savedCount: this.savedMessagesCount
        }).catch(() => { });
    }
}

// Инициализация фильтра
if (window.location.hostname.includes('twitch.tv')) {
    const filter = new TwitchChatFilter();

    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(() => {
                filter.waitForChat();
            }, 3000);
        }
    }, 1000);

    setTimeout(() => {
        if (!filter.chatContainer) {
            filter.waitForChat();
        }
    }, 5000);
}