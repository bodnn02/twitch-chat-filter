// Ключ резервной копии настроек в localStorage сайта twitch.tv
const BACKUP_KEY = 'twitchChatFilterBackup';

// Иконки кнопок: SVG выглядит одинаково на всех системах, в отличие от эмодзи
const ICONS = {
    eye: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 4C5 4 1.7 8.3 1.1 9.4a1.2 1.2 0 0 0 0 1.2C1.7 11.7 5 16 10 16s8.3-4.3 8.9-5.4a1.2 1.2 0 0 0 0-1.2C18.3 8.3 15 4 10 4Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
    eyeOff: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2.7 1.3 1.3 2.7l3 3C2.6 7 1.5 8.7 1.1 9.4a1.2 1.2 0 0 0 0 1.2C1.7 11.7 5 16 10 16c1.6 0 3-.4 4.2-1.1l3.1 3.1 1.4-1.4-16-16.3ZM10 14a4 4 0 0 1-3.9-4.9l1.6 1.6a2 2 0 0 0 1.6 1.6l1.6 1.6c-.3.1-.6.1-.9.1Zm8.9-4.6C18.3 8.3 15 4 10 4c-1 0-1.9.2-2.8.5l1.7 1.6A4 4 0 0 1 14 11l2.6 2.6c1.2-1.2 2-2.4 2.3-3a1.2 1.2 0 0 0 0-1.2Z"/></svg>',
    popout: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M11 3h6v6h-2V6.4l-5.3 5.3-1.4-1.4L13.6 5H11V3ZM3 5a2 2 0 0 1 2-2h4v2H5v10h10v-4h2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"/></svg>'
};

// Переводы интерфейса внутри страницы Twitch
const TRANSLATIONS = {
    en: {
        filteredChat: 'Filtered chat',
        originalChat: 'Original chat',
        modes: { whitelist: 'Whitelist', blacklist: 'Blacklist' },
        messages: n => `${n} ${n === 1 ? 'message' : 'messages'}`,
        openPopout: 'Open in separate window',
        openOriginalPopout: 'Open chat in separate window',
        hideChat: 'Hide chat',
        showChat: 'Show chat',
        resize: 'Drag to resize',
        emptyNoUsers: 'The list is empty — add users in the extension menu',
        emptyWhitelist: 'No messages from users in the list yet',
        emptyAll: 'No messages yet'
    },
    ru: {
        filteredChat: 'Фильтрованный чат',
        originalChat: 'Оригинальный чат',
        modes: { whitelist: 'Белый список', blacklist: 'Чёрный список' },
        messages: n => `${n} ${pluralRu(n, 'сообщение', 'сообщения', 'сообщений')}`,
        openPopout: 'Открыть в отдельном окне',
        openOriginalPopout: 'Открыть чат в отдельном окне',
        hideChat: 'Скрыть чат',
        showChat: 'Показать чат',
        resize: 'Потяните, чтобы изменить размер',
        emptyNoUsers: 'Список пуст — добавьте ники в меню расширения',
        emptyWhitelist: 'Пока нет сообщений от пользователей из списка',
        emptyAll: 'Пока нет сообщений'
    }
};

