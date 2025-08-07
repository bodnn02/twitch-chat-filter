document.addEventListener('DOMContentLoaded', function () {
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
    let mode = 'whitelist'; // 'whitelist' или 'blacklist'
    let savedWhitelistMessages = [];

    // Загрузка настроек
    chrome.storage.sync.get([
        'usersList', 'isFilterEnabled', 'hiddenMessagesCount',
        'mode', 'savedWhitelistMessages', 'savedMessagesCount'
    ], function (result) {
        usersList = result.usersList || [];
        isFilterEnabled = result.isFilterEnabled !== false;
        hiddenMessagesCount = result.hiddenMessagesCount || 0;
        savedMessagesCount = result.savedMessagesCount || 0;
        mode = result.mode || 'whitelist';
        savedWhitelistMessages = result.savedWhitelistMessages || [];

        modeSelect.value = mode;
        updateUI();
        updateUserList();
        updateSavedMessages();
    });

    // Изменение режима
    modeSelect.addEventListener('change', function () {
        mode = modeSelect.value;
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
        const isVisible = savedMessages.style.display !== 'none';
        savedMessages.style.display = isVisible ? 'none' : 'block';
        viewMessagesBtn.textContent = isVisible ? 'Показать сообщения' : 'Скрыть сообщения';
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
        if (confirm('Удалить всех пользователей и сохраненные сообщения?')) {
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
        const modeText = mode === 'whitelist' ? 'Whitelist' : 'Blacklist';
        currentMode.textContent = modeText;

        toggleFilterBtn.textContent = isFilterEnabled ? 'Выключить фильтр' : 'Включить фильтр';
        toggleFilterBtn.style.backgroundColor = isFilterEnabled ? '#eb0400' : '#00ad03';

        userCount.textContent = usersList.length;
        messageCount.textContent = hiddenMessagesCount;
        savedCount.textContent = savedMessagesCount;

        // Обновляем placeholder в зависимости от режима
        const placeholder = mode === 'whitelist' ?
            'Введите никнейм для разрешения' :
            'Введите никнейм для блокировки';
        usernameInput.placeholder = placeholder;
    }

    // Обновление списка пользователей
    function updateUserList() {
        userList.innerHTML = '';

        usersList.forEach(username => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';

            userItem.innerHTML = `
        <span>${username}</span>
        <button class="remove-btn" data-username="${username}">Удалить</button>
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
            savedWhitelistMessages: savedWhitelistMessages
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
                    mode: mode
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