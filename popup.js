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

    // Загрузка настроек
    chrome.storage.sync.get([
        'usersList', 'isFilterEnabled', 'hiddenMessagesCount',
        'mode', 'savedWhitelistMessages', 'savedMessagesCount', 'language'
    ], function (result) {
        usersList = result.usersList || [];
        isFilterEnabled = result.isFilterEnabled !== false;
        hiddenMessagesCount = result.hiddenMessagesCount || 0;
        savedMessagesCount = result.savedMessagesCount || 0;
        mode = result.mode || 'whitelist';
        savedWhitelistMessages = result.savedWhitelistMessages || [];
        currentLanguage = result.language || 'en';

        languageSelect.value = currentLanguage;
        modeSelect.value = mode;
        updateLanguage();
        updateUI();
        updateUserList();
        updateSavedMessages();
    });

    // Изменение языка
    languageSelect.addEventListener('change', function () {
        currentLanguage = languageSelect.value;
        updateLanguage();
        saveSettings();
        updateContentScript();
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

        // Обновляем статистику
        updateUI();
    }

    // Изменение режима
    modeSelect.addEventListener('change', function () {
        mode = modeSelect.value;
        updateLanguage();
        saveSettings();
        updateUI();
        updateContentScript();
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
            usernameInput.value = '';
            updateContentScript();
        }
    }

    // Переключение фильтра
    toggleFilterBtn.addEventListener('click', function () {
        isFilterEnabled = !isFilterEnabled;
        saveSettings();
        updateUI();
        updateContentScript();
    });

    // Просмотр сохраненных сообщений
    viewMessagesBtn.addEventListener('click', function () {
        const t = translations[currentLanguage];
        const isVisible = savedMessages.style.display !== 'none';
        savedMessages.style.display = isVisible ? 'none' : 'block';
        viewMessagesBtn.textContent = isVisible ? t.showMessages : t.hideMessages;
    });

    // Удаление пользователя
    function removeUser(username) {
        usersList = usersList.filter(user => user !== username);
        saveSettings();
        updateUserList();
        updateContentScript();
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
            updateUserList();
            updateUI();
            updateSavedMessages();
            updateContentScript();
        }
    });

    // Обновление интерфейса
    function updateUI() {
        const t = translations[currentLanguage];
        const modeText = mode === 'whitelist' ? 'Whitelist' : 'Blacklist';
        currentMode.textContent = modeText;

        toggleFilterBtn.textContent = isFilterEnabled ? t.disableFilter : t.enableFilter;
        toggleFilterBtn.style.backgroundColor = isFilterEnabled ? '#eb0400' : '#00ad03';

        viewMessagesBtn.textContent = t.savedMessagesBtn;

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

    // Обновление списка пользователей
    function updateUserList() {
        const t = translations[currentLanguage];
        userList.innerHTML = '';

        usersList.forEach(username => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';

            userItem.innerHTML = `
        <span>${username}</span>
        <button class="remove-btn" data-username="${username}">${t.remove}</button>
      `;

            userItem.querySelector('.remove-btn').addEventListener('click', function () {
                removeUser(username);
            });

            userList.appendChild(userItem);
        });
    }

    // Обновление сохраненных сообщений
    function updateSavedMessages() {
        savedMessages.innerHTML = '';

        // Показываем последние 50 сообщений
        const recentMessages = savedWhitelistMessages.slice(-50).reverse();

        recentMessages.forEach(msg => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';

            messageItem.innerHTML = `
        <div class="message-author">${msg.username}</div>
        <div class="message-time">${new Date(msg.timestamp).toLocaleString()}</div>
        <div>${msg.text}</div>
      `;

            savedMessages.appendChild(messageItem);
        });
    }

    // Сохранение настроек
    function saveSettings() {
        chrome.storage.sync.set({
            usersList: usersList,
            isFilterEnabled: isFilterEnabled,
            hiddenMessagesCount: hiddenMessagesCount,
            savedMessagesCount: savedMessagesCount,
            mode: mode,
            savedWhitelistMessages: savedWhitelistMessages,
            language: currentLanguage
        });
    }

    // Обновление content script
    function updateContentScript() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url.includes('twitch.tv')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateFilter',
                    usersList: usersList,
                    isFilterEnabled: isFilterEnabled,
                    mode: mode,
                    language: currentLanguage
                });
            }
        });
    }

    // Получение обновлений от content script
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'updateStats') {
            hiddenMessagesCount = request.hiddenCount || hiddenMessagesCount;
            savedMessagesCount = request.savedCount || savedMessagesCount;

            if (request.newMessage) {
                savedWhitelistMessages.push(request.newMessage);
                // Ограничиваем количество сохраненных сообщений (последние 1000)
                if (savedWhitelistMessages.length > 1000) {
                    savedWhitelistMessages = savedWhitelistMessages.slice(-1000);
                }
                updateSavedMessages();
            }

            updateUI();
            saveSettings();
        }
    });
});