// 1 сообщение, 2 сообщения, 5 сообщений
function pluralRu(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

class TwitchChatFilter {
    constructor() {
        this.usersList = [];
        // Тот же список для быстрой проверки на каждом сообщении
        this.usersSet = new Set();
        this.isFilterEnabled = true;
        this.hiddenMessagesCount = 0;
        this.savedMessagesCount = 0;
        this.mode = 'whitelist';
        this.observer = null;
        this.chatContainer = null;

        // Элементы нашего интерфейса (создаются в createCustomChat)
        this.dualContainer = null;
        this.customChatContainer = null;
        this.originalChatContainer = null;
        this.messagesContainer = null;
        // Элемент сообщения -> сигнатура его содержимого (Twitch может
        // переиспользовать один и тот же <li> для разных сообщений)
        this.processedElements = new WeakMap();
        // Уже показанные VOD-сообщения (время|логин|текст) — защита от
        // дублей, когда содержимое «переезжает» между элементами списка
        this.seenVodMessages = new Set();
        this.filteredMessages = [];
        // Обёртка в фильтрованном чате -> данные сообщения (для кликов)
        this.renderedMessages = new WeakMap();
        // Открытая копия меню сообщения (см. showProxyMenu)
        this.proxyMenu = null;
        this.suppressClickOn = null;
        this.maxDisplayedMessages = 200;
        this.currentLanguage = 'en';

        // Доля высоты фильтрованного чата (регулируется разделителем)
        this.splitRatio = 0.5;

        // Отдельное окно фильтрованного чата
        this.popoutWindow = null;
        this.popoutCheckTimer = null;
        this.popoutRulesCount = null;
        this.extensionCssPromise = null;

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

        this.init();
    }

    // Переводы для текущего языка
    get t() {
        return TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.en;
    }

    setUsersList(list) {
        this.usersList = list || [];
        this.usersSet = new Set(this.usersList.map(name => name.toLowerCase()));
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
                    this.setUsersList(changes.usersList.newValue);
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
                    this.updateInterfaceTexts();
                }

                this.writeBackup();

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

        // Расширение только что установлено (списка в storage ещё нет) —
        // восстанавливаем настройки из резервной копии на сайте Twitch
        if (syncData.usersList === undefined) {
            const backup = this.readBackup();
            if (backup) {
                Object.assign(syncData, backup);
                await chrome.storage.sync.set(backup);
            }
        }

        this.setUsersList(syncData.usersList);
        this.isFilterEnabled = syncData.isFilterEnabled !== false;
        this.mode = syncData.mode || 'whitelist';
        this.currentLanguage = syncData.language || 'en';
        this.hiddenMessagesCount = localData.hiddenMessagesCount || 0;
        this.savedMessagesCount = localData.savedMessagesCount || 0;
        this.splitRatio = localData.chatSplitRatio || 0.5;

        this.writeBackup();
    }

    // Резервная копия настроек в localStorage сайта twitch.tv: при удалении
    // расширения chrome.storage очищается, а данные сайта остаются
    readBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem(BACKUP_KEY));
            if (backup && Array.isArray(backup.usersList)) {
                return {
                    usersList: backup.usersList.filter(name => typeof name === 'string'),
                    mode: backup.mode === 'blacklist' ? 'blacklist' : 'whitelist',
                    isFilterEnabled: backup.isFilterEnabled !== false,
                    language: backup.language === 'ru' ? 'ru' : 'en'
                };
            }
        } catch (error) {
            // Повреждённая копия или localStorage недоступен
        }
        return null;
    }

    writeBackup() {
        try {
            localStorage.setItem(BACKUP_KEY, JSON.stringify({
                usersList: this.usersList,
                mode: this.mode,
                isFilterEnabled: this.isFilterEnabled,
                language: this.currentLanguage
            }));
        } catch (error) {
            // localStorage недоступен (например, заблокированы данные сайтов)
        }
    }

    // Применение новых настроек: пересобираем состояние из текущего DOM
    applySettings() {
        this.resetProcessed();
        this.filteredMessages = [];
        this.updateInterfaceTexts();
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
                    // Наблюдаем за обёрткой, а не за <ul> внутри неё: Twitch
                    // может пересоздать список, и наблюдатель остался бы
                    // на оторванном элементе
                    this.chatContainer = container;

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
        this.closeProxyMenu(false);

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

        this.removeDualContainer(document.getElementById('twitch-dual-chat-container'));

        this.chatContainer = null;
        this.dualContainer = null;
        this.customChatContainer = null;
        this.originalChatContainer = null;
        this.messagesContainer = null;
        this.resetProcessed();
        this.filteredMessages = [];
    }

    // Убираем наш контейнер, возвращая оригинальный чат на место
    removeDualContainer(dualContainer) {
        if (!dualContainer) return;

        const originalWrapper = dualContainer.querySelector('.twitch-original-content > *');
        if (originalWrapper && dualContainer.parentNode) {
            dualContainer.parentNode.insertBefore(originalWrapper, dualContainer);
        }
        dualContainer.remove();
    }

    // Все тексты интерфейса в одном месте: вызывается при создании чата
    // и при смене языка, режима или списка
    updateInterfaceTexts() {
        if (!this.dualContainer) return;

        const t = this.t;
        const filteredHidden = this.dualContainer.classList.contains('filtered-hidden');
        const originalHidden = this.dualContainer.classList.contains('original-hidden');

        this.dualContainer.setAttribute('data-mode', this.mode);

        this.customChatContainer.querySelector('.twitch-chat-title-text').textContent = t.filteredChat;
        this.customChatContainer.querySelector('.twitch-filter-mode').textContent =
            this.isFilterEnabled ? t.modes[this.mode] : '—';
        this.originalChatContainer.querySelector('.twitch-chat-title-text').textContent = t.originalChat;

        this.setButtonLabel(this.customChatContainer.querySelector('.twitch-popout-filtered'), t.openPopout);
        this.setButtonLabel(this.originalChatContainer.querySelector('.twitch-popout-original'), t.openOriginalPopout);
        this.setToggleState(this.customChatContainer.querySelector('.twitch-toggle-filtered'), filteredHidden);
        this.setToggleState(this.originalChatContainer.querySelector('.twitch-toggle-original'), originalHidden);

        this.dualContainer.querySelector('#twitch-chat-resizer').title = t.resize;

        const emptyText = this.getEmptyText();
        this.messagesContainer.dataset.empty = emptyText;
        const popoutList = this.getPopoutList();
        if (popoutList) {
            popoutList.dataset.empty = emptyText;
            this.popoutWindow.document.title = `${t.filteredChat} — ${t.modes[this.mode]}`;
        }

        this.updateMessageCount();
    }

    // Подсказка в пустом фильтрованном чате
    getEmptyText() {
        const t = this.t;
        if (!this.isFilterEnabled || this.mode === 'blacklist') return t.emptyAll;
        return this.usersSet.size ? t.emptyWhitelist : t.emptyNoUsers;
    }

    setButtonLabel(button, label) {
        button.title = label;
        button.setAttribute('aria-label', label);
    }

    setToggleState(button, hidden) {
        button.innerHTML = hidden ? ICONS.eyeOff : ICONS.eye;
        button.setAttribute('aria-pressed', String(hidden));
        this.setButtonLabel(button, hidden ? this.t.showChat : this.t.hideChat);
    }

    createCustomChat() {
        const existing = document.getElementById('twitch-dual-chat-container');
        if (existing) {
            if (existing === this.dualContainer) return;
            // Остался от предыдущего запуска (например, расширение
            // перезагрузили) — его обработчики уже не работают
            this.removeDualContainer(existing);
        }

        // Находим оригинальный чат
        const originalChatWrapper = document.querySelector('.video-chat__message-list-wrapper') ||
            document.querySelector('[data-a-target="chat-scroller"]')?.closest('.chat-shell, .chat-room');

        if (!originalChatWrapper) return;

        // Запоминаем место оригинального чата до манипуляций
        const chatParent = originalChatWrapper.parentNode;
        const nextSibling = originalChatWrapper.nextSibling;

        const dualChatContainer = document.createElement('div');
        dualChatContainer.id = 'twitch-dual-chat-container';
        dualChatContainer.innerHTML = `
            <section id="twitch-filter-chat">
                <header class="twitch-filter-header">
                    <span class="twitch-chat-title">
                        <span class="twitch-chat-title-text"></span>
                        <span class="twitch-filter-mode"></span>
                    </span>
                    <span class="twitch-filter-header-controls">
                        <span class="twitch-filter-count"></span>
                        <button type="button" class="twitch-chat-btn twitch-popout-filtered">${ICONS.popout}</button>
                        <button type="button" class="twitch-chat-btn twitch-toggle-filtered"></button>
                    </span>
                </header>
                <div class="twitch-filter-messages"></div>
            </section>
            <div id="twitch-chat-resizer" role="separator" aria-orientation="horizontal"></div>
            <section id="twitch-original-chat">
                <header class="twitch-original-header">
                    <span class="twitch-chat-title">
                        <span class="twitch-chat-title-text"></span>
                    </span>
                    <span class="twitch-filter-header-controls">
                        <button type="button" class="twitch-chat-btn twitch-popout-original">${ICONS.popout}</button>
                        <button type="button" class="twitch-chat-btn twitch-toggle-original"></button>
                    </span>
                </header>
                <div class="twitch-original-content"></div>
            </section>
        `;

        this.dualContainer = dualChatContainer;
        this.customChatContainer = dualChatContainer.querySelector('#twitch-filter-chat');
        this.originalChatContainer = dualChatContainer.querySelector('#twitch-original-chat');
        this.messagesContainer = dualChatContainer.querySelector('.twitch-filter-messages');

        // height: 100% не учитывает соседние элементы колонки (заголовок
        // «STREAM CHAT» и т.п.) — контейнер вылезает за низ экрана вместе
        // с кнопками поля ввода. В flex-колонке занимаем оставшееся место
        // через flex, как это делал сам chat-room
        if (window.getComputedStyle(chatParent).display.includes('flex')) {
            dualChatContainer.style.height = 'auto';
            dualChatContainer.style.flex = '1 1 0%';
        } else {
            // Не flex: вычитаем из 100% высоту соседних элементов колонки
            const siblingsHeight = Array.from(chatParent.children)
                .filter(el => el !== originalChatWrapper)
                .reduce((sum, el) => sum + el.offsetHeight, 0);
            if (siblingsHeight > 0) {
                dualChatContainer.style.height = `calc(100% - ${siblingsHeight}px)`;
            }
        }

        // Перемещаем оригинальный чат в наш контейнер и ставим контейнер
        // на его место
        const originalContent = this.originalChatContainer.querySelector('.twitch-original-content');
        originalContent.appendChild(originalChatWrapper);
        chatParent.insertBefore(dualChatContainer, nextSibling);

        this.updateInterfaceTexts();
        this.applySplitRatio();

        this.setupToggleButtons();
        this.setupResizer(dualChatContainer.querySelector('#twitch-chat-resizer'));
        this.setupPopoutButtons();
        this.setupMessageInteractions(this.messagesContainer);
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
            if (++attempts < 15 && originalContent.isConnected) {
                setTimeout(tryObserve, 2000);
            }
        };

        tryObserve();
    }

    // Пропорции чатов задаются через flex-grow — при скрытии одного
    // из чатов CSS-правила с !important перекрывают инлайн-стили
    applySplitRatio() {
        if (!this.customChatContainer || !this.originalChatContainer) return;

        this.customChatContainer.style.flex = `${this.splitRatio} 1 0%`;
        this.originalChatContainer.style.flex = `${1 - this.splitRatio} 1 0%`;

        // Оригинальный чат не может стать ниже, чем заголовок + поле ввода:
        // поле ввода сообщения должно оставаться видимым всегда
        this.originalChatContainer.style.minHeight = `${this.getMinOriginalHeight()}px`;
    }

    getMinOriginalHeight() {
        const header = this.originalChatContainer.querySelector('.twitch-original-header');
        const input = this.originalChatContainer.querySelector('.chat-input');
        const headerHeight = header ? header.offsetHeight : 30;
        const inputHeight = input ? input.offsetHeight : 0;

        // + минимальная высота списка сообщений
        return headerHeight + inputHeight + 60;
    }

    saveSplitRatio() {
        chrome.storage.local.set({ chatSplitRatio: this.splitRatio }).catch(() => { });
    }

    // Перетаскивание разделителя меняет пропорции чатов,
    // двойной клик возвращает 50/50
    setupResizer(resizer) {
        resizer.addEventListener('dblclick', () => {
            this.splitRatio = 0.5;
            this.applySplitRatio();
            this.saveSplitRatio();
        });

        resizer.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();

            const startY = e.clientY;
            const startFilterHeight = this.customChatContainer.getBoundingClientRect().height;
            const totalHeight = startFilterHeight + this.originalChatContainer.getBoundingClientRect().height;
            const minOriginalHeight = this.getMinOriginalHeight();
            const minFilterHeight = 80;

            const onMove = (ev) => {
                let newFilterHeight = startFilterHeight + ev.clientY - startY;
                newFilterHeight = Math.min(newFilterHeight, totalHeight - minOriginalHeight);
                newFilterHeight = Math.max(newFilterHeight, minFilterHeight);

                this.splitRatio = Math.max(0.05, Math.min(0.95, newFilterHeight / totalHeight));
                this.applySplitRatio();
            };

            const onUp = () => {
                resizer.removeEventListener('pointermove', onMove);
                resizer.removeEventListener('pointerup', onUp);
                resizer.removeEventListener('pointercancel', onUp);
                this.dualContainer.classList.remove('resizing');
                this.saveSplitRatio();
            };

            // Захват указателя: движение отслеживается, даже когда курсор
            // уходит с разделителя (и работает на сенсорных экранах)
            resizer.setPointerCapture(e.pointerId);
            this.dualContainer.classList.add('resizing');
            resizer.addEventListener('pointermove', onMove);
            resizer.addEventListener('pointerup', onUp);
            resizer.addEventListener('pointercancel', onUp);
        });
    }

    // Скрытие через CSS-класс на контейнере: у оригинального чата прячется
    // только список сообщений (поле ввода остаётся), стили переживают
    // ре-рендеры Twitch
    setupToggleButtons() {
        const bind = (button, className) => {
            button.addEventListener('click', () => {
                const hidden = this.dualContainer.classList.toggle(className);
                this.setToggleState(button, hidden);
                if (className === 'filtered-hidden' && !hidden) {
                    this.scrollToBottom(true);
                }
            });
        };

        bind(this.customChatContainer.querySelector('.twitch-toggle-filtered'), 'filtered-hidden');
        bind(this.originalChatContainer.querySelector('.twitch-toggle-original'), 'original-hidden');
    }

    setupPopoutButtons() {
        this.customChatContainer.querySelector('.twitch-popout-filtered')
            .addEventListener('click', () => this.openFilteredPopout());

        // Оригинальный чат выносится штатным popout Twitch; на страницах
        // без канала (например, VOD) он недоступен
        const originalBtn = this.originalChatContainer.querySelector('.twitch-popout-original');
        const channel = this.getChannelName();
        if (!channel) {
            originalBtn.hidden = true;
            return;
        }

        originalBtn.addEventListener('click', () => {
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

    // Стили расширения для отдельного окна (в него не внедряется
    // styles.css из content_scripts). Загружаются один раз
    getExtensionCss() {
        if (!this.extensionCssPromise) {
            this.extensionCssPromise = fetch(chrome.runtime.getURL('styles.css'))
                .then(response => response.text())
                .catch(() => '');
        }
        return this.extensionCssPromise;
    }

    getPopoutList() {
        const win = this.popoutWindow;
        if (!win || win.closed) return null;
        return win.document.querySelector('.twitch-filter-messages');
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
        this.popoutRulesCount = null;
        const doc = win.document;

        // Относительные адреса в стилях Twitch (шрифты и т.п.)
        const base = doc.createElement('base');
        base.href = location.origin;
        doc.head.appendChild(base);

        // Тема Twitch (CSS-переменные цветов) задаётся классами
        doc.documentElement.className = document.documentElement.className;
        this.syncPopoutStyles();

        // Собственные стили — последними, чтобы перекрывать стили Twitch
        const style = doc.createElement('style');
        doc.head.appendChild(style);
        this.getExtensionCss().then(css => {
            style.textContent = css;
        });

        doc.body.className = 'twitch-filter-popout';
        const list = doc.createElement('div');
        const themeRoot = this.chatContainer?.closest('[class*="tw-root--theme"]');
        list.className = `twitch-filter-messages ${themeRoot ? themeRoot.className : ''}`;
        doc.body.appendChild(list);
        this.setupMessageInteractions(list);
        this.updateInterfaceTexts();

        // Переносим уже накопленные сообщения
        this.filteredMessages.forEach(msg => this.appendMessageToPopout(msg));
        list.scrollTop = list.scrollHeight;

        // Отслеживаем закрытие окна; Twitch добавляет стили по мере
        // появления новых элементов — досылаем их в окно
        clearInterval(this.popoutCheckTimer);
        this.popoutCheckTimer = setInterval(() => {
            if (!this.popoutWindow || this.popoutWindow.closed) {
                clearInterval(this.popoutCheckTimer);
                this.popoutCheckTimer = null;
                this.popoutWindow = null;
                return;
            }
            this.syncPopoutStyles();
        }, 1000);
    }

    // Копируем стили страницы Twitch в отдельное окно. Styled-components
    // добавляют правила через CSSOM, поэтому содержимое <style> пустое —
    // берём правила из cssRules
    syncPopoutStyles() {
        const win = this.popoutWindow;
        if (!win || win.closed) return;

        const sheets = Array.from(document.styleSheets);
        let rulesCount = sheets.length;
        sheets.forEach(sheet => {
            try {
                rulesCount += sheet.cssRules.length;
            } catch (error) {
                // Чужой домен — правила недоступны
            }
        });
        if (rulesCount === this.popoutRulesCount) return;
        this.popoutRulesCount = rulesCount;

        win.document.querySelectorAll('.twitch-filter-page-style').forEach(el => el.remove());

        const fragment = win.document.createDocumentFragment();
        sheets.forEach(sheet => {
            let el;
            try {
                const cssText = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
                el = win.document.createElement('style');
                el.textContent = cssText;
            } catch (error) {
                if (!sheet.href) return;
                el = win.document.createElement('link');
                el.rel = 'stylesheet';
                el.href = sheet.href;
            }
            el.className = 'twitch-filter-page-style';
            fragment.appendChild(el);
        });

        // Стили страницы — первыми, чтобы собственные стили окна их перекрывали
        const base = win.document.head.querySelector('base');
        win.document.head.insertBefore(fragment, base ? base.nextSibling : win.document.head.firstChild);
    }

    appendMessageToPopout(msgData) {
        const list = this.getPopoutList();
        if (list) this.appendRendered(list, msgData);
    }

    startObserving() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Twitch может не добавлять новые <li>, а переиспользовать
        // существующие, меняя их содержимое (VOD-чат при перемотке и сдвиге
        // списка) — поэтому реагируем на любые изменения внутри чата.
        // Повторы отсекаются в processMessage по сигнатуре сообщения
        this.observer = new MutationObserver(() => {
            if (!this.processTimer) {
                // Один отложенный проход вместо таймера на каждую мутацию
                this.processTimer = setTimeout(() => {
                    this.processTimer = null;
                    this.processNewMessages();
                }, 100);
            }
        });

        this.observer.observe(this.chatContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    resetProcessed() {
        this.processedElements = new WeakMap();
        this.seenVodMessages = new Set();
    }

    processExistingMessages() {
        if (!this.messagesContainer) return;

        this.messagesContainer.textContent = '';

        // Окно popout тоже пересобираем
        const popoutList = this.getPopoutList();
        if (popoutList) popoutList.textContent = '';

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
        const username = this.extractUsername(messageElement);
        const messageText = this.extractMessageText(messageElement);

        // Сообщение ещё не отрисовано до конца — вернёмся к нему
        // при следующей мутации, не помечая как обработанное
        if (!username || !messageText) return;

        // Для сравнения со списком используем логин (data-a-user) —
        // он всегда латиницей в нижнем регистре, в отличие от отображаемого имени
        const login = this.extractLogin(messageElement) || username;

        // Дедупликация по содержимому элемента, а не по самому элементу:
        // Twitch может переиспользовать <li> под новое сообщение
        const vodTime = this.extractVodTimestamp(messageElement);
        const signature = `${vodTime || ''}|${login}|${messageText}`;
        if (this.processedElements.get(messageElement) === signature) {
            return;
        }
        this.processedElements.set(messageElement, signature);

        // В VOD у сообщения есть время в видео — по нему отсекаем
        // сообщения, которые просто сдвинулись в соседний элемент
        if (vodTime) {
            if (this.seenVodMessages.has(signature)) return;
            this.seenVodMessages.add(signature);
            if (this.seenVodMessages.size > 2000) {
                this.seenVodMessages.delete(this.seenVodMessages.values().next().value);
            }
        }

        const shouldShow = this.shouldShowMessage(login);

        if (shouldShow) {
            const messageData = {
                username: username,
                text: messageText,
                timestamp: this.extractTimestamp(messageElement),
                hasOwnTimestamp: Boolean(vodTime),
                // Копия оригинального сообщения со всеми значками, смайлами,
                // цветом ника и т.д.
                node: this.createMessageClone(messageElement),
                original: messageElement,
                signature: signature
            };

            this.filteredMessages.push(messageData);
            if (this.filteredMessages.length > this.maxDisplayedMessages) {
                this.filteredMessages.shift();
            }

            this.appendMessageToChat(messageData);
            this.appendMessageToPopout(messageData);

            if (this.mode === 'whitelist' && this.usersSet.has(login.toLowerCase())) {
                this.saveWhitelistMessage(username, messageText);
            }
        } else {
            this.hiddenMessagesCount++;
            this.scheduleStatsWrite();
        }
    }

    // Копия сообщения Twitch: внешний вид (значки, смайлы, стикеры,
    // упоминания, цвет ника) берётся из стилей самого Twitch
    createMessageClone(messageElement) {
        const clone = messageElement.cloneNode(true);
        clone.classList.add('twitch-filter-clone');

        // Часть стилей Twitch задаёт через родительский список (шрифт,
        // межстрочный интервал, отступы) — вне его копия была бы выше
        // оригинала. Переносим вычисленные значения прямо на копию
        const computed = window.getComputedStyle(messageElement);
        ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
            'margin', 'padding', 'color'].forEach(prop => {
            clone.style[prop] = computed[prop];
        });
        // <li> вне <ul> получил бы маркер списка
        clone.style.display = computed.display === 'list-item' ? 'block' : computed.display;
        clone.style.listStyle = 'none';

        // id должны оставаться уникальными в документе
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        return clone;
    }

    // Обёртка с копией сообщения для указанного документа
    // (основная страница или отдельное окно)
    renderMessage(msgData, doc) {
        const messageDiv = doc.createElement('div');
        messageDiv.className = 'twitch-filter-message';

        // В live чате времени у сообщения нет — добавляем своё
        if (!msgData.hasOwnTimestamp) {
            const timestampSpan = doc.createElement('span');
            timestampSpan.className = 'twitch-filter-timestamp';
            timestampSpan.textContent = msgData.timestamp;
            messageDiv.appendChild(timestampSpan);
        }

        messageDiv.appendChild(doc.importNode(msgData.node, true));
        this.renderedMessages.set(messageDiv, msgData);
        return messageDiv;
    }

    appendMessageToChat(msgData) {
        if (this.messagesContainer) this.appendRendered(this.messagesContainer, msgData);
    }

    // Добавление сообщения в список (основной чат или отдельное окно)
    // с прокруткой вниз, если пользователь не листает историю
    appendRendered(list, msgData) {
        const wasNearBottom = this.isNearBottom(list);

        list.appendChild(this.renderMessage(msgData, list.ownerDocument));

        // Ограничиваем количество DOM-элементов
        while (list.children.length > this.maxDisplayedMessages) {
            list.firstChild.remove();
        }

        if (wasNearBottom) {
            list.scrollTop = list.scrollHeight;
        }
    }

    // Клики по копии (ник, значок, смайл, упоминание, время в VOD)
    // передаём соответствующему элементу оригинального сообщения —
    // так работают карточка пользователя, карточка смайла, меню и перемотка
    setupMessageInteractions(container) {
        container.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.twitch-filter-message');
            const msgData = wrapper && this.renderedMessages.get(wrapper);
            if (!msgData) return;

            const interactive = e.target.closest(
                'a, button, [role="button"], img, .mention-fragment, ' +
                '[data-a-target]:not([data-a-target="chat-message-text"])'
            );
            if (!interactive || !wrapper.contains(interactive)) return;

            if (this.suppressClickOn === interactive) {
                this.suppressClickOn = null;
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            this.suppressClickOn = null;

            // Таймкод VOD: перематываем видео, даже если оригинала уже нет
            const isTimestamp = msgData.hasOwnTimestamp &&
                interactive.closest('.vod-message__header, [data-test-selector="chat-timestamp"]');

            const original = this.getLiveOriginal(msgData);
            const cloneRoot = wrapper.querySelector('.twitch-filter-clone');
            const target = original && this.findCounterpart(cloneRoot, interactive, original);

            // Оригинал уже удалён из чата — обычные ссылки работают сами
            if (!target && !isTimestamp) return;

            e.preventDefault();
            e.stopPropagation();

            if (target) {
                // Меню («⋮» справа от сообщения) Twitch открывает внутри
                // оригинального сообщения — его не видно, показываем копию
                if (!isTimestamp) this.watchOriginalPopup(original, target, interactive);
                target.click();
            }
            if (isTimestamp) this.ensureSeek(msgData.timestamp, !target);
        });

        this.setupHoverCard(container);
    }

    // Ждём появления всплывающего меню внутри оригинального сообщения
    // (наблюдатель ставится до клика: React отрисовывает меню синхронно)
    watchOriginalPopup(original, originalToggle, cloneAnchor) {
        this.closeProxyMenu();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE || node.contains(originalToggle)) continue;
                    if (this.getPopupItems(node).length) {
                        observer.disconnect();
                        clearTimeout(timer);
                        this.showProxyMenu(node, originalToggle, cloneAnchor);
                        return;
                    }
                }
            }
        });
        observer.observe(original, { childList: true, subtree: true });
        const timer = setTimeout(() => observer.disconnect(), 1000);
    }

    // Пункты меню: самые внешние кликабельные элементы с подписью
    getPopupItems(popup) {
        const candidates = Array.from(popup.querySelectorAll('[role="menuitem"], button, a[href]'));
        if (popup.matches('[role="menuitem"], button, a[href]')) candidates.unshift(popup);

        return candidates
            .filter(el => !candidates.some(other => other !== el && other.contains(el)))
            .map(el => ({
                element: el,
                label: (el.textContent.trim() || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ')
            }))
            .filter(item => item.label);
    }

    // Копия меню рядом с кнопкой в фильтрованном чате; оригинальное меню
    // остаётся открытым, но невидимым — клики по пунктам передаются ему
    showProxyMenu(popup, originalToggle, cloneAnchor) {
        this.closeProxyMenu(false);

        const doc = cloneAnchor.ownerDocument;
        const items = this.getPopupItems(popup);
        const menu = doc.createElement('div');
        menu.className = 'twitch-filter-menu';

        items.forEach(({ element, label }) => {
            const btn = doc.createElement('button');
            btn.textContent = label;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const labelsBefore = items.map(item => item.label).join('\n');
                element.click();

                // Пункт мог открыть следующий шаг (подменю, подтверждение)
                setTimeout(() => {
                    const labelsAfter = popup.isConnected
                        ? this.getPopupItems(popup).map(item => item.label).join('\n')
                        : '';
                    if (labelsAfter && labelsAfter !== labelsBefore) {
                        this.showProxyMenu(popup, originalToggle, cloneAnchor);
                    } else {
                        this.closeProxyMenu();
                    }
                }, 50);
            });
            menu.appendChild(btn);
        });

        // Обработчики Twitch «клик вне меню» не должны закрыть оригинал
        ['mousedown', 'pointerdown', 'mouseup', 'pointerup'].forEach(type => {
            menu.addEventListener(type, e => e.stopPropagation());
        });

        const previousVisibility = popup.style.visibility;
        popup.style.visibility = 'hidden';
        doc.body.appendChild(menu);

        // Позиция: под кнопкой, по правому краю; не выходим за окно
        const view = doc.defaultView;
        const anchorRect = cloneAnchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const left = Math.max(4, Math.min(anchorRect.right - menuRect.width, view.innerWidth - menuRect.width - 4));
        let top = anchorRect.bottom + 4;
        if (top + menuRect.height > view.innerHeight - 4) {
            top = Math.max(4, anchorRect.top - menuRect.height - 4);
        }
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;

        const onOutside = (e) => {
            if (menu.contains(e.target)) return;
            // Повторный клик по той же кнопке «⋮» только закрывает меню
            if (cloneAnchor.contains(e.target)) this.suppressClickOn = cloneAnchor;
            this.closeProxyMenu();
        };
        const onKey = (e) => {
            if (e.key === 'Escape') this.closeProxyMenu();
        };
        const onScroll = (e) => {
            if (!menu.contains(e.target)) this.closeProxyMenu();
        };
        doc.addEventListener('mousedown', onOutside, true);
        doc.addEventListener('keydown', onKey, true);
        doc.addEventListener('scroll', onScroll, true);
        // Twitch сам закрыл меню (или сообщение ушло из чата)
        const aliveTimer = setInterval(() => {
            if (!popup.isConnected) this.closeProxyMenu(false);
        }, 500);

        this.proxyMenu = {
            menu,
            popup,
            originalToggle,
            cleanup: () => {
                doc.removeEventListener('mousedown', onOutside, true);
                doc.removeEventListener('keydown', onKey, true);
                doc.removeEventListener('scroll', onScroll, true);
                clearInterval(aliveTimer);
                popup.style.visibility = previousVisibility;
            }
        };
    }

    // closeOriginal: закрыть и оригинальное меню повторным кликом по кнопке
    closeProxyMenu(closeOriginal = true) {
        const proxy = this.proxyMenu;
        if (!proxy) return;
        this.proxyMenu = null;

        proxy.menu.remove();
        if (closeOriginal && proxy.popup.isConnected && proxy.originalToggle.isConnected) {
            proxy.originalToggle.click();
        }
        proxy.cleanup();
    }

    // Перемотка VOD к времени сообщения («1:02:03» или «2:03»). Сначала
    // даём сработать обработчику Twitch; если видео не перемоталось —
    // перематываем сами через элемент <video>
    ensureSeek(timestamp, immediately) {
        const parts = String(timestamp).split(':').map(Number);
        if (!parts.length || parts.some(n => Number.isNaN(n))) return;
        const seconds = parts.reduce((total, n) => total * 60 + n, 0);

        const seek = () => {
            const video = document.querySelector('video');
            if (video && Math.abs(video.currentTime - seconds) > 3) {
                video.currentTime = seconds;
            }
        };

        if (immediately) {
            seek();
        } else {
            setTimeout(seek, 500);
        }
    }

    // Оригинал сообщения, если он ещё в чате и не переиспользован
    // Twitch под другое сообщение
    getLiveOriginal(msgData) {
        const original = msgData.original;
        if (!original || !original.isConnected) return null;
        return this.processedElements.get(original) === msgData.signature ? original : null;
    }

    // Элемент оригинала, стоящий на том же месте, что и node в копии
    findCounterpart(cloneRoot, node, original) {
        const path = [];
        for (let el = node; el && el !== cloneRoot; el = el.parentElement) {
            path.unshift(Array.prototype.indexOf.call(el.parentElement.children, el));
        }

        let target = original;
        for (const index of path) {
            target = target.children[index];
            if (!target) return null;
        }
        return target.tagName === node.tagName ? target : null;
    }

    // Подсказка при наведении на значки и смайлы: увеличенная картинка
    // и название (родные подсказки Twitch на копии не работают)
    setupHoverCard(container) {
        const doc = container.ownerDocument;
        // Чат пересоздаётся при навигации — карточка в документе одна
        doc.querySelector('.twitch-filter-hovercard')?.remove();
        const card = doc.createElement('div');
        card.className = 'twitch-filter-hovercard';
        const cardImg = doc.createElement('img');
        const cardLabel = doc.createElement('div');
        card.append(cardImg, cardLabel);
        doc.body.appendChild(card);

        container.addEventListener('mouseover', (e) => {
            const img = e.target.closest?.('img');
            if (!img || !container.contains(img)) return;

            const label = img.getAttribute('alt') || img.getAttribute('aria-label');
            if (!label) return;

            cardImg.src = this.getLargestImageSrc(img);
            cardLabel.textContent = label;
            card.style.display = 'flex';

            const rect = img.getBoundingClientRect();
            const view = doc.defaultView;
            const cardRect = card.getBoundingClientRect();
            let left = rect.left + rect.width / 2 - cardRect.width / 2;
            left = Math.max(4, Math.min(left, view.innerWidth - cardRect.width - 4));
            let top = rect.top - cardRect.height - 6;
            if (top < 4) top = rect.bottom + 6;
            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
        });

        container.addEventListener('mouseout', (e) => {
            if (e.target.closest?.('img')) {
                card.style.display = 'none';
            }
        });
    }

    getLargestImageSrc(img) {
        const srcset = img.getAttribute('srcset');
        if (srcset) {
            const candidates = srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
            if (candidates.length) return candidates[candidates.length - 1];
        }
        return img.currentSrc || img.src;
    }

    isNearBottom(container) {
        return container.scrollHeight - container.scrollTop - container.clientHeight < 60;
    }

    scrollToBottom(force = false) {
        const list = this.messagesContainer;
        if (list && (force || this.isNearBottom(list))) {
            list.scrollTop = list.scrollHeight;
        }
    }

    updateMessageCount() {
        if (!this.customChatContainer) return;

        this.customChatContainer.querySelector('.twitch-filter-count').textContent =
            this.t.messages(this.filteredMessages.length);
    }

    findAllMessages() {
        if (!this.chatContainer) return [];

        const messages = new Set([
            // Live чат: сообщения — div.chat-line__message
            ...this.chatContainer.querySelectorAll(
                '.chat-line__message, [data-a-target="chat-line-message"], [data-test-selector="chat-line-message"]'
            ),
            // VOD: сообщения — li с .vod-message внутри
            ...Array.from(this.chatContainer.querySelectorAll('li .vod-message'), el => el.closest('li')),
            // Запасной вариант: поднимаемся от ника к корню сообщения
            ...Array.from(
                this.chatContainer.querySelectorAll('[data-a-target="chat-message-username"]'),
                el => el.closest('.chat-line__message, li')
            )
        ]);
        messages.delete(null);

        return [...messages];
    }

    shouldShowMessage(username) {
        const name = username.toLowerCase();

        // Собственные сообщения пользователя показываем всегда
        const ownLogin = this.getOwnLogin();
        if (ownLogin && name === ownLogin) return true;

        // При выключенном фильтре показываем всё
        if (!this.isFilterEnabled) return true;

        const isInList = this.usersSet.has(name);

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
        // Тело сообщения целиком: текст + названия смайлов, чтобы сообщения
        // только из смайлов тоже проходили через фильтр
        const body = messageElement.querySelector(
            '[data-a-target="chat-line-message-body"], .video-chat__message'
        );
        if (body) {
            let text = '';
            const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                } else if (node.tagName === 'IMG' && node.alt) {
                    text += ` ${node.alt} `;
                }
            }
            // В VOD тело начинается с разделителя «:»
            text = text.replace(/\s+/g, ' ').trim().replace(/^:\s*/, '');
            if (text) return text;
        }

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

    // Время сообщения в видео (есть только в VOD)
    extractVodTimestamp(messageElement) {
        const timeElement = messageElement.querySelector('[data-test-selector="chat-timestamp"]') ||
            messageElement.querySelector('.vod-message__header p');
        const text = timeElement ? timeElement.textContent.trim() : '';
        return text || null;
    }

    extractTimestamp(messageElement) {
        // Для live чата используем текущее время
        return this.extractVodTimestamp(messageElement) || new Date().toLocaleTimeString();
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
