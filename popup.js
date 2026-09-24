document.addEventListener('DOMContentLoaded', function () {
    const languageSelect = document.getElementById('languageSelect');
    const modeButtons = document.querySelectorAll('.segmented [data-mode]');
    const modeHint = document.getElementById('modeHint');
    const usernameInput = document.getElementById('usernameInput');
    const addUserBtn = document.getElementById('addUserBtn');
    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const filterStateLabel = document.getElementById('filterStateLabel');
    const userList = document.getElementById('userList');
    const userCount = document.getElementById('userCount');
    const messageCount = document.getElementById('messageCount');
    const savedCount = document.getElementById('savedCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const copyListBtn = document.getElementById('copyListBtn');
    const savedMessages = document.getElementById('savedMessages');

    let usersList = [];
    let isFilterEnabled = true;
    let hiddenMessagesCount = 0;
    let savedMessagesCount = 0;
    let mode = 'whitelist';
    let savedWhitelistMessages = [];
    let currentLanguage = 'en';

    // Локализация
    const translations = {
        en: {
            title: 'Twitch Chat Filter',
            filterOn: 'Filter is on',
            filterOff: 'Filter is off',
            mode: 'Mode',
            whitelist: 'Whitelist',
            blacklist: 'Blacklist',
            whitelistHint: 'Only messages from users in the list are shown',
            blacklistHint: 'Messages from users in the list are hidden',
            users: 'Users',
            add: 'Add',
            whitelistPlaceholder: 'Username to show',
            blacklistPlaceholder: 'Username to hide',
            inputHint: 'Paste several names separated by commas or spaces to add them all at once',
            emptyList: 'The list is empty',
            remove: 'Remove',
            copyList: 'Copy list',
            copied: 'Copied!',
            hiddenMessages: 'Hidden messages',
            savedMessages: 'Saved messages',
            savedMessagesTitle: 'Saved messages (last 50)',
            noSavedMessages: 'No saved messages yet',
            clearAll: 'Clear all',
            clearAllConfirm: 'Delete all users and saved messages?'
        },
        ru: {
            title: 'Фильтр чата Twitch',
            filterOn: 'Фильтр включён',
            filterOff: 'Фильтр выключен',
            mode: 'Режим',
            whitelist: 'Белый список',
            blacklist: 'Чёрный список',
            whitelistHint: 'Показываются только сообщения пользователей из списка',
            blacklistHint: 'Сообщения пользователей из списка скрываются',
            users: 'Пользователи',
            add: 'Добавить',
            whitelistPlaceholder: 'Ник, который показывать',
            blacklistPlaceholder: 'Ник, который скрывать',
            inputHint: 'Вставьте несколько ников через запятую или пробел, чтобы добавить их все сразу',
            emptyList: 'Список пуст',
            remove: 'Удалить',
            copyList: 'Копировать список',
            copied: 'Скопировано!',
            hiddenMessages: 'Скрыто сообщений',
            savedMessages: 'Сохранено сообщений',
            savedMessagesTitle: 'Сохранённые сообщения (последние 50)',
            noSavedMessages: 'Сохранённых сообщений пока нет',
            clearAll: 'Очистить всё',
            clearAllConfirm: 'Удалить всех пользователей и сохранённые сообщения?'
        }
    };

    const t = () => translations[currentLanguage] || translations.en;

    // Загрузка настроек: настройки — в sync (синхронизируются между
    // устройствами), объёмные данные — в local (у sync лимит 100 КБ)
    Promise.all([
        chrome.storage.sync.get(['usersList', 'isFilterEnabled', 'mode', 'language']),
        chrome.storage.local.get(['hiddenMessagesCount', 'savedMessagesCount', 'savedWhitelistMessages'])
    ]).then(([syncData, localData]) => {
        usersList = syncData.usersList || [];
        isFilterEnabled = syncData.isFilterEnabled !== false;
        mode = syncData.mode || 'whitelist';
        currentLanguage = syncData.language || 'en';

        hiddenMessagesCount = localData.hiddenMessagesCount || 0;
        savedMessagesCount = localData.savedMessagesCount || 0;
        savedWhitelistMessages = localData.savedWhitelistMessages || [];

        languageSelect.value = currentLanguage;
        render();
    });

    // Живое обновление статистики, пока popup открыт
    chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName !== 'local') return;

        if (changes.hiddenMessagesCount) {
            hiddenMessagesCount = changes.hiddenMessagesCount.newValue || 0;
        }
        if (changes.savedMessagesCount) {
            savedMessagesCount = changes.savedMessagesCount.newValue || 0;
        }
        if (changes.savedWhitelistMessages) {
            savedWhitelistMessages = changes.savedWhitelistMessages.newValue || [];
            updateSavedMessages();
        }

        updateStats();
    });

    languageSelect.addEventListener('change', function () {
        currentLanguage = languageSelect.value;
        saveSettings();
        render();
    });

    modeButtons.forEach(button => {
        button.addEventListener('click', function () {
            mode = button.dataset.mode;
            saveSettings();
            updateModeAndFilter();
        });
    });

    toggleFilterBtn.addEventListener('click', function () {
        isFilterEnabled = !isFilterEnabled;
        saveSettings();
        updateModeAndFilter();
    });

    addUserBtn.addEventListener('click', addUser);
    usernameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            addUser();
        }
    });

    // Можно вставить сразу несколько ников (например, скопированный
    // ранее список) — через запятую, точку с запятой или пробел
    function addUser() {
        const usernames = usernameInput.value.toLowerCase().split(/[\s,;]+/).filter(Boolean);
        const newUsers = usernames.filter((name, i) =>
            !usersList.includes(name) && usernames.indexOf(name) === i);

        if (newUsers.length) {
            usersList.push(...newUsers);
            saveSettings();
            updateUserList();
        }
        if (usernames.length) {
            usernameInput.value = '';
        }
        usernameInput.focus();
    }

    function removeUser(username) {
        usersList = usersList.filter(user => user !== username);
        saveSettings();
        updateUserList();
    }

    // Копирование списка в буфер обмена — для ручной резервной копии
    // или переноса на другой компьютер
    copyListBtn.addEventListener('click', async function () {
        try {
            await navigator.clipboard.writeText(usersList.join(', '));
            copyListBtn.textContent = t().copied;
            setTimeout(() => {
                copyListBtn.textContent = t().copyList;
            }, 1500);
        } catch (error) {
            // Буфер обмена недоступен
        }
    });

    clearAllBtn.addEventListener('click', function () {
        if (!confirm(t().clearAllConfirm)) return;

        usersList = [];
        hiddenMessagesCount = 0;
        savedMessagesCount = 0;
        savedWhitelistMessages = [];
        saveSettings();
        chrome.storage.local.set({
            hiddenMessagesCount: 0,
            savedMessagesCount: 0,
            savedWhitelistMessages: []
        });
        render();
    });

    // Полная перерисовка (загрузка, смена языка, очистка)
    function render() {
        const tr = t();
        document.documentElement.lang = currentLanguage;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = tr[el.dataset.i18n];
        });
        usernameInput.title = tr.inputHint;

        updateModeAndFilter();
        updateUserList();
        updateStats();
        updateSavedMessages();
    }

    function updateModeAndFilter() {
        const tr = t();

        modeButtons.forEach(button => {
            button.setAttribute('aria-checked', String(button.dataset.mode === mode));
        });
        modeHint.textContent = mode === 'whitelist' ? tr.whitelistHint : tr.blacklistHint;
        usernameInput.placeholder = mode === 'whitelist' ? tr.whitelistPlaceholder : tr.blacklistPlaceholder;

        toggleFilterBtn.setAttribute('aria-checked', String(isFilterEnabled));
        filterStateLabel.textContent = isFilterEnabled ? tr.filterOn : tr.filterOff;
    }

    function updateStats() {
        messageCount.textContent = hiddenMessagesCount;
        savedCount.textContent = savedMessagesCount;
    }

    // Список ников (безопасный рендер без innerHTML)
    function updateUserList() {
        const tr = t();
        userList.textContent = '';
        userCount.textContent = usersList.length;
        copyListBtn.disabled = usersList.length === 0;

        if (usersList.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = tr.emptyList;
            userList.appendChild(empty);
            return;
        }

        usersList.forEach(username => {
            const userItem = document.createElement('span');
            userItem.className = 'user-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'user-name';
            nameSpan.textContent = username;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.title = `${tr.remove} ${username}`;
            removeBtn.setAttribute('aria-label', removeBtn.title);
            removeBtn.addEventListener('click', function () {
                removeUser(username);
            });

            userItem.append(nameSpan, removeBtn);
            userList.appendChild(userItem);
        });
    }

    // Сохранённые сообщения (безопасный рендер без innerHTML)
    function updateSavedMessages() {
        savedMessages.textContent = '';

        if (savedWhitelistMessages.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = t().noSavedMessages;
            savedMessages.appendChild(empty);
            return;
        }

        // Показываем последние 50 сообщений, новые сверху
        savedWhitelistMessages.slice(-50).reverse().forEach(msg => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';

            const meta = document.createElement('div');
            meta.className = 'message-meta';

            const author = document.createElement('span');
            author.className = 'message-author';
            author.textContent = msg.username;

            const time = document.createElement('span');
            time.className = 'message-time';
            time.textContent = new Date(msg.timestamp).toLocaleString(currentLanguage);

            const text = document.createElement('div');
            text.textContent = msg.text;

            meta.append(author, time);
            messageItem.append(meta, text);
            savedMessages.appendChild(messageItem);
        });
    }

    // Сохранение настроек. Content script подхватывает изменения через
    // chrome.storage.onChanged — во всех открытых вкладках Twitch сразу
    function saveSettings() {
        chrome.storage.sync.set({
            usersList: usersList,
            isFilterEnabled: isFilterEnabled,
            mode: mode,
            language: currentLanguage
        });
    }
});
