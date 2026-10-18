// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Risher. Licensed under GPL-3.0-only, see LICENSE

// Key of the settings backup in the twitch.tv localStorage
var BACKUP_KEY = 'twitchChatFilterBackup';

// Auto-collapse of the filtered chat: after this long without matching messages
var AUTO_COLLAPSE_DELAY = 5 * 60 * 1000;

// Notifications about messages of rules marked "notify": at most one per this
// interval, so a burst of messages does not ring many times
var NOTIFY_INTERVAL = 3000;

// Send status: if your message does not appear in the chat within this time,
// it is marked as not confirmed
var SEND_TIMEOUT = 6000;

// While the Twitch tab is hidden (another tab, minimized browser) the page
// does not draw new chat messages, so the chat is read from the Twitch chat
// server directly: anonymously, read-only, only for notifications
var TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443';

// Button icons: SVG looks the same on every system, unlike emoji
var ICONS = {
    eye: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 4C5 4 1.7 8.3 1.1 9.4a1.2 1.2 0 0 0 0 1.2C1.7 11.7 5 16 10 16s8.3-4.3 8.9-5.4a1.2 1.2 0 0 0 0-1.2C18.3 8.3 15 4 10 4Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
    eyeOff: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2.7 1.3 1.3 2.7l3 3C2.6 7 1.5 8.7 1.1 9.4a1.2 1.2 0 0 0 0 1.2C1.7 11.7 5 16 10 16c1.6 0 3-.4 4.2-1.1l3.1 3.1 1.4-1.4-16-16.3ZM10 14a4 4 0 0 1-3.9-4.9l1.6 1.6a2 2 0 0 0 1.6 1.6l1.6 1.6c-.3.1-.6.1-.9.1Zm8.9-4.6C18.3 8.3 15 4 10 4c-1 0-1.9.2-2.8.5l1.7 1.6A4 4 0 0 1 14 11l2.6 2.6c1.2-1.2 2-2.4 2.3-3a1.2 1.2 0 0 0 0-1.2Z"/></svg>',
    filter: '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M2 3h16l-6 7.5V16l-4 2v-7.5L2 3Z"/></svg>',
    download: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M9 2h2v8.6l3.3-3.3 1.4 1.4L10 14.4 4.3 8.7l1.4-1.4L9 10.6V2ZM3 15h2v2h10v-2h2v4H3v-4Z"/></svg>',
    popout: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M11 3h6v6h-2V6.4l-5.3 5.3-1.4-1.4L13.6 5H11V3ZM3 5a2 2 0 0 1 2-2h4v2H5v10h10v-4h2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"/></svg>'
};

// UI strings shown on the Twitch page
var TRANSLATIONS = {
    en: {
        filteredChat: 'Filtered chat',
        originalChat: 'Original chat',
        filterOff: 'Filter off',
        messages: n => `${n} ${n === 1 ? 'message' : 'messages'}`,
        openPopout: 'Open in separate window',
        openOriginalPopout: 'Open chat in separate window',
        hideChat: 'Hide chat',
        showChat: 'Show chat',
        resize: 'Drag to resize',
        emptyNoRules: 'No rules that show messages — add them in the extension menu',
        emptyFiltered: 'No matching messages yet',
        emptyAll: 'No messages yet',
        exportChat: 'Export messages',
        copyText: 'Copy as text',
        saveTxt: 'Save as .txt',
        saveCsv: 'Save as .csv',
        copied: 'Copied',
        nothingToExport: 'No messages to export',
        expandChat: 'Collapsed: no new messages. Click to expand',
        today: 'Today',
        yesterday: 'Yesterday',
        quickAddFor: name => `Filter: ${name}`,
        quickAddTitle: (name, preset) => `${name} · preset “${preset}”`,
        quickShow: 'Show messages of this user',
        quickHide: 'Hide messages of this user',
        quickRemove: 'Remove the rule for this user'
    },
    ru: {
        filteredChat: 'Фильтрованный чат',
        originalChat: 'Оригинальный чат',
        filterOff: 'Фильтр выключен',
        messages: n => `${n} ${pluralRu(n, 'сообщение', 'сообщения', 'сообщений')}`,
        openPopout: 'Открыть в отдельном окне',
        openOriginalPopout: 'Открыть чат в отдельном окне',
        hideChat: 'Скрыть чат',
        showChat: 'Показать чат',
        resize: 'Потяните, чтобы изменить размер',
        emptyNoRules: 'Нет правил, которые показывают сообщения, — добавьте их в меню расширения',
        emptyFiltered: 'Пока нет подходящих сообщений',
        emptyAll: 'Пока нет сообщений',
        exportChat: 'Экспорт сообщений',
        copyText: 'Скопировать текстом',
        saveTxt: 'Сохранить в .txt',
        saveCsv: 'Сохранить в .csv',
        copied: 'Скопировано',
        nothingToExport: 'Нет сообщений для экспорта',
        expandChat: 'Свёрнут: новых сообщений нет. Нажмите, чтобы развернуть',
        today: 'Сегодня',
        yesterday: 'Вчера',
        quickAddFor: name => `Фильтр: ${name}`,
        quickAddTitle: (name, preset) => `${name} · набор «${preset}»`,
        quickShow: 'Показывать сообщения пользователя',
        quickHide: 'Скрывать сообщения пользователя',
        quickRemove: 'Удалить правило для пользователя'
    }
};

