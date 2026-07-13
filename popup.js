document.addEventListener('DOMContentLoaded', function () {
    const languageSelect = document.getElementById('languageSelect');
    const modeSelect = document.getElementById('modeSelect');
    const usernameInput = document.getElementById('usernameInput');
    const addUserBtn = document.getElementById('addUserBtn');
    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const viewMessagesBtn = document.getElementById('viewMessagesBtn');
    const userList = document.getElementById('userList');
    const userCount = document.getElementById('userCount');
    const messageCount = document.getElementById('messageCount');
    const savedCount = document.getElementById('savedCount');
    const currentMode = document.getElementById('currentMode');
    const clearAllBtn = document.getElementById('clearAllBtn');
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
            mode: 'Mode',
            usersInList: 'Users in list',
            hiddenMessages: 'Hidden messages',
            savedMessages: 'Saved messages',
            add: 'Add',
            enableFilter: 'Enable filter',
            disableFilter: 'Disable filter',
            savedMessagesBtn: 'Saved messages',
            showMessages: 'Show messages',
            hideMessages: 'Hide messages',
            clearAll: 'Clear all',
            clearAllConfirm: 'Delete all users and saved messages?',
            remove: 'Remove',
            whitelistPlaceholder: 'Enter username to allow',
            blacklistPlaceholder: 'Enter username to block',
            whitelistMode: 'Whitelist (show only selected)',
            blacklistMode: 'Blacklist (hide selected)'
        },
        ru: {
            title: 'Фильтр чата Twitch',
            mode: 'Режим',
            usersInList: 'Пользователей в списке',
            hiddenMessages: 'Скрыто сообщений',
            savedMessages: 'Сохранено сообщений',
            add: 'Добавить',
            enableFilter: 'Включить фильтр',
            disableFilter: 'Выключить фильтр',
            savedMessagesBtn: 'Сохраненные сообщения',
            showMessages: 'Показать сообщения',
            hideMessages: 'Скрыть сообщения',
            clearAll: 'Очистить все',
            clearAllConfirm: 'Удалить всех пользователей и сохраненные сообщения?',
            remove: 'Удалить',
            whitelistPlaceholder: 'Введите никнейм для разрешения',
            blacklistPlaceholder: 'Введите никнейм для блокировки',
            whitelistMode: 'Whitelist (показать только выбранных)',
            blacklistMode: 'Blacklist (скрыть выбранных)'
        }
    };

    // Загрузка настроек: настройки — в sync (синхронизируются между
    // устройствами), объемные данные — в local (у sync лимит 100 КБ)
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
        modeSelect.value = mode;
        updateLanguage();
        updateUI();
        updateUserList();
        updateSavedMessages();
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

        updateUI();
    });

    // Изменение языка
    languageSelect.addEventListener('change', function () {
        currentLanguage = languageSelect.value;
        updateLanguage();
        saveSettings();
    });

    // Функция обновления языка
    function updateLanguage() {
        const t = translations[currentLanguage];

        // Обновляем текст элементов
        document.getElementById('title').textContent = t.title;

        // Обновляем опции в select
        const whitelistOption = modeSelect.querySelector('option[value="whitelist"]');
        const blacklistOption = modeSelect.querySelector('option[value="blacklist"]');
        whitelistOption.textContent = t.whitelistMode;
        blacklistOption.textContent = t.blacklistMode;

        // Обновляем placeholder
        const placeholder = mode === 'whitelist' ? t.whitelistPlaceholder : t.blacklistPlaceholder;
        usernameInput.placeholder = placeholder;

        // Обновляем кнопки
        addUserBtn.textContent = t.add;
        clearAllBtn.textContent = t.clearAll;

        // Обновляем список (кнопки «Удалить»)
        updateUserList();

        // Обновляем статистику
        updateUI();
    }

    // Изменение режима
    modeSelect.addEventListener('change', function () {
        mode = modeSelect.value;
        updateLanguage();
        saveSettings();
        updateUI();
    });

    // Добавление пользователя
    addUserBtn.addEventListener('click', addUser);
    usernameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addUser();
        }
    });

    function addUser() {
        const username = usernameInput.value.trim().toLowerCase();
        if (username && !usersList.includes(username)) {
            usersList.push(username);
            saveSettings();
            updateUserList();
            updateUI();
            usernameInput.value = '';
        }
        usernameInput.focus();
    }

    // Переключение фильтра
    toggleFilterBtn.addEventListener('click', function () {
        isFilterEnabled = !isFilterEnabled;
        saveSettings();
        updateUI();
    });

    // Просмотр сохраненных сообщений
    viewMessagesBtn.addEventListener('click', function () {
        const t = translations[currentLanguage];
        const isVisible = savedMessages.style.display !== 'none' && savedMessages.style.display !== '';
        savedMessages.style.display = isVisible ? 'none' : 'block';
        viewMessagesBtn.textContent = isVisible ? t.savedMessagesBtn : t.hideMessages;
    });

    // Удаление пользователя
    function removeUser(username) {
        usersList = usersList.filter(user => user !== username);
        saveSettings();
        updateUserList();
        updateUI();
    }

    // Очистка всех данных
    clearAllBtn.addEventListener('click', function () {
        const t = translations[currentLanguage];
        if (confirm(t.clearAllConfirm)) {
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
            updateUserList();
            updateUI();
            updateSavedMessages();
        }
    });

    // Обновление интерфейса
    function updateUI() {
        const t = translations[currentLanguage];
        currentMode.textContent = mode === 'whitelist' ? 'Whitelist' : 'Blacklist';

        toggleFilterBtn.textContent = isFilterEnabled ? t.disableFilter : t.enableFilter;
        toggleFilterBtn.style.backgroundColor = isFilterEnabled ? '#eb0400' : '#00ad03';

        userCount.textContent = usersList.length;
        messageCount.textContent = hiddenMessagesCount;
        savedCount.textContent = savedMessagesCount;

        // Обновляем статистические лейблы
        const statsElements = document.querySelectorAll('.stats div span:first-child');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = t.mode;
            statsElements[1].textContent = t.usersInList;
            statsElements[2].textContent = t.hiddenMessages;
            statsElements[3].textContent = t.savedMessages;
        }
    }

    // Обновление списка пользователей (безопасный рендер без innerHTML)
    function updateUserList() {
        const t = translations[currentLanguage];
        userList.textContent = '';

        usersList.forEach(username => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = username;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = t.remove;
            removeBtn.addEventListener('click', function () {
                removeUser(username);
            });

            userItem.append(nameSpan, removeBtn);
            userList.appendChild(userItem);
        });
    }

    // Обновление сохраненных сообщений (безопасный рендер без innerHTML)
    function updateSavedMessages() {
        savedMessages.textContent = '';

        // Показываем последние 50 сообщений
        const recentMessages = savedWhitelistMessages.slice(-50).reverse();

        recentMessages.forEach(msg => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';

            const author = document.createElement('div');
            author.className = 'message-author';
            author.textContent = msg.username;

            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date(msg.timestamp).toLocaleString();

            const text = document.createElement('div');
            text.textContent = msg.text;

            messageItem.append(author, time, text);
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