// Russian plural forms: 1 сообщение, 2 сообщения, 5 сообщений
function pluralRu(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

var TwitchChatFilter = class TwitchChatFilter {
    constructor() {
        // Settings from settings.js (FilterStore.normalizeState)
        this.state = null;
        this.isFilterEnabled = true;
        // Enabled rules of the active preset, split by action
        this.includeRules = [];
        this.excludeRules = [];
        this.presetId = null;
        this.presetName = '';
        // Channel of the open page (see detectChannel)
        this.channel = null;
        this.observer = null;
        this.chatContainer = null;

        // Our UI elements (created in createCustomChat)
        this.dualContainer = null;
        this.customChatContainer = null;
        this.originalChatContainer = null;
        this.messagesContainer = null;
        // Message element -> signature of its content (Twitch may reuse the same <li>
        // for different messages)
        this.processedElements = new WeakMap();
        // Message element -> { signature, time }: when the message arrived. Not reset
        // when settings change, so message times are kept
        this.messageTimes = new WeakMap();
        // VOD messages already shown (time|login|text): protects against duplicates
        // when content moves between list items
        this.seenVodMessages = new Set();
        this.filteredMessages = [];
        // Wrapper in the filtered chat -> message data (for clicks)
        this.renderedMessages = new WeakMap();
        // Open copy of a message menu (see showProxyMenu)
        this.proxyMenu = null;
        this.suppressClickOn = null;
        this.maxDisplayedMessages = 200;

        // Filtered chat history of the channel (see loadHistory): saved entries,
        // oldest first, and their keys (time|signature) for deduplication
        this.history = [];
        this.historyKeys = new Set();
        this.historyChannel = null;
        // Key -> original message element (this session only): clicks on a message
        // shown from the history still reach the original while it is in the chat
        this.historyOriginals = new Map();
        // Signatures of the latest saved messages: Twitch may show them again right
        // after a page reload, they must not be duplicated. Checked only for a short
        // time after loading, so repeated messages of a chatter are not lost
        this.recentSignatures = new Set();
        this.recentUntil = 0;
        // Chat elements recognized as such repeats -> their signature (they stay
        // hidden when the filtered chat is rebuilt)
        this.repeatedElements = new WeakMap();
        // Entries waiting to be written (written in batches)
        this.historyQueue = [];
        this.historyTimer = null;

        // Auto-collapse: time of the last matching message
        this.lastMatchAt = 0;
        this.collapseTimer = null;
        // Open export menu (see showExportMenu)
        this.exportMenu = null;
        // The chat is being rebuilt from the DOM (see processExistingMessages)
        this.rebuilding = false;

        // Rule counters not written yet: rule id -> { count, last }
        this.statsDelta = new Map();
        this.statsTimer = null;
        // Notifications: time of the last one (not more often than NOTIFY_INTERVAL)
        this.lastNotifyAt = 0;
        this.audioContext = null;
        // Messages already notified about (login|text -> time): the same message
        // may come from the chat server and then from the page
        this.notifiedKeys = new Map();

        // Reading the chat while the tab is hidden (see updateBackgroundWatch)
        this.irc = null;
        this.ircChannel = null;
        this.ircRetry = null;
        this.ircAttempts = 0;
        this.visibilityHandler = null;

        // Quick add from the chat: floating button over the hovered message
        this.quickButton = null;
        this.quickTarget = null;
        this.quickMenu = null;
        this.quickHideTimer = null;

        // Send status of your own message: waiting / sent / not confirmed
        this.sendTimer = null;
        this.sendStatusHandler = null;
        this.currentLanguage = 'en';

        // Share of the height taken by the filtered chat (set by the divider)
        this.splitRatio = 0.5;

        // Filtered chat in a separate window
        this.popoutWindow = null;
        this.popoutCheckTimer = null;
        this.popoutRulesCount = null;
        this.extensionCssPromise = null;

        // Login of the current user (their messages are never filtered out)
        this.ownLogin = null;

        // Watches the size of the message input
        this.inputResizeObserver = null;

        // Twitch top panels above the filtered chat (see setupTopPanels)
        this.topPanels = new Set();
        this.topPanelsMutation = null;
        this.topPanelsResize = null;
        this.topPanelsFrame = null;
        this.topPanelsWindowHandler = null;

        // Timers (cancelled on navigation)
        this.waitTimer = null;
        this.processTimer = null;
        this.reloadTimer = null;
        // Stopped for good (see destroy)
        this.destroyed = false;

        this.init();
    }

    // Strings for the current language
    get t() {
        return TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.en;
    }

    setState(state) {
        this.state = state;
        this.isFilterEnabled = state.isFilterEnabled;
        // 'system' means the browser language
        this.currentLanguage = FilterStore.resolveLanguage(state.language);

        // Preset bound to the open channel, or the default preset
        this.channel = this.detectChannel();
        const preset = FilterStore.getPresetForChannel(state, this.channel);
        this.presetId = preset.id;
        this.presetName = preset.name;

        // test: the rule and all its extra conditions, compiled once
        const rules = preset.rules
            .filter(rule => rule.enabled)
            .map(rule => {
                const checks = [rule, ...(rule.conditions || [])].map(condition => FilterStore.compileCondition(condition));
                return { ...rule, test: message => checks.every(check => check(message)) };
            });
        this.includeRules = rules.filter(rule => rule.action === 'include');
        this.excludeRules = rules.filter(rule => rule.action === 'exclude');
    }

    // Channel of the open page. On VOD and clip pages (/videos/…) the URL has no
    // channel, so it is taken from the page: the streamer link (name or avatar)
    // in the stream information block. Classes there are hashed, so the link is
    // found by its contents
    detectChannel() {
        const fromUrl = FilterStore.channelFromUrl(location.href);
        if (fromUrl) return fromUrl;

        const info = document.querySelector(
            '#live-channel-stream-information, .channel-info-content, [class*="metadata-layout"]'
        );
        if (!info) return null;

        const links = Array.from(info.querySelectorAll('a[href]'));
        const preferred = links.filter(link => link.querySelector('h1, .tw-title, .tw-avatar, [class*="avatar" i]'));
        for (const link of [...preferred, ...links]) {
            const channel = FilterStore.channelFromUrl(link.href);
            if (channel) return channel;
        }
        return null;
    }

    // The page channel became known (or changed) after the settings were applied:
    // switch to the preset of that channel
    refreshChannel() {
        if (!this.state || this.detectChannel() === this.channel) return;

        const previousPresetId = this.presetId;
        this.setState(this.state);
        if (this.presetId !== previousPresetId) {
            this.applySettings();
        } else {
            this.updateInterfaceTexts();
        }
        this.loadHistory();
    }

    async init() {
        await this.loadSettings();
        this.waitForChat();

        // The popup asks for the channel: on VOD pages it is not in the tab URL
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message && message.type === 'getChannel') {
                sendResponse({ channel: this.detectChannel() });
            }
        });

        // Settings are changed from the popup via storage, so this works for every
        // open Twitch tab, not just the active one. The popup writes several keys at
        // once, so reload only once
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.historyClearedAt) {
                // Messages already shown stay until the page is reloaded; nothing is
                // loaded again
                this.historyQueue = [];
                this.resetHistory();
                this.historyChannel = this.channel;
                return;
            }
            if (areaName !== 'sync') return;

            clearTimeout(this.reloadTimer);
            this.reloadTimer = setTimeout(() => this.reloadSettings(), 100);
        });
    }

    async loadSettings() {
        // The extension was just installed: settings are restored from the backup on
        // the Twitch site
        const state = await FilterStore.loadAndMigrate(() => this.readBackup());
        const localData = await chrome.storage.local.get(['chatSplitRatio']);

        this.setState(state);
        this.splitRatio = localData.chatSplitRatio || 0.5;

        this.writeBackup();
    }

    async reloadSettings() {
        let state;
        try {
            ({ state } = await FilterStore.load());
        } catch (error) {
            // The extension context may have been invalidated (extension update)
            return;
        }
        if (this.destroyed) return;

        const previous = this.state;
        this.setState(state);
        this.writeBackup();

        // Only the look changed (language, collapsing, hidden names): no need to
        // filter again
        const withoutView = value => {
            const copy = { ...value };
            VIEW_SETTINGS.forEach(key => delete copy[key]);
            return JSON.stringify(copy);
        };
        if (withoutView(previous) !== withoutView(state)) {
            if (previous.historyEnabled !== state.historyEnabled) this.resetHistory();
            this.applySettings();
            if (state.historyEnabled && !previous.historyEnabled) this.loadHistory();
        } else {
            this.updateInterfaceTexts();
            this.updateBackgroundWatch();
        }
    }

    // Settings backup in the twitch.tv localStorage: chrome.storage is cleared
    // when the extension is removed, but site data stays
    readBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem(BACKUP_KEY));
            if (backup && typeof backup === 'object') return backup;
        } catch (error) {
            // Corrupted backup or localStorage is unavailable
        }
        return null;
    }

    writeBackup() {
        try {
            localStorage.setItem(BACKUP_KEY, JSON.stringify(this.state));
        } catch (error) {
            // localStorage is unavailable (e.g. site data is blocked)
        }
    }

    // Apply new settings: rebuild the state from the current DOM
    applySettings() {
        this.updateBackgroundWatch();
        this.resetProcessed();
        this.filteredMessages = [];
        this.updateInterfaceTexts();
        this.processExistingMessages();
    }

    waitForChat() {
        if (this.destroyed) return;
        if (this.waitTimer) {
            clearTimeout(this.waitTimer);
            this.waitTimer = null;
        }

        const checkChat = () => {
            // The chat is already found and still in the document: nothing to do
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
                    // Observe the wrapper rather than the <ul> inside it: Twitch may recreate the
                    // list and the observer would stay on a detached element
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

    // Cleanup on SPA navigation between Twitch pages
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

        this.stopTopPanels();

        this.removeDualContainer(document.getElementById('twitch-dual-chat-container'));
        this.resetChatState();
    }

    // Stop for good: the extension was updated or removed. Only our own container
    // is removed: a new copy of the script may have created its own already
    destroy() {
        this.destroyed = true;
        clearTimeout(this.collapseTimer);
        this.closeProxyMenu(false);
        if (this.observer) this.observer.disconnect();
        this.observer = null;
        [this.waitTimer, this.processTimer, this.reloadTimer].forEach(t => t && clearTimeout(t));
        this.waitTimer = this.processTimer = this.reloadTimer = null;
        clearInterval(this.popoutCheckTimer);
        if (this.inputResizeObserver) this.inputResizeObserver.disconnect();
        this.inputResizeObserver = null;
        this.stopTopPanels();

        if (this.dualContainer && this.dualContainer.isConnected) {
            this.removeDualContainer(this.dualContainer);
        }
        this.resetChatState();
    }

    resetChatState() {
        this.stopBackgroundWatch();
        this.closeExportMenu();
        this.closeQuickMenu();
        if (this.quickButton) this.quickButton.remove();
        this.quickButton = null;
        this.quickTarget = null;
        if (this.sendStatusHandler) this.sendStatusHandler();
        this.sendStatusHandler = null;
        clearTimeout(this.sendTimer);
        this.flushStats();
        this.resetHistory();
        clearTimeout(this.collapseTimer);
        this.collapseTimer = null;
        this.lastMatchAt = 0;
        this.chatContainer = null;
        this.dualContainer = null;
        this.customChatContainer = null;
        this.originalChatContainer = null;
        this.messagesContainer = null;
        this.resetProcessed();
        this.filteredMessages = [];
    }

    // Remove our container and put the original chat back
    removeDualContainer(dualContainer) {
        if (!dualContainer) return;

        const originalWrapper = dualContainer.querySelector('.twitch-original-content > *');
        if (originalWrapper && dualContainer.parentNode) {
            dualContainer.parentNode.insertBefore(originalWrapper, dualContainer);
        }
        dualContainer.remove();
    }

    // All UI texts in one place: called when the chat is created and when the
    // language, filter settings or list change
    updateInterfaceTexts() {
        if (!this.dualContainer) return;

        const t = this.t;
        const filteredHidden = this.dualContainer.classList.contains('filtered-hidden');
        const originalHidden = this.dualContainer.classList.contains('original-hidden');

        this.customChatContainer.querySelector('.twitch-chat-title-text').textContent = t.filteredChat;
        // Label: name of the active preset or "Filter off"
        const stateLabel = this.customChatContainer.querySelector('.twitch-filter-mode');
        stateLabel.textContent = this.isFilterEnabled ? this.presetName : t.filterOff;
        stateLabel.dataset.state = this.isFilterEnabled ? 'on' : 'off';
        this.originalChatContainer.querySelector('.twitch-chat-title-text').textContent = t.originalChat;

        this.setButtonLabel(this.customChatContainer.querySelector('.twitch-popout-filtered'), t.openPopout);
        this.setButtonLabel(this.customChatContainer.querySelector('.twitch-export-filtered'), t.exportChat);
        this.setButtonLabel(this.originalChatContainer.querySelector('.twitch-popout-original'), t.openOriginalPopout);
        this.setToggleState(this.customChatContainer.querySelector('.twitch-toggle-filtered'), filteredHidden);
        this.setToggleState(this.originalChatContainer.querySelector('.twitch-toggle-original'), originalHidden);

        this.dualContainer.querySelector('#twitch-chat-resizer').title = t.resize;

        const emptyText = this.getEmptyText();
        this.messagesContainer.dataset.empty = emptyText;
        const popoutList = this.getPopoutList();
        if (popoutList) {
            popoutList.dataset.empty = emptyText;
            this.popoutWindow.document.title = t.filteredChat;
        }

        // Usernames blurred for screen capture: in the filtered chat and its window
        const hideNames = Boolean(this.state && this.state.hideNames);
        this.dualContainer.classList.toggle('twitch-filter-hide-names', hideNames);
        if (popoutList) popoutList.classList.toggle('twitch-filter-hide-names', hideNames);

        // Date separators are in the current language
        [this.messagesContainer, popoutList].forEach(list => {
            list?.querySelectorAll('.twitch-filter-date').forEach(el => {
                el.textContent = this.formatDay(Number(el.dataset.time));
            });
        });

        this.updateMessageCount();
        this.updateCollapse();
    }

    // Hint in the empty filtered chat
    getEmptyText() {
        const t = this.t;
        if (!this.isFilterEnabled) return t.emptyAll;
        return this.includeRules.length ? t.emptyFiltered : t.emptyNoRules;
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
            // Left over from a previous run (e.g. the extension was reloaded): its
            // handlers no longer work
            this.removeDualContainer(existing);
        }

        // Find the original chat
        const originalChatWrapper = document.querySelector('.video-chat__message-list-wrapper') ||
            document.querySelector('[data-a-target="chat-scroller"]')?.closest('.chat-shell, .chat-room');

        if (!originalChatWrapper) return;

        // Remember where the original chat was before moving it
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
                        <button type="button" class="twitch-chat-btn twitch-export-filtered" aria-haspopup="menu">${ICONS.download}</button>
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

        // height: 100% ignores the other items of the column (the "STREAM CHAT" header
        // etc.), so the container would overflow the bottom of the screen together
        // with the input buttons. In a flex column take the remaining space via flex,
        // as chat-room itself did
        if (window.getComputedStyle(chatParent).display.includes('flex')) {
            dualChatContainer.style.height = 'auto';
            dualChatContainer.style.flex = '1 1 0%';
        } else {
            // Not flex: subtract the height of the other column items from 100%
            const siblingsHeight = Array.from(chatParent.children)
                .filter(el => el !== originalChatWrapper)
                .reduce((sum, el) => sum + el.offsetHeight, 0);
            if (siblingsHeight > 0) {
                dualChatContainer.style.height = `calc(100% - ${siblingsHeight}px)`;
            }
        }

        // Move the original chat into our container and put the container in its place
        const originalContent = this.originalChatContainer.querySelector('.twitch-original-content');
        originalContent.appendChild(originalChatWrapper);
        chatParent.insertBefore(dualChatContainer, nextSibling);

        this.updateInterfaceTexts();
        this.applySplitRatio();

        this.setupToggleButtons();
        this.setupResizer(dualChatContainer.querySelector('#twitch-chat-resizer'));
        this.setupPopoutButtons();
        this.setupExportButton();
        this.setupCollapse();
        this.setupQuickAdd(originalContent);
        this.setupSendStatus(originalContent);
        this.setupBackgroundWatch();
        this.setupMessageInteractions(this.messagesContainer);
        this.setupInputWatcher(originalContent);
        this.setupTopPanels(originalContent);
        this.loadHistory();
    }

    // Twitch top panels (leaderboard, pinned message, hype train, polls) are shown
    // above the filtered chat and stay available even when the original chat is
    // hidden. They cannot be moved elsewhere in the DOM (React breaks), so they
    // are pinned (position: fixed) to the top of our container and the filtered
    // chat is pushed down by their height
    setupTopPanels(originalContent) {
        const schedule = () => {
            if (this.topPanelsFrame) return;
            this.topPanelsFrame = requestAnimationFrame(() => {
                this.topPanelsFrame = null;
                this.layoutTopPanels(originalContent);
            });
        };

        // Panels can be at any depth. Mutations inside the message list (every new
        // message) are skipped
        this.topPanelsMutation = new MutationObserver(mutations => {
            if (mutations.some(m => !m.target.closest?.('[role="log"], .chat-scrollable-area__message-container'))) {
                schedule();
            }
        });
        this.topPanelsMutation.observe(originalContent, { childList: true, subtree: true });

        // Size of the panels and the container, the window, page scrolling
        this.topPanelsResize = new ResizeObserver(schedule);
        this.topPanelsResize.observe(this.dualContainer);
        this.topPanelsWindowHandler = schedule;
        window.addEventListener('resize', schedule);
        window.addEventListener('scroll', schedule, { capture: true, passive: true });

        schedule();
    }

    // Panels above the message list:
    // 1) children of .chat-room__content before the message list: the Twitch top
    //    area (leaderboard, slot for pinned messages and Drops). Found by position:
    //    wrapper classes are hashed, and the leaderboard in ticker mode has no
    //    recognizable class at all;
    // 2) pinned messages and hype train rendered deeper by Twitch: found by the
    //    classes of their inner elements, going up to the outermost wrapper that
    //    does not contain the chat yet
    findTopPanels(originalContent) {
        // The chat itself: message list, input, messages, viewer card
        const chatParts = '[role="log"], [data-a-target="chat-scroller"], ' +
            '.chat-scrollable-area__message-container, .chat-input, .chat-room__viewer-card, ' +
            '.chat-line__message, [data-a-target="chat-line-message"]';
        const panels = new Set();

        const content = originalContent.querySelector('.chat-room__content');
        if (content) {
            for (const child of content.children) {
                if (child.matches(`[class*="chat-list"], ${chatParts}`) || child.querySelector(chatParts)) break;
                if (!child.matches('.chat-room__notifications')) panels.add(child);
            }
        }

        const selector = [
            '[class*="channel-leaderboard"]',
            '[class*="community-highlight"]',
            '[data-test-selector*="community-highlight"]',
            '[class*="pinned-chat" i]',
            '[class*="hype-train"]'
        ].join(', ');
        originalContent.querySelectorAll(selector).forEach(match => {
            if (match.closest(chatParts)) return;

            let panel = match;
            while (panel.parentElement && panel.parentElement !== originalContent &&
                !panel.parentElement.querySelector(chatParts)) {
                panel = panel.parentElement;
            }
            if (!panel.querySelector(chatParts)) panels.add(panel);
        });

        // Twitch notifications (subscription, tips): the queue above the input. In a
        // small original chat they would cover the messages
        originalContent.querySelectorAll('[data-test-selector="chat-private-callout-queue__callout-container"]')
            .forEach(callout => panels.add(callout));

        return [...panels];
    }

    // Height of a block including absolutely positioned content: the pinned
    // message slot has zero height itself, while the card inside is absolute
    measurePanel(panel) {
        const box = panel.getBoundingClientRect();
        let bottom = box.bottom;
        panel.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width && rect.height && rect.bottom > bottom) bottom = rect.bottom;
        });
        return bottom - box.top;
    }

    layoutTopPanels(originalContent) {
        if (!this.dualContainer || !this.dualContainer.isConnected) return;

        const panels = this.findTopPanels(originalContent);

        // Panels that disappeared
        this.topPanels.forEach(panel => {
            if (!panels.includes(panel)) this.releaseTopPanel(panel);
        });

        const box = this.dualContainer.getBoundingClientRect();
        let offset = 0;

        panels.forEach(panel => {
            const lifted = this.topPanels.has(panel);

            // Guard against a misdetected panel: a block that is too tall is not a panel,
            // and all panels together take at most half of the column. Otherwise the
            // filtered chat would be pushed off screen. While the block is not pinned yet,
            // this is its normal height in the original chat
            const naturalHeight = this.measurePanel(panel);
            if (naturalHeight > box.height / 3 || offset + naturalHeight > box.height / 2) {
                if (lifted) this.releaseTopPanel(panel);
                return;
            }
            // Leave an empty block alone (e.g. the pinned slot with nothing pinned): the
            // layout is recalculated when something appears in it
            if (!lifted && naturalHeight === 0) return;

            if (!lifted) {
                this.topPanels.add(panel);
                panel.classList.add('twitch-filter-top-panel');
                panel.style.top = '0px';
                panel.style.left = '0px';
                this.topPanelsResize.observe(panel);
            }
            setStyle(panel, 'width', `${box.width}px`);

            // position: fixed is relative to the window, but to an ancestor with a
            // transform if there is one, so compare the actual position and shift by the
            // difference
            const rect = panel.getBoundingClientRect();
            const top = parseFloat(panel.style.top) + (box.top + offset - rect.top);
            const left = parseFloat(panel.style.left) + (box.left - rect.left);
            setStyle(panel, 'top', `${Math.round(top)}px`);
            setStyle(panel, 'left', `${Math.round(left)}px`);

            offset += this.measurePanel(panel);
        });

        setStyle(this.customChatContainer, 'marginTop', offset ? `${Math.round(offset) + 4}px` : '');

        // Write only on change: fewer needless repaints
        function setStyle(el, prop, value) {
            if (el.style[prop] !== value) el.style[prop] = value;
        }
    }

    releaseTopPanel(panel) {
        this.topPanels.delete(panel);
        panel.classList.remove('twitch-filter-top-panel');
        ['top', 'left', 'width'].forEach(prop => {
            panel.style[prop] = '';
        });
        if (this.topPanelsResize) this.topPanelsResize.unobserve(panel);
    }

    // Restore the panels (on navigation and when the chat is recreated)
    stopTopPanels() {
        if (this.topPanelsFrame) cancelAnimationFrame(this.topPanelsFrame);
        this.topPanelsFrame = null;
        if (this.topPanelsMutation) this.topPanelsMutation.disconnect();
        if (this.topPanelsResize) this.topPanelsResize.disconnect();
        if (this.topPanelsWindowHandler) {
            window.removeEventListener('resize', this.topPanelsWindowHandler);
            window.removeEventListener('scroll', this.topPanelsWindowHandler, { capture: true });
        }
        this.topPanels.forEach(panel => this.releaseTopPanel(panel));
        this.topPanelsMutation = null;
        this.topPanelsResize = null;
        this.topPanelsWindowHandler = null;
    }

    // The input changes height (multi-line text, emote panel, badge carousel):
    // recalculate the minimum height of the original chat so the input buttons
    // never leave the screen
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

            // The input may be rendered later
            if (++attempts < 15 && originalContent.isConnected) {
                setTimeout(tryObserve, 2000);
            }
        };

        tryObserve();
    }

    // Chat proportions are set via flex-grow; when one chat is hidden, CSS rules
    // with !important override the inline styles
    applySplitRatio() {
        if (!this.customChatContainer || !this.originalChatContainer) return;

        this.customChatContainer.style.flex = `${this.splitRatio} 1 0%`;
        this.originalChatContainer.style.flex = `${1 - this.splitRatio} 1 0%`;

        // The original chat cannot be shorter than its header + input: the message
        // input must always stay visible
        this.originalChatContainer.style.minHeight = `${this.getMinOriginalHeight()}px`;
    }

    getMinOriginalHeight() {
        const header = this.originalChatContainer.querySelector('.twitch-original-header');
        const input = this.originalChatContainer.querySelector('.chat-input');
        const headerHeight = header ? header.offsetHeight : 30;
        const inputHeight = input ? input.offsetHeight : 0;

        // + minimum height of the message list
        return headerHeight + inputHeight + 60;
    }

    saveSplitRatio() {
        chrome.storage.local.set({ chatSplitRatio: this.splitRatio }).catch(() => { });
    }

    // Dragging the divider changes the chat proportions, double click resets to
    // 50/50
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

            // Pointer capture: movement is tracked even when the cursor leaves the divider
            // (and works on touch screens)
            resizer.setPointerCapture(e.pointerId);
            this.dualContainer.classList.add('resizing');
            resizer.addEventListener('pointermove', onMove);
            resizer.addEventListener('pointerup', onUp);
            resizer.addEventListener('pointercancel', onUp);
        });
    }

    // Hiding uses a CSS class on the container: the original chat hides only its
    // message list (the input stays), and the styles survive Twitch re-renders
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

        // The original chat uses the native Twitch popout; it is unavailable on pages
        // without a channel (e.g. VOD)
        const originalBtn = this.originalChatContainer.querySelector('.twitch-popout-original');
        const channel = FilterStore.channelFromUrl(location.href);
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

    // Extension styles for the separate window (styles.css from content_scripts is
    // not injected there). Loaded once
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

    // Filtered chat in a separate window: render our own document and copy every
    // new message there
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

        // Relative URLs in the Twitch styles (fonts etc.)
        const base = doc.createElement('base');
        base.href = location.origin;
        doc.head.appendChild(base);

        // The Twitch theme (CSS color variables) is set by classes
        doc.documentElement.className = document.documentElement.className;
        this.syncPopoutStyles();

        // Our own styles go last to override the Twitch styles
        const style = doc.createElement('style');
        doc.head.appendChild(style);
        this.getExtensionCss().then(css => {
            style.textContent = css;
        });

        doc.body.className = 'twitch-filter-popout';
        const list = doc.createElement('div');
        const themeRoot = this.chatContainer?.closest('[class*="tw-root--theme"]');
        list.className = `twitch-filter-messages ${themeRoot ? themeRoot.className : ''}`;
        list.classList.toggle('twitch-filter-hide-names', Boolean(this.state && this.state.hideNames));
        doc.body.appendChild(list);
        this.setupMessageInteractions(list);
        this.updateInterfaceTexts();

        // Copy the messages collected so far
        this.filteredMessages.forEach(msg => this.appendMessageToPopout(msg));
        list.scrollTop = list.scrollHeight;

        // Watch for the window being closed; Twitch adds styles as new elements
        // appear, so send them to the window too
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

    // Copy the Twitch page styles into the separate window. Styled-components add
    // rules through the CSSOM, so <style> contents are empty; take the rules from
    // cssRules
    syncPopoutStyles() {
        const win = this.popoutWindow;
        if (!win || win.closed) return;

        const sheets = Array.from(document.styleSheets);
        let rulesCount = sheets.length;
        sheets.forEach(sheet => {
            try {
                rulesCount += sheet.cssRules.length;
            } catch (error) {
                // Cross-origin sheet: rules are not accessible
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

        // Page styles first so the window's own styles override them
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

        // Twitch may reuse existing <li> elements instead of adding new ones, changing
        // their content (VOD chat on seeking and list shifts), so react to any change
        // inside the chat. Repeats are dropped in processMessage by the message
        // signature
        this.observer = new MutationObserver(() => {
            if (!this.processTimer) {
                // One deferred pass instead of a timer per mutation
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

        // Rebuild the popout window as well
        const popoutList = this.getPopoutList();
        if (popoutList) popoutList.textContent = '';

        // Saved history of the channel (filtered by the current rules), then the
        // messages that are in the chat now. Messages already in the chat are not
        // counted or notified about again
        this.rebuilding = true;
        this.history.forEach(entry => {
            if (this.shouldShowMessage(entry.login, entry.badges, entry.text)) {
                this.lastMatchAt = Math.max(this.lastMatchAt, entry.receivedAt);
                this.showMessage(this.messageFromEntry(entry));
            }
        });

        this.findAllMessages().forEach((message) => {
            this.processMessage(message);
        });
        this.rebuilding = false;

        this.updateMessageCount();
        this.updateCollapse();
        this.scrollToBottom(true);
    }

    processNewMessages() {
        this.findAllMessages().forEach((message) => {
            this.processMessage(message);
        });

        this.updateMessageCount();
        this.updateCollapse();
    }

    processMessage(messageElement) {
        const username = this.extractUsername(messageElement);
        const messageText = this.extractMessageText(messageElement);

        // The message is not fully rendered yet: come back to it on the next mutation
        // without marking it as processed
        if (!username || !messageText) return;

        // Compare by login (data-a-user): it is always lowercase Latin, unlike the
        // display name
        const login = this.extractLogin(messageElement) || username;

        // Deduplicate by the element content rather than the element itself: Twitch
        // may reuse an <li> for a new message
        const vodTime = this.extractVodTimestamp(messageElement);
        const signature = `${vodTime || ''}|${login}|${messageText}`;
        if (this.processedElements.get(messageElement) === signature) {
            return;
        }
        this.processedElements.set(messageElement, signature);

        // Arrival time: keep the previous one when processing again (settings change)
        const known = this.messageTimes.get(messageElement);
        // A message that just arrived (not a rebuild of the chat after a settings
        // change): only these are counted and notified about
        const isFresh = !(known && known.signature === signature) && !this.rebuilding;
        const receivedAt = known && known.signature === signature ? known.time : Date.now();
        this.messageTimes.set(messageElement, { signature, time: receivedAt });

        // In a VOD a message has its time in the video: use it to drop messages that
        // just moved to a neighboring element
        if (vodTime) {
            if (this.seenVodMessages.has(signature)) return;
            this.seenVodMessages.add(signature);
            if (this.seenVodMessages.size > 2000) {
                this.seenVodMessages.delete(this.seenVodMessages.values().next().value);
            }
        }

        // Already in the saved history: shown from there (see processExistingMessages)
        const key = `${receivedAt}|${signature}`;
        if (this.historyKeys.has(key)) return;

        // Twitch showed a saved message again after a page reload
        if (!vodTime && this.repeatedElements.get(messageElement) === signature) return;
        if (!vodTime && Date.now() < this.recentUntil && this.recentSignatures.delete(signature)) {
            this.repeatedElements.set(messageElement, signature);
            return;
        }

        const badges = this.getBadges(messageElement);
        const result = this.evaluateMessage(login, badges, messageText);
        // Your message reached the chat (see setupSendStatus)
        if (result.own && isFresh && !vodTime) this.confirmSent();
        // Counters and notifications: new live chat messages only
        if (isFresh && !vodTime) this.countMatches(result.matched);
        if (!result.show) return;

        const messageData = {
            // Time in the video (VOD), used to seek on click
            timestamp: vodTime,
            receivedAt: receivedAt,
            hasOwnTimestamp: Boolean(vodTime),
            // Copy of the original message with all badges, emotes, name color etc.
            node: this.createMessageClone(messageElement),
            original: messageElement,
            signature: signature,
            login: login,
            name: username,
            text: messageText
        };

        // Live chat only: a VOD replays its chat by itself
        if (!vodTime) this.saveToHistory(messageData, badges, key);

        this.lastMatchAt = Math.max(this.lastMatchAt, receivedAt);
        this.showMessage(messageData);

        if (isFresh && !vodTime) {
            const notifyRule = this.notifyRuleFor(result);
            this.debug('message', login, notifyRule ? `notify (${notifyRule.type} ${notifyRule.value})` : 'no notification');
            if (notifyRule) this.notify(messageData, notifyRule);
        }
    }

    showMessage(messageData) {
        this.filteredMessages.push(messageData);
        if (this.filteredMessages.length > this.maxDisplayedMessages) {
            this.filteredMessages.shift();
        }

        this.appendMessageToChat(messageData);
        this.appendMessageToPopout(messageData);
    }

    // --- Rule counters ------------------------------------------------------------
    // How many new messages each rule matched and when it last did: shown in the
    // extension menu. Written to chrome.storage.local in batches

    countMatches(rules) {
        if (!rules.length) return;
        const now = Date.now();
        rules.forEach(rule => {
            const delta = this.statsDelta.get(rule.id) || { count: 0, last: 0 };
            delta.count++;
            delta.last = now;
            this.statsDelta.set(rule.id, delta);
        });
        if (!this.statsTimer) {
            this.statsTimer = setTimeout(() => this.flushStats(), 5000);
        }
    }

    async flushStats() {
        clearTimeout(this.statsTimer);
        this.statsTimer = null;
        if (!this.statsDelta.size) return;

        const delta = this.statsDelta;
        this.statsDelta = new Map();
        try {
            const { ruleStats = {} } = await chrome.storage.local.get('ruleStats');
            delta.forEach((value, id) => {
                const current = ruleStats[id] || { count: 0, last: 0 };
                ruleStats[id] = { count: current.count + value.count, last: Math.max(current.last, value.last) };
            });
            await chrome.storage.local.set({ ruleStats });
        } catch (error) {
            // The extension context is invalidated
        }
    }

    // --- Notifications -------------------------------------------------------------
    // A rule marked "notify" showed a new message: a short sound and, when the
    // Twitch tab is not in front, a desktop notification (background.js)

    // Which rule a new message is notified for (null: no notification): any
    // rule that showed it, or only rules marked "notify" (notifyScope)
    notifyRuleFor(result) {
        if (!this.notificationsOn() || !result.show || result.own) return null;
        if (this.state.notifyScope === 'rules') return result.included.find(rule => rule.notify) || null;
        return result.included[0] || null;
    }

    // Notifications are possible at all: on in the settings, and the filter is on
    // (with the filter off every message is shown, that would be every message)
    notificationsOn() {
        return Boolean(this.state && this.isFilterEnabled && (this.state.notifyDesktop || this.state.notifySound));
    }

    // Diagnostics: with localStorage.twitchChatFilterDebug = '1' on twitch.tv
    // the decisions about notifications are written to the console
    debug(...args) {
        try {
            if (localStorage.getItem('twitchChatFilterDebug') !== '1') return;
        } catch (error) {
            return;
        }
        console.log('[Chat Filter]', ...args);
    }

    notifyKey(login, text) {
        return `${String(login).toLowerCase()}|${String(text).replace(/\s+/g, ' ').trim().toLowerCase()}`;
    }

    notify(msgData, rule) {
        const now = Date.now();

        // Once per message, whichever way it came first
        const key = this.notifyKey(msgData.login, msgData.text);
        if (this.notifiedKeys.has(key)) {
            this.debug('notify: already notified', key);
            return;
        }
        this.notifiedKeys.set(key, now);
        this.notifiedKeys.forEach((time, k) => {
            if (now - time > 10 * 60 * 1000) this.notifiedKeys.delete(k);
        });

        if (now - this.lastNotifyAt < NOTIFY_INTERVAL) {
            this.debug('notify: skipped, too soon after the previous one');
            return;
        }
        this.lastNotifyAt = now;

        if (this.state.notifySound) this.playSound();

        const background = document.hidden || !document.hasFocus();
        this.debug('notify:', msgData.login, { desktop: this.state.notifyDesktop, background, sound: this.state.notifySound });
        if (this.state.notifyDesktop && background) {
            try {
                chrome.runtime.sendMessage({
                    type: 'notify',
                    title: `${msgData.name || msgData.login} · ${this.channel || 'Twitch'}`,
                    message: msgData.text.slice(0, 200),
                    note: rule.note || ''
                }).then(response => this.debug('notify: result', response), error => this.debug('notify: error', String(error)));
            } catch (error) {
                this.debug('notify: extension context lost', String(error));
            }
        }
    }

    // Two short tones; no sound file needed. The browser may keep the sound
    // muted until the page was clicked once
    playSound() {
        try {
            if (!this.audioContext) this.audioContext = new AudioContext();
            const ctx = this.audioContext;
            if (ctx.state === 'suspended') ctx.resume().catch(() => { });
            [[880, 0], [1320, 0.12]].forEach(([frequency, delay]) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = ctx.currentTime + delay;
                osc.frequency.value = frequency;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.15, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.2);
            });
        } catch (error) {
            // Web Audio is unavailable
        }
    }

    // --- Chat while the tab is hidden ---------------------------------------------------
    // Twitch draws new messages only while the page is visible. For rules with
    // notifications, a hidden tab connects to the Twitch chat server as an
    // anonymous guest (read-only, like a logged-out viewer) and checks the same
    // rules there. Nothing is sent except the channel name; the connection is
    // closed as soon as the tab is visible again

    setupBackgroundWatch() {
        if (this.visibilityHandler) return;
        this.visibilityHandler = () => this.updateBackgroundWatch();
        document.addEventListener('visibilitychange', this.visibilityHandler);
        this.updateBackgroundWatch();
    }

    stopBackgroundWatch() {
        if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler);
        this.visibilityHandler = null;
        this.closeIrc();
    }

    // Needed: the tab is hidden, a live channel page, notifications are on and
    // some enabled "show" rule can notify
    needsBackgroundWatch() {
        return Boolean(document.hidden && !this.destroyed && this.channel && this.notificationsOn() &&
            !/^\/videos\//i.test(location.pathname) &&
            this.includeRules.some(rule => this.state.notifyScope !== 'rules' || rule.notify));
    }

    updateBackgroundWatch() {
        const needed = this.needsBackgroundWatch();
        if (needed !== Boolean(this.irc)) {
            this.debug('chat server connection', needed ? 'on' : 'off', { hidden: document.hidden, channel: this.channel });
        }
        if (needed) {
            if (!this.irc || this.ircChannel !== this.channel) this.openIrc();
        } else {
            this.closeIrc();
        }
    }

    openIrc() {
        this.closeIrc();
        const channel = this.channel;
        let socket;
        try {
            socket = new WebSocket(TWITCH_IRC_URL);
        } catch (error) {
            return;
        }
        this.irc = socket;
        this.ircChannel = channel;

        socket.addEventListener('open', () => {
            this.ircAttempts = 0;
            socket.send('CAP REQ :twitch.tv/tags');
            socket.send(`NICK justinfan${Math.floor(10000 + Math.random() * 89999)}`);
            socket.send(`JOIN #${channel}`);
        });
        socket.addEventListener('message', (e) => {
            String(e.data).split('\r\n').forEach(line => {
                if (line) this.handleIrcLine(socket, line);
            });
        });
        socket.addEventListener('close', () => {
            if (this.irc !== socket) return;
            this.irc = null;
            // Connection lost while still needed: try again, waiting longer each time
            if (this.needsBackgroundWatch()) {
                const delay = Math.min(60000, 2000 * 2 ** this.ircAttempts++);
                this.ircRetry = setTimeout(() => this.updateBackgroundWatch(), delay);
            }
        });
    }

    closeIrc() {
        clearTimeout(this.ircRetry);
        this.ircRetry = null;
        const socket = this.irc;
        this.irc = null;
        this.ircChannel = null;
        if (socket) {
            try {
                socket.close();
            } catch (error) {
                // Already closed
            }
        }
    }

    // One IRC line: "@tags :login!login@login.tmi.twitch.tv PRIVMSG #channel :text"
    handleIrcLine(socket, line) {
        if (line.startsWith('PING')) {
            socket.send(line.replace('PING', 'PONG'));
            return;
        }

        const match = line.match(/^(?:@(\S+) )?:([^!\s]+)![^\s]* PRIVMSG #\S+ :(.*)$/);
        if (!match) return;
        const tags = {};
        (match[1] || '').split(';').forEach(pair => {
            const index = pair.indexOf('=');
            if (index > 0) tags[pair.slice(0, index)] = pair.slice(index + 1);
        });
        const login = match[2].toLowerCase();
        // /me messages come as "\u0001ACTION text\u0001"
        const text = match[3].replace(/^\u0001ACTION (.*)\u0001$/, '$1');
        const name = (tags['display-name'] || '').replace(/\\s/g, ' ') || login;
        this.handleBackgroundMessage(login, name, text, this.badgesFromTags(tags.badges));
    }

    // "moderator/1,subscriber/12" -> badges like on the page. Only the badge set
    // names are known here, which is what role rules check by name
    badgesFromTags(value) {
        return String(value || '').split(',').filter(Boolean).map(badge => ({
            src: '',
            name: badge.split('/')[0].replace(/[-_]/g, ' ')
        }));
    }

    handleBackgroundMessage(login, name, text, badges) {
        const rule = this.notifyRuleFor(this.evaluateMessage(login, badges, text));
        this.debug('chat server message', login, rule ? `notify (${rule.type} ${rule.value})` : 'no notification');
        if (rule) this.notify({ login, name, text }, rule);
    }

    // --- Quick add from the chat -----------------------------------------------------
    // A button over the hovered message (in the original and the filtered chat)
    // opens a menu: show / hide messages of this user. The button lives in our own
    // layer and is positioned over the message: Twitch messages are rendered by
    // React and must not get foreign elements

    setupQuickAdd(originalContent) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'twitch-filter-quick';
        button.innerHTML = ICONS.filter;
        button.hidden = true;
        document.body.appendChild(button);
        this.quickButton = button;

        const show = (target, login, name) => {
            clearTimeout(this.quickHideTimer);
            if (this.quickMenu) return;
            const same = this.quickTarget && this.quickTarget.element === target && !button.hidden;
            this.quickTarget = { element: target, login, name };
            button.hidden = false;
            if (!same) this.setButtonLabel(button, this.t.quickAddFor(name));
            // Twitch draws its hover actions a moment later: place again on the next
            // frame
            this.placeQuickButton(target);
            requestAnimationFrame(() => {
                if (this.quickTarget && this.quickTarget.element === target) this.placeQuickButton(target);
            });
        };
        const scheduleHide = () => {
            clearTimeout(this.quickHideTimer);
            this.quickHideTimer = setTimeout(() => {
                if (!this.quickMenu) button.hidden = true;
            }, 250);
        };

        originalContent.addEventListener('mouseover', (e) => {
            const root = e.target.closest?.('.chat-line__message, [data-a-target="chat-line-message"], .vod-message');
            if (!root || !originalContent.contains(root)) return;
            const login = this.extractLogin(root);
            if (login) show(root, login.toLowerCase(), this.extractUsername(root) || login);
        });
        originalContent.addEventListener('mouseleave', scheduleHide);
        originalContent.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget || !e.relatedTarget.closest?.('.chat-line__message, [data-a-target="chat-line-message"], .vod-message')) {
                scheduleHide();
            }
        });

        this.messagesContainer.addEventListener('mouseover', (e) => {
            const wrapper = e.target.closest?.('.twitch-filter-message');
            const msgData = wrapper && this.renderedMessages.get(wrapper);
            if (msgData && msgData.login) show(wrapper, msgData.login.toLowerCase(), msgData.name || msgData.login);
        });
        this.messagesContainer.addEventListener('mouseleave', scheduleHide);

        button.addEventListener('mouseenter', () => clearTimeout(this.quickHideTimer));
        button.addEventListener('mouseleave', scheduleHide);
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.quickMenu) {
                this.closeQuickMenu();
            } else if (this.quickTarget) {
                this.showQuickMenu(this.quickTarget);
            }
        });
        // Scrolling moves the messages away from the button
        document.addEventListener('scroll', () => {
            if (!this.quickMenu) button.hidden = true;
        }, { capture: true, passive: true });
    }

    // Twitch's own action buttons of a message ("⋮", reply), if they are drawn:
    // the right-most visible button outside the message text
    findMessageActions(target) {
        const buttons = Array.from(target.querySelectorAll(
            '.video-chat__message-menu button, [class*="message-menu"] button, .chat-line__icons button, ' +
            '[data-test-selector*="message-actions"] button, button[aria-label*="Message Actions" i]'
        )).filter(el => !el.closest('[data-a-target="chat-line-message-body"], .video-chat__message'));
        let best = null;
        let bestRect = null;
        buttons.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            if (!bestRect || rect.left < bestRect.left) {
                best = el;
                bestRect = rect;
            }
        });
        return best ? bestRect : null;
    }

    // The button goes to the left of Twitch's own actions ("⋮"), at the same
    // height, as one more action of the message. Without them: at the right edge,
    // on the line with the username, which is what the button is about
    placeQuickButton(target) {
        const button = this.quickButton;
        const size = 24;
        const rootRect = target.getBoundingClientRect();
        let top;
        let left;

        const actions = this.findMessageActions(target);
        if (actions) {
            top = actions.top + (actions.height - size) / 2;
            left = actions.left - size - 4;
        } else {
            const name = target.querySelector('[data-a-target="chat-message-username"], .chat-author__display-name');
            const nameRect = name && name.getBoundingClientRect();
            const line = nameRect && nameRect.height ? nameRect : { top: rootRect.top, height: Math.min(rootRect.height, 24) };
            top = line.top + (line.height - size) / 2;
            left = rootRect.right - size - 6;
        }

        // Within the message and the window
        left = Math.max(rootRect.left, Math.min(left, window.innerWidth - size - 4));
        top = Math.max(rootRect.top, top);
        button.style.top = `${Math.round(top)}px`;
        button.style.left = `${Math.round(left)}px`;
    }

    // The plain user rule of this login in the preset used here (without extra
    // conditions)
    findUserRule(preset, login) {
        return preset.rules.find(rule => rule.type === 'user' && rule.value === login && !rule.conditions.length);
    }

    showQuickMenu(target) {
        this.closeQuickMenu();
        const t = this.t;
        const preset = this.state.presets.find(p => p.id === this.presetId);
        if (!preset) return;
        const existing = this.findUserRule(preset, target.login);

        const menu = document.createElement('div');
        menu.className = 'twitch-filter-menu';
        menu.setAttribute('role', 'menu');
        const title = document.createElement('div');
        title.className = 'twitch-filter-menu-hint';
        title.textContent = t.quickAddTitle(target.name, preset.name);
        menu.appendChild(title);

        const items = [];
        if (!existing || existing.action !== 'include' || !existing.enabled) {
            items.push([t.quickShow, () => this.setUserRule(target.login, 'include')]);
        }
        if (!existing || existing.action !== 'exclude' || !existing.enabled) {
            items.push([t.quickHide, () => this.setUserRule(target.login, 'exclude')]);
        }
        if (existing) {
            items.push([t.quickRemove, () => this.setUserRule(target.login, null)]);
        }
        items.forEach(([label, action]) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('role', 'menuitem');
            item.textContent = label;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeQuickMenu();
                action();
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        const anchorRect = this.quickButton.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        menu.style.left = `${Math.max(4, Math.min(anchorRect.right - menuRect.width, window.innerWidth - menuRect.width - 4))}px`;
        let top = anchorRect.bottom + 4;
        if (top + menuRect.height > window.innerHeight - 4) top = Math.max(4, anchorRect.top - menuRect.height - 4);
        menu.style.top = `${top}px`;
        menu.querySelector('button')?.focus();

        const onOutside = (e) => {
            if (!menu.contains(e.target) && !this.quickButton.contains(e.target)) this.closeQuickMenu();
        };
        const onKey = (e) => {
            if (e.key === 'Escape') this.closeQuickMenu();
        };
        document.addEventListener('mousedown', onOutside, true);
        document.addEventListener('keydown', onKey, true);
        this.quickMenu = {
            menu,
            cleanup: () => {
                document.removeEventListener('mousedown', onOutside, true);
                document.removeEventListener('keydown', onKey, true);
            }
        };
    }

    closeQuickMenu() {
        if (!this.quickMenu) return;
        this.quickMenu.menu.remove();
        this.quickMenu.cleanup();
        this.quickMenu = null;
        if (this.quickButton) this.quickButton.hidden = true;
    }

    // action: include / exclude, or null to remove the rule. Saved like changes
    // from the extension menu; the filter is rebuilt through storage.onChanged
    async setUserRule(login, action) {
        const state = JSON.parse(JSON.stringify(this.state));
        const preset = state.presets.find(p => p.id === this.presetId);
        if (!preset) return;

        const existing = this.findUserRule(preset, login);
        if (!action) {
            preset.rules = preset.rules.filter(rule => rule !== existing);
        } else if (existing) {
            Object.assign(existing, { action, enabled: true, updated: Date.now() });
        } else {
            const rule = FilterStore.normalizeRule({ type: 'user', value: login, action });
            if (rule) preset.rules.push(rule);
        }

        try {
            await FilterStore.saveAll(state);
        } catch (error) {
            // Storage quota or the extension context is invalidated
        }
    }

    // --- Send status ----------------------------------------------------------------
    // After you send a message the input is outlined: gray while waiting, green
    // when the message appeared in the chat, orange if it did not within
    // SEND_TIMEOUT (slow mode, followers-only, AutoMod...). The class is set on
    // our container, so Twitch elements are not changed

    setupSendStatus(originalContent) {
        const isInput = target => target.closest?.('[data-a-target="chat-input"], .chat-wysiwyg-input__editor, textarea');
        const onKey = (e) => {
            if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
            const input = isInput(e.target);
            if (!input || !originalContent.contains(input)) return;
            if (!(input.value ?? input.textContent).trim()) return;
            this.startSend();
        };
        const onClick = (e) => {
            const send = e.target.closest?.('[data-a-target="chat-send-button"]');
            if (send && originalContent.contains(send)) this.startSend();
        };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('click', onClick, true);
        this.sendStatusHandler = () => {
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('click', onClick, true);
        };
    }

    setSendStatus(status) {
        if (!this.dualContainer) return;
        ['pending', 'sent', 'failed'].forEach(name => {
            this.dualContainer.classList.toggle(`twitch-filter-send-${name}`, status === name);
        });
    }

    startSend() {
        if (!this.state || !this.state.sendStatus) return;
        clearTimeout(this.sendTimer);
        this.setSendStatus('pending');
        this.sendTimer = setTimeout(() => {
            this.setSendStatus('failed');
            this.sendTimer = setTimeout(() => this.setSendStatus(null), 4000);
        }, SEND_TIMEOUT);
    }

    confirmSent() {
        if (!this.dualContainer || !this.dualContainer.classList.contains('twitch-filter-send-pending')) return;
        clearTimeout(this.sendTimer);
        this.setSendStatus('sent');
        this.sendTimer = setTimeout(() => this.setSendStatus(null), 1500);
    }

    // --- History of the filtered chat ------------------------------------------
    // Stored by background.js. Only live chat messages that passed the filter are
    // saved; when the rules change, the saved ones are filtered again

    resetHistory() {
        this.flushHistory();
        this.history = [];
        this.historyKeys = new Set();
        this.historyChannel = null;
        this.historyOriginals = new Map();
        this.recentSignatures = new Set();
        this.repeatedElements = new WeakMap();
    }

    // Load the saved history of the open channel and rebuild the filtered chat
    async loadHistory() {
        const channel = this.channel;
        if (!this.state || !this.state.historyEnabled || !channel || channel === this.historyChannel) return;
        this.historyChannel = channel;

        let response = null;
        try {
            response = await chrome.runtime.sendMessage({
                type: 'history:get', channel, limit: this.maxDisplayedMessages * 2
            });
        } catch (error) {
            // The extension context is invalidated
        }
        if (this.destroyed || this.historyChannel !== channel || !response || !response.ok) return;

        // Messages of this session that are already in memory stay after the
        // loaded ones
        const loaded = response.result.filter(entry => entry && !this.historyKeys.has(entry.key));
        const recentFrom = Date.now() - 10 * 60 * 1000;
        loaded.forEach(entry => {
            this.historyKeys.add(entry.key);
            if (entry.receivedAt > recentFrom) this.recentSignatures.add(entry.signature);
        });
        this.recentUntil = Date.now() + 15 * 1000;
        this.history = [...loaded, ...this.history];
        if (this.messagesContainer) this.applySettings();
    }

    saveToHistory(messageData, badges, key) {
        const channel = this.channel;
        if (!this.state || !this.state.historyEnabled || !channel) return;

        const entry = {
            key,
            channel,
            receivedAt: messageData.receivedAt,
            login: messageData.login,
            name: messageData.name,
            text: messageData.text,
            badges,
            html: messageData.node.outerHTML,
            signature: messageData.signature
        };
        this.history.push(entry);
        this.historyKeys.add(key);
        this.historyOriginals.set(key, messageData.original);
        if (this.history.length > HISTORY_LIMIT) {
            const removed = this.history.shift();
            this.historyKeys.delete(removed.key);
            this.historyOriginals.delete(removed.key);
        }

        // One write for a burst of messages
        this.historyQueue.push(entry);
        if (!this.historyTimer) {
            this.historyTimer = setTimeout(() => this.flushHistory(), 2000);
        }
    }

    flushHistory() {
        clearTimeout(this.historyTimer);
        this.historyTimer = null;
        if (!this.historyQueue.length) return;

        const entries = this.historyQueue;
        this.historyQueue = [];
        try {
            chrome.runtime.sendMessage({ type: 'history:add', entries }).catch(() => { });
        } catch (error) {
            // The extension context is invalidated
        }
    }

    // A saved message as message data: the copy is rebuilt from the saved markup.
    // The original is gone from the chat, so clicks on it are not passed on
    messageFromEntry(entry) {
        return {
            timestamp: null,
            receivedAt: entry.receivedAt,
            hasOwnTimestamp: false,
            node: this.nodeFromHtml(entry.html),
            original: this.historyOriginals.get(entry.key) || null,
            signature: entry.signature,
            login: entry.login,
            name: entry.name,
            text: entry.text
        };
    }

    // The markup is our own copy of a Twitch message; still, only safe content is
    // let through: no scripts, frames, event handlers or script links
    nodeFromHtml(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        template.content.querySelectorAll('script, iframe, object, embed, link, style, meta, form')
            .forEach(el => el.remove());
        template.content.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name.toLowerCase();
                const unsafeUrl = ['href', 'src', 'srcset', 'xlink:href', 'action'].includes(name) &&
                    /^\s*(javascript|vbscript|data):/i.test(attr.value) && !/^\s*data:image\//i.test(attr.value);
                if (name.startsWith('on') || unsafeUrl) el.removeAttribute(attr.name);
            });
        });
        return template.content.firstElementChild || document.createElement('div');
    }

    // Copy of a Twitch message: its look (badges, emotes, stickers, mentions, name
    // color) comes from the Twitch styles
    createMessageClone(messageElement) {
        const clone = messageElement.cloneNode(true);
        clone.classList.add('twitch-filter-clone');

        // Twitch sets some styles through the parent list (font, line height,
        // paddings): outside of it the copy would be taller than the original. Copy
        // the computed values onto the clone
        const computed = window.getComputedStyle(messageElement);
        ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
            'margin', 'padding', 'color'].forEach(prop => {
            clone.style[prop] = computed[prop];
        });
        // An <li> outside a <ul> would get a list marker
        clone.style.display = computed.display === 'list-item' ? 'block' : computed.display;
        clone.style.listStyle = 'none';

        // ids must stay unique in the document
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        return clone;
    }

    // Wrapper with a message copy for the given document (main page or separate
    // window)
    renderMessage(msgData, doc) {
        const messageDiv = doc.createElement('div');
        messageDiv.className = 'twitch-filter-message';

        const clone = doc.importNode(msgData.node, true);

        // Live chat messages have no time: add our own (unless it is turned off or
        // Twitch shows its own). The full date and time are in the tooltip
        const format = this.state ? this.state.timestampFormat : 'short';
        if (format !== 'off' && !msgData.hasOwnTimestamp && !clone.querySelector('.chat-line__timestamp')) {
            const timestampSpan = doc.createElement('span');
            timestampSpan.className = 'twitch-filter-timestamp';
            timestampSpan.textContent = FilterStore.formatTime(msgData.receivedAt, format);
            timestampSpan.title = new Date(msgData.receivedAt).toLocaleString(this.currentLanguage);
            this.insertTimestamp(clone, timestampSpan);
        }

        messageDiv.appendChild(clone);
        this.renderedMessages.set(messageDiv, msgData);
        return messageDiv;
    }

    // The time goes into the message line before the badges and name, like Twitch
    // does with timestamps enabled. If the line is not found, at the start of the
    // copy
    insertTimestamp(clone, timestampSpan) {
        const name = clone.querySelector('.chat-line__username-container, [data-a-target="chat-message-username"]');
        if (!name) {
            clone.prepend(timestampSpan);
            return;
        }

        const badge = clone.querySelector('.chat-badge, [data-a-target="chat-badge"]');
        const first = badge && (badge.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING)
            ? badge
            : name;

        // Common container of the badges and the name; the time goes before its badge
        // block
        let container = first.parentElement;
        while (container !== clone && !container.contains(name)) container = container.parentElement;
        let before = first;
        while (before.parentElement !== container) before = before.parentElement;
        container.insertBefore(timestampSpan, before);
    }

    appendMessageToChat(msgData) {
        if (this.messagesContainer) this.appendRendered(this.messagesContainer, msgData);
    }

    // Append a message to a list (main chat or separate window) and scroll down
    // unless the user is reading history
    appendRendered(list, msgData) {
        const wasNearBottom = this.isNearBottom(list);
        const doc = list.ownerDocument;

        // Separator when the day changes, and before the first message if it is not
        // from today (messages from the history)
        const day = this.dayKey(msgData.receivedAt);
        const last = list.lastElementChild;
        const lastDay = last ? last.dataset.day : this.dayKey(Date.now());
        if (day !== lastDay) {
            const separator = doc.createElement('div');
            separator.className = 'twitch-filter-date';
            separator.dataset.day = day;
            separator.dataset.time = String(msgData.receivedAt);
            separator.textContent = this.formatDay(msgData.receivedAt);
            list.appendChild(separator);
        }

        const messageDiv = this.renderMessage(msgData, doc);
        messageDiv.dataset.day = day;
        list.appendChild(messageDiv);

        // Limit the number of DOM elements (separators are not counted); a separator
        // left at the top without its messages goes too
        let extra = list.querySelectorAll(':scope > .twitch-filter-message').length - this.maxDisplayedMessages;
        while (extra > 0 && list.firstElementChild) {
            if (list.firstElementChild.classList.contains('twitch-filter-message')) extra--;
            list.firstElementChild.remove();
        }
        while (list.firstElementChild && list.firstElementChild.classList.contains('twitch-filter-date') &&
            list.firstElementChild.nextElementSibling?.dataset.day !== list.firstElementChild.dataset.day) {
            list.firstElementChild.remove();
        }

        if (wasNearBottom) {
            list.scrollTop = list.scrollHeight;
        }
    }

    dayKey(time) {
        const date = new Date(time);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    // "Today", "Yesterday" or the date
    formatDay(time) {
        const now = new Date();
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const key = this.dayKey(time);
        if (key === this.dayKey(now)) return this.t.today;
        if (key === this.dayKey(yesterday)) return this.t.yesterday;
        const date = new Date(time);
        return date.toLocaleDateString(this.currentLanguage, {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
        });
    }

    // --- Export ------------------------------------------------------------------
    // The messages shown in the filtered chat: as text to the clipboard, or as a
    // .txt / .csv file

    setupExportButton() {
        const button = this.customChatContainer.querySelector('.twitch-export-filtered');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.exportMenu) {
                this.closeExportMenu();
                return;
            }
            this.showExportMenu(button);
        });
    }

    showExportMenu(anchor) {
        const t = this.t;
        const menu = document.createElement('div');
        menu.className = 'twitch-filter-menu';
        menu.setAttribute('role', 'menu');

        const actions = [
            [t.copyText, () => this.copyExport(anchor)],
            [t.saveTxt, () => this.downloadExport('txt')],
            [t.saveCsv, () => this.downloadExport('csv')]
        ];
        actions.forEach(([label, action]) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('role', 'menuitem');
            item.textContent = label;
            item.disabled = !this.filteredMessages.length;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeExportMenu();
                action();
            });
            menu.appendChild(item);
        });
        if (!this.filteredMessages.length) {
            const hint = document.createElement('div');
            hint.className = 'twitch-filter-menu-hint';
            hint.textContent = t.nothingToExport;
            menu.appendChild(hint);
        }

        document.body.appendChild(menu);
        const anchorRect = anchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        menu.style.left = `${Math.max(4, Math.min(anchorRect.right - menuRect.width, window.innerWidth - menuRect.width - 4))}px`;
        menu.style.top = `${anchorRect.bottom + 4}px`;
        menu.querySelector('button:not(:disabled)')?.focus();

        const onOutside = (e) => {
            if (!menu.contains(e.target) && !anchor.contains(e.target)) this.closeExportMenu();
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                this.closeExportMenu();
                anchor.focus();
            }
        };
        document.addEventListener('mousedown', onOutside, true);
        document.addEventListener('keydown', onKey, true);
        this.exportMenu = {
            menu,
            cleanup: () => {
                document.removeEventListener('mousedown', onOutside, true);
                document.removeEventListener('keydown', onKey, true);
            }
        };
    }

    closeExportMenu() {
        if (!this.exportMenu) return;
        this.exportMenu.menu.remove();
        this.exportMenu.cleanup();
        this.exportMenu = null;
    }

    // Time of a message for export: the video time in a VOD, otherwise the date
    // and time it arrived
    exportTime(msg) {
        if (msg.timestamp) return msg.timestamp;
        const date = new Date(msg.receivedAt);
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    // Link to the stream at the top of the export: the recording on a VOD page,
    // otherwise the channel (without the query string and the moderator view)
    streamUrl() {
        if (/^\/videos\//i.test(location.pathname)) return `${location.origin}${location.pathname}`;
        if (this.channel) return `https://www.twitch.tv/${this.channel}`;
        return `${location.origin}${location.pathname}`;
    }

    exportText() {
        const lines = this.filteredMessages
            .map(msg => `[${this.exportTime(msg)}] ${msg.name || msg.login}: ${msg.text}`);
        return [this.streamUrl(), '', ...lines].join('\n');
    }

    exportCsv() {
        // Quotes around every field; formulas are not run when opened in a
        // spreadsheet (a leading =, +, - or @ is escaped)
        const field = value => {
            let text = String(value ?? '');
            if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
            return `"${text.replace(/"/g, '""')}"`;
        };
        // The stream link first, then the table
        const rows = [['stream', this.streamUrl()], ['time', 'login', 'name', 'message']];
        this.filteredMessages.forEach(msg => rows.push([this.exportTime(msg), msg.login, msg.name, msg.text]));
        // BOM: Excel opens the file as UTF-8
        return '\ufeff' + rows.map(row => row.map(field).join(',')).join('\r\n');
    }

    async copyExport(anchor) {
        try {
            await navigator.clipboard.writeText(this.exportText());
        } catch (error) {
            return;
        }
        // Short confirmation in the button tooltip
        this.setButtonLabel(anchor, this.t.copied);
        setTimeout(() => this.setButtonLabel(anchor, this.t.exportChat), 1500);
    }

    downloadExport(format) {
        const content = format === 'csv' ? this.exportCsv() : this.exportText();
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date();
        const pad = n => String(n).padStart(2, '0');
        const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
        link.href = url;
        link.download = `chat_${this.channel || 'twitch'}_${stamp}.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // --- Auto-collapse -------------------------------------------------------------
    // With the setting on, the filtered chat shrinks to its header when there are
    // no matching messages for a while and expands with the next one. A click on
    // the collapsed header expands it

    setupCollapse() {
        this.customChatContainer.querySelector('.twitch-filter-header').addEventListener('click', (e) => {
            if (!this.dualContainer.classList.contains('filtered-collapsed') || e.target.closest('button')) return;
            this.lastMatchAt = Date.now();
            this.updateCollapse();
        });
    }

    updateCollapse() {
        if (!this.dualContainer) return;
        clearTimeout(this.collapseTimer);
        this.collapseTimer = null;

        const enabled = Boolean(this.state && this.state.autoCollapse);
        const idle = Date.now() - this.lastMatchAt;
        const collapsed = enabled && idle >= AUTO_COLLAPSE_DELAY;
        const header = this.customChatContainer.querySelector('.twitch-filter-header');
        const wasCollapsed = this.dualContainer.classList.contains('filtered-collapsed');

        this.dualContainer.classList.toggle('filtered-collapsed', collapsed);
        header.title = collapsed ? this.t.expandChat : '';
        if (wasCollapsed && !collapsed) this.scrollToBottom(true);

        // Collapse when the quiet time runs out
        if (enabled && !collapsed) {
            this.collapseTimer = setTimeout(() => this.updateCollapse(), AUTO_COLLAPSE_DELAY - idle);
        }
    }

    // Clicks on the copy (name, badge, emote, mention, VOD time) are passed to the
    // matching element of the original message, so the user card, emote card, menu
    // and seeking work
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

            // VOD timestamp: seek the video even if the original is gone
            const isTimestamp = msgData.hasOwnTimestamp &&
                interactive.closest('.vod-message__header, [data-test-selector="chat-timestamp"]');

            const original = this.getLiveOriginal(msgData);
            const cloneRoot = wrapper.querySelector('.twitch-filter-clone');
            const target = original && this.findCounterpart(cloneRoot, interactive, original);

            // The original was removed from the chat: plain links work on their own
            if (!target && !isTimestamp) return;

            e.preventDefault();
            e.stopPropagation();

            if (target) {
                // Twitch opens the menu ("⋮" to the right of the message) inside the original
                // message, which is not visible, so show a copy
                if (!isTimestamp) this.watchOriginalPopup(original, target, interactive);
                target.click();
            }
            if (isTimestamp) this.ensureSeek(msgData.timestamp, !target);
        });

        this.setupHoverCard(container);
    }

    // Wait for the popup menu inside the original message (the observer is set
    // before the click: React renders the menu synchronously)
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

    // Menu items: the outermost clickable elements with a label
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

    // A copy of the menu next to the button in the filtered chat; the original
    // menu stays open but invisible, and clicks on items are passed to it
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

                // The item may have opened the next step (submenu, confirmation)
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

        // Twitch "click outside the menu" handlers must not close the original
        ['mousedown', 'pointerdown', 'mouseup', 'pointerup'].forEach(type => {
            menu.addEventListener(type, e => e.stopPropagation());
        });

        const previousVisibility = popup.style.visibility;
        popup.style.visibility = 'hidden';
        doc.body.appendChild(menu);

        // Position: below the button, right-aligned, within the window
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
            // Clicking the same "⋮" button again only closes the menu
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
        // Twitch closed the menu itself (or the message left the chat)
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

    // closeOriginal: also close the original menu by clicking its button again
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

    // Seek a VOD to the message time ("1:02:03" or "2:03"). Let the Twitch handler
    // run first; if the video did not seek, seek via the <video> element
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

    // The original message, if it is still in the chat and not reused by Twitch
    // for another message
    getLiveOriginal(msgData) {
        const original = msgData.original;
        if (!original || !original.isConnected) return null;
        return this.processedElements.get(original) === msgData.signature ? original : null;
    }

    // The element of the original at the same place as node in the copy
    findCounterpart(cloneRoot, node, original) {
        const path = [];
        for (let el = node; el && el !== cloneRoot; el = el.parentElement) {
            // Our time element exists in the copy but not in the original: skip it
            const siblings = Array.prototype.filter.call(el.parentElement.children,
                child => !child.classList.contains('twitch-filter-timestamp'));
            path.unshift(siblings.indexOf(el));
        }

        let target = original;
        for (const index of path) {
            target = target.children[index];
            if (!target) return null;
        }
        return target.tagName === node.tagName ? target : null;
    }

    // Tooltip for badges and emotes on hover: larger image and name (native Twitch
    // tooltips do not work on the copy)
    setupHoverCard(container) {
        const doc = container.ownerDocument;
        // The chat is recreated on navigation: keep a single card per document
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
            // Live chat: messages are div.chat-line__message
            ...this.chatContainer.querySelectorAll(
                '.chat-line__message, [data-a-target="chat-line-message"], [data-test-selector="chat-line-message"]'
            ),
            // VOD: messages are li elements with .vod-message inside
            ...Array.from(this.chatContainer.querySelectorAll('li .vod-message'), el => el.closest('li')),
            // Fallback: go up from the name to the message root
            ...Array.from(
                this.chatContainer.querySelectorAll('[data-a-target="chat-message-username"]'),
                el => el.closest('.chat-line__message, li')
            )
        ]);
        messages.delete(null);

        return [...messages];
    }

    // A message is shown if it matches at least one "show" rule and no "hide" rule
    shouldShowMessage(login, badges, text) {
        return this.evaluateMessage(login, badges, text).show;
    }

    // A message is shown if it matches at least one "show" rule and no "hide"
    // rule. matched: the rules that matched it (for counters and notifications)
    evaluateMessage(login, badges, text) {
        const name = login.toLowerCase();
        const ownLogin = this.getOwnLogin();
        const message = { login: name, text: text.toLowerCase(), raw: text, badges, ownLogin };
        const excluded = this.excludeRules.filter(rule => rule.test(message));
        const included = this.includeRules.filter(rule => rule.test(message));
        const matched = [...excluded, ...included];

        // The user's own messages are always shown
        if (ownLogin && name === ownLogin) return { show: true, own: true, matched: [], included: [] };
        // With the filter off everything is shown
        if (!this.isFilterEnabled) return { show: true, matched: [], included: [] };

        const show = !excluded.length && included.length > 0;
        return { show, matched, included: show ? included : [] };
    }

    // Badges of the message author: image URL and name (also saved in the
    // history, so role and badge rules work for saved messages)
    getBadges(messageElement) {
        return Array.from(
            messageElement.querySelectorAll('.chat-badge, [data-a-target="chat-badge"] img, img[src*="/badges/"]'),
            badge => ({
                src: badge.getAttribute('src') || '',
                name: badge.getAttribute('alt') || badge.getAttribute('aria-label') || ''
            })
        );
    }

    // Login of the current user from the Twitch cookie
    getOwnLogin() {
        if (this.ownLogin) return this.ownLogin;

        const match = document.cookie.match(/(?:^|;\s*)login=([^;]+)/);
        if (match) {
            this.ownLogin = decodeURIComponent(match[1]).toLowerCase();
        }
        return this.ownLogin;
    }

    // User login from data-a-user (on the message root in live chat or on the name
    // element)
    extractLogin(messageElement) {
        if (messageElement.getAttribute) {
            const rootLogin = messageElement.getAttribute('data-a-user');
            if (rootLogin) return rootLogin;
        }

        const userElement = messageElement.querySelector?.('[data-a-user]');
        return userElement ? userElement.getAttribute('data-a-user') : null;
    }

    // Twitch shows localized names as "Name (login)"; the login is what we compare
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
                // Ignore errors
            }
        }

        return null;
    }

    extractMessageText(messageElement) {
        // The whole message body: text + emote names, so emote-only messages are
        // filtered too
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
            // In a VOD the body starts with the ":" separator
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

    // Message time in the video (VOD only)
    extractVodTimestamp(messageElement) {
        const timeElement = messageElement.querySelector('[data-test-selector="chat-timestamp"]') ||
            messageElement.querySelector('.vod-message__header p');
        const text = timeElement ? timeElement.textContent.trim() : '';
        return text || null;
    }
};

// Filter startup. The pop-out chat window (/popout/…/chat) and the embedded
// chat (/embed/…) are not split in two: they are just a chat
var isStandaloneChat = /^\/(popout|embed)\//i.test(window.location.pathname);

// After an extension update the new copy of the script is injected into the
// open tab (background.js) while the old one keeps running without a
// connection to the extension: settings changes no longer reach it. The new
// copy tells the old one to stop with a DOM event (it reaches every copy)
var TAKEOVER_EVENT = 'twitch-chat-filter-takeover';

if (window.location.hostname.includes('twitch.tv') && !isStandaloneChat) {
    document.dispatchEvent(new CustomEvent(TAKEOVER_EVENT));

    const filter = new TwitchChatFilter();
    let stopped = false;

    const stop = () => {
        if (stopped) return;
        stopped = true;
        clearInterval(watchTimer);
        document.removeEventListener(TAKEOVER_EVENT, stop);
        filter.destroy();
    };
    document.addEventListener(TAKEOVER_EVENT, stop);

    let currentUrl = window.location.href;
    const watchTimer = setInterval(() => {
        // The extension was updated, reloaded or removed: this copy is dead
        let alive = false;
        try {
            alive = Boolean(chrome.runtime && chrome.runtime.id);
        } catch (error) {
            // Accessing an invalidated context throws
        }
        if (!alive) {
            stop();
            return;
        }

        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            filter.cleanup();
            // Another preset may apply on another channel
            if (filter.state) filter.setState(filter.state);
            setTimeout(() => {
                if (!stopped) filter.waitForChat();
            }, 3000);
            return;
        }

        // Self-healing: if Twitch remounted the chat, or our container was removed
        // (e.g. by an old copy of the script), recreate it
        if ((filter.chatContainer && !filter.chatContainer.isConnected) ||
            (filter.dualContainer && !filter.dualContainer.isConnected)) {
            filter.cleanup();
            filter.waitForChat();
            return;
        }

        // On VOD pages the channel appears in the page later than the chat
        filter.refreshChannel();
    }, 1000);

    setTimeout(() => {
        if (!stopped && !filter.chatContainer) {
            filter.waitForChat();
        }
    }, 5000);
}
