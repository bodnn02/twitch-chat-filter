// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Risher. Licensed under GPL-3.0-only, see LICENSE

document.addEventListener('DOMContentLoaded', async function () {
    const $ = id => document.getElementById(id);

    const mainView = $('mainView');
    const settingsView = $('settingsView');
    const settingsBtn = $('settingsBtn');
    const backBtn = $('backBtn');
    const languageBtn = $('languageBtn');
    const timestampBtn = $('timestampBtn');
    const choiceMenu = $('choiceMenu');
    const presetBtn = $('presetBtn');
    const presetName = $('presetName');
    const presetStatus = $('presetStatus');
    const toggleFilterBtn = $('toggleFilterBtn');
    const searchInput = $('searchInput');
    const clearSearchBtn = $('clearSearchBtn');
    const sortSelect = $('sortSelect');
    const tabButtons = document.querySelectorAll('#tabs .tab');
    const banner = $('banner');
    const ruleList = $('ruleList');
    const footer = $('footer');
    const editBtn = $('editBtn');
    const ruleCount = $('ruleCount');
    const createBtn = $('createBtn');
    const bulkFooter = $('bulkFooter');
    const selectAll = $('selectAll');
    const selectedCount = $('selectedCount');
    const bulkEnableBtn = $('bulkEnableBtn');
    const bulkDisableBtn = $('bulkDisableBtn');
    const bulkDeleteBtn = $('bulkDeleteBtn');
    const doneBtn = $('doneBtn');
    const presetMenu = $('presetMenu');
    const presetItems = $('presetItems');
    const ruleMenu = $('ruleMenu');
    const ruleSheet = $('ruleSheet');
    const ruleForm = $('ruleForm');
    const typeSeg = $('typeSeg');
    const actionSeg = $('actionSeg');
    const valueField = $('valueField');
    const valueInput = $('valueInput');
    const valueError = $('valueError');
    const roleField = $('roleField');
    const rolePicker = $('rolePicker');
    const roleError = $('roleError');
    const noteInput = $('noteInput');
    const presetSheet = $('presetSheet');
    const presetForm = $('presetForm');
    const presetNameInput = $('presetNameInput');
    const presetError = $('presetError');
    const presetChannelsInput = $('presetChannelsInput');
    const presetChannelsError = $('presetChannelsError');
    const importSheet = $('importSheet');
    const importForm = $('importForm');
    const importInput = $('importInput');
    const importError = $('importError');
    const toast = $('toast');
    const toastText = $('toastText');
    const toastUndo = $('toastUndo');

    // Type order (roles first) comes from settings.js, like LOGIN_PATTERN
    const TYPE_ORDER = RULE_TYPES;
    const UI_KEY = 'twitchChatFilterPopup';

    const ICONS = {
        plus: '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M8.8 4h2.4v4.8H16v2.4h-4.8V16H8.8v-4.8H4V8.8h4.8V4Z"/></svg>',
        minus: '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M4 8.8h12v2.4H4V8.8Z"/></svg>',
        more: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>',
        check: '<svg class="check" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="m8 13.2-3.6-3.6L3 11l5 5 9-9-1.4-1.4L8 13.2Z"/></svg>',
        role: path => `<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${path}"/></svg>`,
        link: '<svg viewBox="0 0 20 20" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M8.5 11.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1 1.4 1.4 1-1a1.5 1.5 0 0 1 2.2 2.2l-3 3a1.5 1.5 0 0 1-2.2 0l-1.4 1.4Zm3-3a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1-1.4-1.4-1 1a1.5 1.5 0 0 1-2.2-2.2l3-3a1.5 1.5 0 0 1 2.2 0l1.4-1.4Z"/></svg>',
        star: '<svg viewBox="0 0 20 20" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8L10 1.8Z"/></svg>'
    };

    // Rule type icons (labels in the list and editor buttons)
    const TYPE_ICONS = {
        role: 'M10 2 3 5v4.5c0 4 3 7.3 7 8.5 4-1.2 7-4.5 7-8.5V5l-7-3Z',
        user: 'M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H3Z',
        badge: 'M6 1h8l-2.5 6h-3L6 1Zm4 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
        keyword: 'M3 3h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8l-4 4v-4H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 4v2h8V7H6Zm0 3v1.5h5V10H6Z'
    };
    const typeIcon = (type, size) =>
        `<svg viewBox="0 0 20 20" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${TYPE_ICONS[type]}"/></svg>`;

    const translations = {
        en: {
            switchOn: 'Filter is on',
            switchOff: 'Filter is off',
            switchHint: 'Your own messages are always shown',
            search: 'Search rules',
            clearSearch: 'Clear search',
            sort: { recent: 'Last modified', name: 'Name', type: 'Type' },
            tabs: { all: 'All', user: 'Users', role: 'Roles', badge: 'Badges', keyword: 'Keywords' },
            types: { user: 'User', role: 'Role', badge: 'Badge', keyword: 'Keyword' },
            roleNames: {
                broadcaster: 'Streamer',
                moderator: 'Moderator',
                vip: 'VIP',
                verified: 'Verified',
                subscriber: 'Subscriber',
                staff: 'Twitch staff',
                chatbot: 'Chatbot'
            },
            bannerOff: 'Filter is off — all messages are shown',
            bannerNoInclude: 'No active “show” rules — the filtered chat is empty',
            edit: 'Edit',
            done: 'Done',
            create: 'Create',
            count: n => `${n} ${n === 1 ? 'rule' : 'rules'}`,
            countFiltered: (shown, total) => `${shown} of ${total}`,
            selected: n => `${n} selected`,
            selectAll: 'Select all',
            bulkEnable: 'Enable selected',
            bulkDisable: 'Disable selected',
            bulkDelete: 'Delete selected',
            emptyRules: 'No rules yet',
            emptyRulesHint: 'Rules decide which messages appear in the filtered chat',
            emptyTab: 'No rules of this type yet',
            emptySearch: 'Nothing found',
            createRule: 'Create a rule',
            quickAdd: { user: 'Add user', badge: 'Add badge', keyword: 'Add keyword' },
            includeHint: 'Shows these messages. Click to hide them instead',
            excludeHint: 'Hides these messages. Click to show them instead',
            toggleRule: label => `Rule “${label}”`,
            more: 'More actions',
            editRule: 'Edit',
            flipToExclude: 'Hide instead',
            flipToInclude: 'Show instead',
            deleteRule: 'Delete',
            ruleDeleted: label => `“${label}” deleted`,
            rulesDeleted: n => `${n} ${n === 1 ? 'rule' : 'rules'} deleted`,
            presets: 'Presets',
            newPreset: 'New preset',
            duplicatePreset: 'Duplicate preset',
            presetSettings: 'Name and channels',
            deletePreset: 'Delete preset',
            makeDefault: 'Use by default',
            bindTo: channel => `Use on channel ${channel}`,
            unbindFrom: channel => `Unbind from ${channel}`,
            statusBound: channel => `On channel ${channel}`,
            statusDefault: 'Default preset',
            statusUnused: channel => channel ? `Not used on ${channel}` : 'Not in use',
            metaDefault: 'Default',
            channelsLabel: 'Channels',
            channelsHint: 'The preset turns on automatically on these channels. Separate with commas. A channel can have only one preset',
            invalidChannels: names => `Not a valid channel: ${names.join(', ')}`,
            exportPreset: 'Copy to clipboard',
            importPreset: 'Import from clipboard',
            importLabel: 'Copied preset',
            importHint: 'Paste a preset copied with “Copy to clipboard”, or a list of usernames separated by commas',
            importAction: 'Import',
            importInvalid: 'Could not recognize a preset',
            importedName: 'Imported',
            imported: n => `Preset imported: ${n} ${n === 1 ? 'rule' : 'rules'}`,
            presetCopied: 'Preset copied to clipboard',
            clipboardError: 'Could not access the clipboard',
            settings: 'Settings',
            back: 'Back',
            general: 'General',
            languageLabel: 'Language',
            languageHint: 'Extension menu and chat on Twitch',
            timestampLabel: 'Message time',
            timestampHint: 'In the filtered chat, full time on hover',
            timestampFormats: { short: 'Short', full: 'With seconds', off: 'Hidden' },
            systemLanguage: 'System',
            systemLanguageHint: name => `Browser language: ${name}`,
            about: 'About',
            extensionName: 'Chat Filter for Twitch',
            aboutText: 'No servers or tracking — everything stays in your browser',
            version: v => `v${v}`,
            presetDeleted: name => `Preset “${name}” deleted`,
            presetNameLabel: 'Name',
            presetDefaultName: n => `Preset ${n}`,
            copySuffix: ' (copy)',
            presetNameRequired: 'Enter a name',
            newRule: 'New rule',
            editRuleTitle: 'Edit rule',
            typeLabel: 'Type',
            actionLabel: 'Messages',
            include: 'Show',
            exclude: 'Hide',
            valueLabels: { user: 'Username', badge: 'Badge name', keyword: 'Keyword' },
            valuePlaceholders: { user: 'nightbot', badge: 'Founder', keyword: 'giveaway' },
            valueHints: {
                user: 'Several names can be separated by commas or spaces',
                badge: 'Part of the badge name as Twitch shows it on hover',
                keyword: 'Part of the message text, case does not matter'
            },
            rolesLabel: 'Roles',
            roleLabel: 'Role',
            noteLabel: 'Note (optional)',
            notePlaceholder: 'e.g. Chatbot',
            cancel: 'Cancel',
            add: 'Add',
            save: 'Save',
            required: 'Enter a value',
            invalidUser: names => `Not a valid username: ${names.join(', ')}`,
            duplicate: 'This rule already exists',
            pickRole: 'Pick a role',
            saveError: 'Could not save: sync storage is full',
            undo: 'Undo',
            badgeSuggestions: ['Subscriber', 'Founder', 'Sub Gifter', 'Prime Gaming', 'Turbo', 'Artist', 'Bits', 'Predictions']
        },
        ru: {
            switchOn: 'Фильтр включён',
            switchOff: 'Фильтр выключен',
            switchHint: 'Ваши собственные сообщения видны всегда',
            search: 'Поиск правил',
            clearSearch: 'Очистить поиск',
            sort: { recent: 'Недавние', name: 'По имени', type: 'По типу' },
            tabs: { all: 'Все', user: 'Ники', role: 'Роли', badge: 'Значки', keyword: 'Слова' },
            types: { user: 'Ник', role: 'Роль', badge: 'Значок', keyword: 'Слово' },
            roleNames: {
                broadcaster: 'Стример',
                moderator: 'Модератор',
                vip: 'VIP',
                verified: 'Подтверждённый',
                subscriber: 'Подписчик',
                staff: 'Команда Twitch',
                chatbot: 'Чат-бот'
            },
            bannerOff: 'Фильтр выключен — видны все сообщения',
            bannerNoInclude: 'Нет активных правил «показывать» — фильтрованный чат пуст',
            edit: 'Выбрать',
            done: 'Готово',
            create: 'Создать',
            count: n => `${n} ${pluralRu(n, 'правило', 'правила', 'правил')}`,
            countFiltered: (shown, total) => `${shown} из ${total}`,
            selected: n => `Выбрано: ${n}`,
            selectAll: 'Выбрать все',
            bulkEnable: 'Включить выбранные',
            bulkDisable: 'Выключить выбранные',
            bulkDelete: 'Удалить выбранные',
            emptyRules: 'Правил пока нет',
            emptyRulesHint: 'Правила определяют, какие сообщения попадут в фильтрованный чат',
            emptyTab: 'Правил этого типа пока нет',
            emptySearch: 'Ничего не найдено',
            createRule: 'Создать правило',
            quickAdd: { user: 'Добавить ник', badge: 'Добавить значок', keyword: 'Добавить слово' },
            includeHint: 'Показывает эти сообщения. Нажмите, чтобы скрывать',
            excludeHint: 'Скрывает эти сообщения. Нажмите, чтобы показывать',
            toggleRule: label => `Правило «${label}»`,
            more: 'Другие действия',
            editRule: 'Изменить',
            flipToExclude: 'Скрывать вместо показа',
            flipToInclude: 'Показывать вместо скрытия',
            deleteRule: 'Удалить',
            ruleDeleted: label => `«${label}» удалено`,
            rulesDeleted: n => `Удалено: ${n}`,
            presets: 'Наборы правил',
            newPreset: 'Новый набор',
            duplicatePreset: 'Дублировать набор',
            presetSettings: 'Название и каналы',
            deletePreset: 'Удалить набор',
            makeDefault: 'Использовать по умолчанию',
            bindTo: channel => `Использовать на канале ${channel}`,
            unbindFrom: channel => `Отвязать от канала ${channel}`,
            statusBound: channel => `Для канала ${channel}`,
            statusDefault: 'Набор по умолчанию',
            statusUnused: channel => channel ? `Не используется на канале ${channel}` : 'Не используется',
            metaDefault: 'По умолчанию',
            channelsLabel: 'Каналы',
            channelsHint: 'На этих каналах набор включается автоматически. Через запятую. У канала может быть только один набор',
            invalidChannels: names => `Некорректный канал: ${names.join(', ')}`,
            exportPreset: 'Скопировать в буфер обмена',
            importPreset: 'Импорт из буфера обмена',
            importLabel: 'Скопированный набор',
            importHint: 'Вставьте набор, скопированный кнопкой «Скопировать в буфер обмена», или список ников через запятую',
            importAction: 'Импортировать',
            importInvalid: 'Не удалось распознать набор',
            importedName: 'Импортированный',
            imported: n => `Набор импортирован: ${n} ${pluralRu(n, 'правило', 'правила', 'правил')}`,
            presetCopied: 'Набор скопирован в буфер обмена',
            clipboardError: 'Нет доступа к буферу обмена',
            settings: 'Настройки',
            back: 'Назад',
            general: 'Общие',
            languageLabel: 'Язык',
            languageHint: 'Меню расширения и чат на Twitch',
            timestampLabel: 'Время сообщений',
            timestampHint: 'В фильтрованном чате, полное — при наведении',
            timestampFormats: { short: 'Короткое', full: 'С секундами', off: 'Не показывать' },
            systemLanguage: 'Как в системе',
            systemLanguageHint: name => `Язык браузера: ${name}`,
            about: 'О расширении',
            extensionName: 'Фильтр чата для Twitch',
            aboutText: 'Без серверов и отслеживания — всё остаётся в вашем браузере',
            version: v => `v${v}`,
            presetDeleted: name => `Набор «${name}» удалён`,
            presetNameLabel: 'Название',
            presetDefaultName: n => `Набор ${n}`,
            copySuffix: ' (копия)',
            presetNameRequired: 'Введите название',
            newRule: 'Новое правило',
            editRuleTitle: 'Изменить правило',
            typeLabel: 'Тип',
            actionLabel: 'Сообщения',
            include: 'Показывать',
            exclude: 'Скрывать',
            valueLabels: { user: 'Ник', badge: 'Название значка', keyword: 'Ключевое слово' },
            valuePlaceholders: { user: 'nightbot', badge: 'Основатель', keyword: 'розыгрыш' },
            valueHints: {
                user: 'Несколько ников можно ввести через запятую или пробел',
                badge: 'Часть названия значка, как его показывает Twitch при наведении',
                keyword: 'Часть текста сообщения, регистр не важен'
            },
            rolesLabel: 'Роли',
            roleLabel: 'Роль',
            noteLabel: 'Заметка (необязательно)',
            notePlaceholder: 'например, Чат-бот',
            cancel: 'Отмена',
            add: 'Добавить',
            save: 'Сохранить',
            required: 'Введите значение',
            invalidUser: names => `Некорректный ник: ${names.join(', ')}`,
            duplicate: 'Такое правило уже есть',
            pickRole: 'Выберите роль',
            saveError: 'Не удалось сохранить: хранилище синхронизации заполнено',
            undo: 'Отменить',
            badgeSuggestions: ['Подписчик', 'Основатель', 'Даритель подписок', 'Prime Gaming', 'Turbo', 'Художник', 'Bits']
        }
    };

    // Russian plural forms: 1 правило, 2 правила, 5 правил
    function pluralRu(n, one, few, many) {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return one;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
        return many;
    }

    let state = null;
    // Interface language, taking the "system" setting into account
    const uiLanguage = () => FilterStore.resolveLanguage(state.language);
    const t = () => translations[uiLanguage()] || translations.en;

    // UI state; the tab and the sort order are remembered
    const ui = {
        tab: 'all',
        sort: 'recent',
        query: '',
        editMode: false,
        selected: new Set(),
        // Preset open in the popup (see viewedPreset)
        viewPresetId: null,
        // Newly created rules are highlighted
        newIds: new Set()
    };
    try {
        const saved = JSON.parse(localStorage.getItem(UI_KEY)) || {};
        if (['all', ...TYPE_ORDER].includes(saved.tab)) ui.tab = saved.tab;
        if (['recent', 'name', 'type'].includes(saved.sort)) ui.sort = saved.sort;
    } catch (error) {
        // localStorage is unavailable
    }

    function saveUiState() {
        try {
            localStorage.setItem(UI_KEY, JSON.stringify({ tab: ui.tab, sort: ui.sort }));
        } catch (error) {
            // localStorage is unavailable
        }
    }

    // Channel of the open Twitch tab (null if it is not a channel page)
    let currentChannel = null;

    // The popup shows and edits the "viewed" preset: initially the one active on
    // the open channel
    const effectivePreset = () => FilterStore.getPresetForChannel(state, currentChannel);
    const viewedPreset = () =>
        state.presets.find(preset => preset.id === ui.viewPresetId) || effectivePreset();
    const findRule = id => viewedPreset().rules.find(rule => rule.id === id);

    // --- Saving ---------------------------------------------------------------

    // Writes are queued; the content script picks up changes via
    // chrome.storage.onChanged in every open Twitch tab
    let saveQueue = Promise.resolve();
    function persist() {
        saveQueue = saveQueue
            .then(() => FilterStore.saveAll(state))
            .catch(() => showToast(t().saveError));
    }

    // Snapshot for undoing a deletion
    const snapshot = () => JSON.parse(JSON.stringify(state));

    function restore(saved) {
        state = saved;
        ui.selected.clear();
        persist();
        render();
    }

    // --- Rule list ------------------------------------------------------------

    function ruleLabel(rule) {
        return rule.type === 'role' ? t().roleNames[rule.value] : rule.value;
    }

    function ruleKey(type, value) {
        return `${type}:${value.toLowerCase()}`;
    }

    function ruleExists(type, value, exceptId) {
        const key = ruleKey(type, value);
        return viewedPreset().rules.some(rule => rule.id !== exceptId && ruleKey(rule.type, rule.value) === key);
    }

    function normalizeQuery(value) {
        return value.trim().replace(/^@/, '').toLowerCase();
    }

    function visibleRules() {
        const query = normalizeQuery(ui.query);
        const rules = viewedPreset().rules.filter(rule =>
            (ui.tab === 'all' || rule.type === ui.tab) &&
            (!query || ruleLabel(rule).toLowerCase().includes(query) || rule.note.toLowerCase().includes(query)));

        const byName = (a, b) => ruleLabel(a).localeCompare(ruleLabel(b), uiLanguage());
        if (ui.sort === 'name') {
            rules.sort(byName);
        } else if (ui.sort === 'type') {
            rules.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || byName(a, b));
        } else {
            rules.sort((a, b) => b.updated - a.updated);
        }
        return rules;
    }

    // What to offer to add from the search text (Enter): on the "All" tab a
    // username if the text looks like a login, otherwise a keyword
    function getQuickAdd() {
        const raw = ui.query.trim();
        if (!raw || ui.editMode || ui.tab === 'role') return null;

        let type = ui.tab === 'all' ? 'user' : ui.tab;
        let value = type === 'user' ? FilterStore.normalizeLogin(raw) : raw;
        if (type === 'user' && !LOGIN_PATTERN.test(value)) {
            if (ui.tab !== 'all') return null;
            type = 'keyword';
            value = raw;
        }
        if (ruleExists(type, value)) return null;
        return { type, value };
    }

    function renderList() {
        const tr = t();
        const preset = viewedPreset();
        const rules = visibleRules();
        const query = normalizeQuery(ui.query);
        const quickAdd = getQuickAdd();

        ruleList.textContent = '';

        if (quickAdd) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quick-add';
            button.innerHTML = ICONS.plus;
            const label = document.createElement('span');
            label.textContent = tr.quickAdd[quickAdd.type];
            const value = document.createElement('strong');
            value.textContent = quickAdd.value;
            const kbd = document.createElement('kbd');
            kbd.textContent = 'Enter';
            button.append(label, value, kbd);
            button.addEventListener('click', () => addQuickRule(quickAdd));
            ruleList.appendChild(button);
        }

        rules.forEach(rule => ruleList.appendChild(createRuleRow(rule, query)));

        if (!rules.length && !quickAdd) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            const text = document.createElement('div');

            if (!preset.rules.length) {
                text.textContent = tr.emptyRules;
                const hint = document.createElement('div');
                hint.className = 'rule-note';
                hint.style.whiteSpace = 'normal';
                hint.textContent = tr.emptyRulesHint;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn primary';
                button.textContent = tr.createRule;
                button.addEventListener('click', () => openRuleSheet(null));
                empty.append(text, hint, button);
            } else {
                text.textContent = query ? tr.emptySearch : tr.emptyTab;
                empty.appendChild(text);
            }
            ruleList.appendChild(empty);
        }

        // Counter and selection
        const total = preset.rules.length;
        ruleCount.textContent = rules.length === total ? tr.count(total) : tr.countFiltered(rules.length, total);
        editBtn.disabled = total === 0;

        const visibleIds = rules.map(rule => rule.id);
        const selectedVisible = visibleIds.filter(id => ui.selected.has(id)).length;
        selectedCount.textContent = ui.selected.size ? tr.selected(ui.selected.size) : tr.selectAll;
        selectAll.checked = visibleIds.length > 0 && selectedVisible === visibleIds.length;
        selectAll.indeterminate = selectedVisible > 0 && selectedVisible < visibleIds.length;
        [bulkEnableBtn, bulkDisableBtn, bulkDeleteBtn].forEach(button => {
            button.disabled = ui.selected.size === 0;
        });
    }

    function createRuleRow(rule, query) {
        const tr = t();
        const label = ruleLabel(rule);

        const row = document.createElement('div');
        row.className = 'rule';
        row.setAttribute('role', 'listitem');
        row.dataset.id = rule.id;
        row.dataset.type = rule.type;
        row.classList.toggle('is-off', !rule.enabled);
        row.classList.toggle('is-new', ui.newIds.has(rule.id));
        row.classList.toggle('is-selected', ui.editMode && ui.selected.has(rule.id));

        if (ui.editMode) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = ui.selected.has(rule.id);
            checkbox.setAttribute('aria-label', label);
            checkbox.addEventListener('change', () => toggleSelected(rule.id));
            row.appendChild(checkbox);
        }

        const chip = document.createElement('span');
        chip.className = 'type-chip';
        chip.dataset.type = rule.type;
        chip.innerHTML = typeIcon(rule.type, 10);
        const chipText = document.createElement('span');
        chipText.textContent = tr.types[rule.type];
        chip.appendChild(chipText);

        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'action-btn';
        actionBtn.dataset.action = rule.action;
        actionBtn.innerHTML = rule.action === 'include' ? ICONS.plus : ICONS.minus;
        setLabel(actionBtn, rule.action === 'include' ? tr.includeHint : tr.excludeHint);
        actionBtn.addEventListener('click', () => flipAction(rule.id));

        const main = document.createElement('div');
        main.className = 'rule-main';
        const valueLine = document.createElement('div');
        valueLine.className = 'rule-value';
        const valueText = document.createElement('span');
        valueText.className = 'rule-value-text';
        valueText.title = label;
        appendHighlighted(valueText, label, query);
        valueLine.appendChild(valueText);

        if (rule.type === 'role') {
            const badge = document.createElement('span');
            badge.className = 'role-badge';
            badge.style.setProperty('--role-color', ROLE_BADGES[rule.value].color);
            badge.innerHTML = ICONS.role(ROLE_BADGES[rule.value].icon);
            valueLine.appendChild(badge);
        }
        main.appendChild(valueLine);

        if (rule.note) {
            const note = document.createElement('div');
            note.className = 'rule-note';
            note.title = rule.note;
            appendHighlighted(note, rule.note, query);
            main.appendChild(note);
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'switch';
        toggle.setAttribute('role', 'switch');
        toggle.setAttribute('aria-checked', String(rule.enabled));
        toggle.setAttribute('aria-label', tr.toggleRule(label));
        toggle.addEventListener('click', () => toggleRule(rule.id));

        row.append(chip, actionBtn, main, toggle);

        if (!ui.editMode) {
            const moreBtn = document.createElement('button');
            moreBtn.type = 'button';
            moreBtn.className = 'icon-btn';
            moreBtn.innerHTML = ICONS.more;
            moreBtn.setAttribute('aria-haspopup', 'menu');
            setLabel(moreBtn, tr.more);
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openRuleMenu(rule.id, moreBtn);
            });
            row.appendChild(moreBtn);
        }

        // Click on a row: select it in selection mode, otherwise edit it
        row.addEventListener('click', (e) => {
            if (e.target.closest('button, input')) return;
            if (ui.editMode) {
                toggleSelected(rule.id);
            } else {
                openRuleSheet(rule);
            }
        });

        return row;
    }

    // Text with the matching part highlighted (without innerHTML)
    function appendHighlighted(parent, text, query) {
        const index = query ? text.toLowerCase().indexOf(query) : -1;
        if (index < 0) {
            parent.textContent = text;
            return;
        }
        const mark = document.createElement('mark');
        mark.textContent = text.slice(index, index + query.length);
        parent.append(text.slice(0, index), mark, text.slice(index + query.length));
    }

    function setLabel(element, label) {
        element.title = label;
        element.setAttribute('aria-label', label);
    }

    // --- Rule actions ---------------------------------------------------------

    function toggleRule(id) {
        const rule = findRule(id);
        if (!rule) return;
        rule.enabled = !rule.enabled;
        persist();
        renderList();
        renderBanner();
    }

    function flipAction(id) {
        const rule = findRule(id);
        if (!rule) return;
        rule.action = rule.action === 'include' ? 'exclude' : 'include';
        persist();
        renderList();
        renderBanner();
    }

    function deleteRules(ids) {
        if (!ids.length) return;
        const before = snapshot();
        const preset = viewedPreset();
        const deleted = preset.rules.filter(rule => ids.includes(rule.id));
        preset.rules = preset.rules.filter(rule => !ids.includes(rule.id));
        ids.forEach(id => ui.selected.delete(id));
        if (!preset.rules.length) setEditMode(false);

        persist();
        render();
        showToast(
            deleted.length === 1 ? t().ruleDeleted(ruleLabel(deleted[0])) : t().rulesDeleted(deleted.length),
            () => restore(before)
        );
    }

    function addRules(rules) {
        const preset = viewedPreset();
        const now = Date.now();
        const created = rules
            .map((rule, i) => FilterStore.normalizeRule({ ...rule, id: null, updated: now + i }))
            .filter(Boolean);
        preset.rules.push(...created);
        ui.newIds = new Set(created.map(rule => rule.id));
        setTimeout(() => {
            ui.newIds.clear();
            ruleList.querySelectorAll('.rule.is-new').forEach(row => row.classList.remove('is-new'));
        }, 1500);
        return created;
    }

    function addQuickRule(quickAdd) {
        const [created] = addRules([{ type: quickAdd.type, value: quickAdd.value, action: 'include' }]);
        ui.query = '';
        searchInput.value = '';
        clearSearchBtn.hidden = true;
        persist();
        render();
        scrollToRule(created && created.id);
        searchInput.focus();
    }

    function scrollToRule(id) {
        const row = id && ruleList.querySelector(`[data-id="${id}"]`);
        if (row) row.scrollIntoView({ block: 'nearest' });
    }

    // --- Selection mode -------------------------------------------------------

    function setEditMode(on) {
        ui.editMode = on;
        ui.selected.clear();
        footer.hidden = on;
        bulkFooter.hidden = !on;
        renderList();
    }

    function toggleSelected(id) {
        if (ui.selected.has(id)) {
            ui.selected.delete(id);
        } else {
            ui.selected.add(id);
        }
        renderList();
    }

    editBtn.addEventListener('click', () => setEditMode(true));
    doneBtn.addEventListener('click', () => setEditMode(false));

    selectAll.addEventListener('change', function () {
        const ids = visibleRules().map(rule => rule.id);
        if (selectAll.checked) {
            ids.forEach(id => ui.selected.add(id));
        } else {
            ids.forEach(id => ui.selected.delete(id));
        }
        renderList();
    });

    function setSelectedEnabled(enabled) {
        viewedPreset().rules.forEach(rule => {
            if (ui.selected.has(rule.id)) rule.enabled = enabled;
        });
        persist();
        renderList();
        renderBanner();
    }

    bulkEnableBtn.addEventListener('click', () => setSelectedEnabled(true));
    bulkDisableBtn.addEventListener('click', () => setSelectedEnabled(false));
    bulkDeleteBtn.addEventListener('click', () => deleteRules([...ui.selected]));

    // --- Search, sorting, tabs ------------------------------------------------

    searchInput.addEventListener('input', function () {
        ui.query = searchInput.value;
        clearSearchBtn.hidden = !searchInput.value;
        renderList();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const quickAdd = getQuickAdd();
            if (quickAdd) addQuickRule(quickAdd);
        }
    });

    clearSearchBtn.addEventListener('click', function () {
        searchInput.value = '';
        ui.query = '';
        clearSearchBtn.hidden = true;
        renderList();
        searchInput.focus();
    });

    sortSelect.addEventListener('change', function () {
        ui.sort = sortSelect.value;
        saveUiState();
        renderList();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            ui.tab = button.dataset.tab;
            saveUiState();
            renderTabs();
            renderList();
        });
    });

    function renderTabs() {
        tabButtons.forEach(button => {
            button.textContent = t().tabs[button.dataset.tab];
            button.setAttribute('aria-selected', String(button.dataset.tab === ui.tab));
        });
    }

    // --- Rule menu (⋮) ---------------------------------------------------------

    let menuRuleId = null;

    function openRuleMenu(id, anchor) {
        const rule = findRule(id);
        if (!rule) return;
        closeMenus();

        menuRuleId = id;
        $('flipLabel').textContent = rule.action === 'include' ? t().flipToExclude : t().flipToInclude;
        ruleMenu.hidden = false;
        anchor.closest('.rule').classList.add('menu-open');

        // Below the button, right-aligned; above it if it does not fit
        const rect = anchor.getBoundingClientRect();
        const menuRect = ruleMenu.getBoundingClientRect();
        let top = rect.bottom + 4;
        if (top + menuRect.height > window.innerHeight - 4) {
            top = Math.max(4, rect.top - menuRect.height - 4);
        }
        ruleMenu.style.top = `${top}px`;
        ruleMenu.style.left = `${Math.max(4, rect.right - menuRect.width)}px`;
        ruleMenu.querySelector('.menu-item').focus();
    }

    ruleMenu.addEventListener('click', function (e) {
        const item = e.target.closest('[data-command]');
        if (!item) return;
        const id = menuRuleId;
        closeMenus();

        const rule = findRule(id);
        if (!rule) return;
        switch (item.dataset.command) {
            case 'edit': openRuleSheet(rule); break;
            case 'flip': flipAction(id); break;
            case 'delete': deleteRules([id]); break;
        }
    });

    // --- Presets ----------------------------------------------------------------

    presetBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (presetMenu.hidden) {
            closeMenus();
            renderPresetMenu();
            presetMenu.hidden = false;
            presetBtn.setAttribute('aria-expanded', 'true');
            presetItems.querySelector('[aria-checked="true"]')?.focus();
        } else {
            closeMenus();
        }
    });

    const isChannelBound = channel =>
        Boolean(channel) && state.presets.some(preset => preset.channels.includes(channel));

    // Where a preset applies: bound — on the open channel via binding, default —
    // as the default (here too), unused — not applied here
    function presetUsage(preset) {
        if (currentChannel && preset.channels.includes(currentChannel)) return 'bound';
        if (preset.id === state.activePresetId && !isChannelBound(currentChannel)) return 'default';
        return 'unused';
    }

    function renderPresetMenu() {
        const tr = t();
        const viewed = viewedPreset();
        presetItems.textContent = '';

        state.presets.forEach(preset => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'menu-item preset-item';
            item.setAttribute('role', 'menuitemradio');
            item.setAttribute('aria-checked', String(preset.id === viewed.id));
            item.innerHTML = ICONS.check;

            const text = document.createElement('span');
            text.className = 'preset-item-text';
            const name = document.createElement('span');
            name.className = 'preset-item-name';
            name.textContent = preset.name;
            text.appendChild(name);

            // Bound channels and the default preset mark
            const metaParts = [];
            if (preset.id === state.activePresetId) metaParts.push([ICONS.star, tr.metaDefault]);
            if (preset.channels.length) metaParts.push([ICONS.link, preset.channels.join(', ')]);
            metaParts.forEach(([icon, label]) => {
                const meta = document.createElement('span');
                meta.className = 'preset-item-meta';
                meta.innerHTML = icon;
                meta.append(label);
                meta.title = label;
                text.appendChild(meta);
            });

            const count = document.createElement('span');
            count.className = 'preset-item-count';
            count.textContent = preset.rules.length;

            item.append(text, count);
            item.addEventListener('click', () => selectPreset(preset.id));
            presetItems.appendChild(item);
        });

        // Binding to the open channel
        const bindBtn = $('bindPresetBtn');
        bindBtn.hidden = !currentChannel;
        if (currentChannel) {
            $('bindPresetLabel').textContent = viewed.channels.includes(currentChannel)
                ? tr.unbindFrom(currentChannel)
                : tr.bindTo(currentChannel);
        }

        $('defaultPresetBtn').hidden = viewed.id === state.activePresetId;
        $('deletePresetBtn').disabled = state.presets.length < 2;
        presetMenu.setAttribute('aria-label', tr.presets);
    }

    // Choosing a preset in the menu. If the open channel has no preset of its own,
    // the chosen one becomes the default, so it applies right away
    function selectPreset(id) {
        closeMenus();
        ui.viewPresetId = id;
        ui.selected.clear();
        if (!isChannelBound(currentChannel)) {
            state.activePresetId = id;
        }
        persist();
        render();
    }

    // A channel is bound to at most one preset
    function bindChannels(preset, channels) {
        state.presets.forEach(other => {
            if (other !== preset) {
                other.channels = other.channels.filter(channel => !channels.includes(channel));
            }
        });
        preset.channels = channels;
    }

    $('bindPresetBtn').addEventListener('click', function () {
        if (!currentChannel) return;
        closeMenus();
        const preset = viewedPreset();
        if (preset.channels.includes(currentChannel)) {
            preset.channels = preset.channels.filter(channel => channel !== currentChannel);
        } else {
            bindChannels(preset, [...preset.channels, currentChannel]);
        }
        persist();
        render();
    });

    $('defaultPresetBtn').addEventListener('click', function () {
        closeMenus();
        state.activePresetId = viewedPreset().id;
        persist();
        render();
    });

    $('newPresetBtn').addEventListener('click', () => openPresetSheet('new'));
    $('duplicatePresetBtn').addEventListener('click', () => openPresetSheet('duplicate'));
    $('presetSettingsBtn').addEventListener('click', () => openPresetSheet('settings'));

    $('deletePresetBtn').addEventListener('click', function () {
        if (state.presets.length < 2) return;
        closeMenus();

        const before = snapshot();
        const preset = viewedPreset();
        state.presets = state.presets.filter(p => p.id !== preset.id);
        if (state.activePresetId === preset.id) {
            state.activePresetId = state.presets[0].id;
        }
        ui.viewPresetId = effectivePreset().id;
        ui.selected.clear();
        persist();
        render();
        showToast(t().presetDeleted(preset.name), () => restore(before));
    });

    // Name without repeats: "Preset", "Preset 2", "Preset 3"
    function uniquePresetName(name) {
        const names = new Set(state.presets.map(preset => preset.name));
        if (!names.has(name)) return name;
        let n = 2;
        while (names.has(`${name} ${n}`)) n++;
        return `${name} ${n}`;
    }

    // --- Export and import ------------------------------------------------------

    $('exportPresetBtn').addEventListener('click', async function () {
        closeMenus();
        try {
            await navigator.clipboard.writeText(FilterStore.exportPreset(viewedPreset()));
            showToast(t().presetCopied);
        } catch (error) {
            showToast(t().clipboardError);
        }
    });

    $('importPresetBtn').addEventListener('click', async function () {
        closeMenus();
        importInput.value = '';
        importError.textContent = '';
        importInput.removeAttribute('aria-invalid');
        openSheet(importSheet, presetBtn);
        importInput.focus();

        // If the browser allows it, paste the preset from the clipboard right away
        try {
            const text = await navigator.clipboard.readText();
            if (!importInput.value && FilterStore.parsePreset(text)) {
                importInput.value = text;
            }
        } catch (error) {
            // No access: the user pastes it manually (Ctrl+V)
        }
    });

    importInput.addEventListener('input', function () {
        importError.textContent = '';
        importInput.removeAttribute('aria-invalid');
    });

    importForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const tr = t();
        const parsed = FilterStore.parsePreset(importInput.value);
        if (!parsed) {
            importError.textContent = tr.importInvalid;
            importInput.setAttribute('aria-invalid', 'true');
            importInput.focus();
            return;
        }

        const preset = {
            id: FilterStore.createId(),
            name: uniquePresetName(parsed.name || tr.importedName),
            rules: parsed.rules,
            channels: []
        };
        state.presets.push(preset);
        closeSheet(importSheet);
        selectPreset(preset.id);
        showToast(tr.imported(preset.rules.length));
    });

    $('importCancelBtn').addEventListener('click', () => closeSheet(importSheet));

    // --- Preset name and channels -------------------------------------------------

    let presetSheetMode = null;

    function openPresetSheet(mode) {
        const tr = t();
        closeMenus();
        presetSheetMode = mode;
        const viewed = viewedPreset();

        const titles = { new: tr.newPreset, duplicate: tr.duplicatePreset, settings: tr.presetSettings };
        $('presetSheetTitle').textContent = titles[mode];
        presetNameInput.value = mode === 'new' ? uniquePresetName(tr.presetDefaultName(state.presets.length + 1))
            : mode === 'duplicate' ? uniquePresetName(viewed.name + tr.copySuffix)
            : viewed.name;
        // Bindings are unique, so a copy has none
        presetChannelsInput.value = mode === 'settings' ? viewed.channels.join(', ') : '';
        [presetNameInput, presetChannelsInput].forEach(input => input.removeAttribute('aria-invalid'));
        presetError.textContent = '';
        presetChannelsError.textContent = '';

        openSheet(presetSheet, presetBtn);
        presetNameInput.select();
    }

    presetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const tr = t();
        const name = presetNameInput.value.trim();
        if (!name) {
            presetError.textContent = tr.presetNameRequired;
            presetNameInput.setAttribute('aria-invalid', 'true');
            presetNameInput.focus();
            return;
        }

        const channels = presetChannelsInput.value.split(/[\s,;]+/)
            .map(value => FilterStore.normalizeLogin(value))
            .filter((channel, i, all) => channel && all.indexOf(channel) === i);
        const invalid = channels.filter(channel => !LOGIN_PATTERN.test(channel));
        if (invalid.length) {
            presetChannelsError.textContent = tr.invalidChannels(invalid);
            presetChannelsInput.setAttribute('aria-invalid', 'true');
            presetChannelsInput.focus();
            return;
        }

        let preset;
        if (presetSheetMode === 'settings') {
            preset = viewedPreset();
            preset.name = name;
        } else {
            const rules = presetSheetMode === 'duplicate'
                ? viewedPreset().rules.map(rule => ({ ...rule, id: FilterStore.createId() }))
                : [];
            preset = { id: FilterStore.createId(), name, rules, channels: [] };
            state.presets.push(preset);
        }
        bindChannels(preset, channels);

        closeSheet(presetSheet);
        if (presetSheetMode === 'settings') {
            persist();
            render();
        } else {
            selectPreset(preset.id);
        }
    });

    $('presetCancelBtn').addEventListener('click', () => closeSheet(presetSheet));
    presetChannelsInput.addEventListener('input', function () {
        presetChannelsError.textContent = '';
        presetChannelsInput.removeAttribute('aria-invalid');
    });

    // --- Rule editor ------------------------------------------------------------

    // ruleId: the rule being edited (null for a new one)
    const editor = { ruleId: null, type: 'user', action: 'include', roles: new Set() };

    function createRolePicker() {
        Object.keys(ROLE_BADGES).forEach(roleId => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'role';
            button.dataset.role = roleId;
            button.style.setProperty('--role-color', ROLE_BADGES[roleId].color);
            button.innerHTML = `<span class="role-icon">${ICONS.role(ROLE_BADGES[roleId].icon).replace(/width="12" height="12"/, 'width="14" height="14"')}</span><span class="role-name"></span>`;
            button.addEventListener('click', function () {
                if (editor.ruleId) {
                    // One rule, one role
                    editor.roles = new Set([roleId]);
                } else if (editor.roles.has(roleId)) {
                    editor.roles.delete(roleId);
                } else {
                    editor.roles.add(roleId);
                }
                roleError.textContent = '';
                renderEditor();
            });
            rolePicker.appendChild(button);
        });
    }

    // rule: the rule being edited (null for a new one)
    function openRuleSheet(rule) {
        closeMenus();
        const source = rule;

        editor.ruleId = rule ? rule.id : null;
        editor.type = source ? source.type : (ui.tab === 'all' ? 'user' : ui.tab);
        editor.action = source ? source.action : 'include';
        editor.roles = new Set(source && source.type === 'role' ? [source.value] : []);

        valueInput.value = source && source.type !== 'role' ? source.value : '';
        noteInput.value = source ? source.note : '';
        valueError.textContent = '';
        roleError.textContent = '';
        valueInput.removeAttribute('aria-invalid');

        renderEditor();
        openSheet(ruleSheet, rule ? ruleList.querySelector(`[data-id="${rule.id}"] .icon-btn`) : createBtn);
        if (editor.type !== 'role') valueInput.focus();
    }

    function renderEditor() {
        const tr = t();
        const isEdit = Boolean(editor.ruleId);

        $('ruleSheetTitle').textContent = isEdit ? tr.editRuleTitle : tr.newRule;
        $('ruleSaveBtn').textContent = isEdit ? tr.save : tr.add;

        typeSeg.querySelectorAll('[data-type]').forEach(button => {
            button.innerHTML = `${typeIcon(button.dataset.type, 12)}<span></span>`;
            button.lastChild.textContent = tr.types[button.dataset.type];
            button.setAttribute('aria-checked', String(button.dataset.type === editor.type));
        });
        actionSeg.querySelectorAll('[data-action]').forEach(button => {
            button.setAttribute('aria-checked', String(button.dataset.action === editor.action));
        });

        const isRole = editor.type === 'role';
        valueField.hidden = isRole;
        roleField.hidden = !isRole;

        if (!isRole) {
            $('valueLabel').textContent = tr.valueLabels[editor.type];
            valueInput.placeholder = tr.valuePlaceholders[editor.type];
            // Several usernames at once only when creating
            $('valueHint').textContent = editor.type === 'user' && isEdit ? '' : tr.valueHints[editor.type];
            if (editor.type === 'badge') {
                valueInput.setAttribute('list', 'badgeSuggestions');
            } else {
                valueInput.removeAttribute('list');
            }
        } else {
            $('roleLabel').textContent = isEdit ? tr.roleLabel : tr.rolesLabel;
            rolePicker.querySelectorAll('.role').forEach(button => {
                const roleId = button.dataset.role;
                button.querySelector('.role-name').textContent = tr.roleNames[roleId];
                button.setAttribute('aria-pressed', String(editor.roles.has(roleId)));
                // Roles that already have a rule cannot be selected
                const exists = ruleExists('role', roleId, editor.ruleId);
                button.disabled = exists;
                button.title = exists ? tr.duplicate : '';
            });
        }

        noteInput.placeholder = tr.notePlaceholder;
    }

    typeSeg.addEventListener('click', function (e) {
        const button = e.target.closest('[data-type]');
        if (!button) return;
        editor.type = button.dataset.type;
        valueError.textContent = '';
        valueInput.removeAttribute('aria-invalid');
        renderEditor();
        if (editor.type !== 'role') valueInput.focus();
    });

    actionSeg.addEventListener('click', function (e) {
        const button = e.target.closest('[data-action]');
        if (!button) return;
        editor.action = button.dataset.action;
        renderEditor();
    });

    valueInput.addEventListener('input', function () {
        valueError.textContent = '';
        valueInput.removeAttribute('aria-invalid');
    });

    function showValueError(text) {
        valueError.textContent = text;
        valueInput.setAttribute('aria-invalid', 'true');
        valueInput.focus();
    }

    // Values from the form: several for new usernames and roles, otherwise one.
    // Returns null and shows an error if it cannot be saved
    function collectValues() {
        const tr = t();
        const isEdit = Boolean(editor.ruleId);

        if (editor.type === 'role') {
            const roles = [...editor.roles].filter(role => !ruleExists('role', role, editor.ruleId));
            if (!roles.length) {
                roleError.textContent = tr.pickRole;
                return null;
            }
            return roles;
        }

        const raw = valueInput.value.trim();
        if (!raw) {
            showValueError(tr.required);
            return null;
        }

        if (editor.type === 'user') {
            const names = (isEdit ? [raw] : raw.split(/[\s,;]+/))
                .map(value => FilterStore.normalizeLogin(value))
                .filter((name, i, all) => name && all.indexOf(name) === i);
            const invalid = names.filter(name => !LOGIN_PATTERN.test(name));
            if (invalid.length) {
                showValueError(tr.invalidUser(invalid));
                return null;
            }
            const fresh = names.filter(name => !ruleExists('user', name, editor.ruleId));
            if (!fresh.length) {
                showValueError(tr.duplicate);
                return null;
            }
            return fresh;
        }

        if (ruleExists(editor.type, raw, editor.ruleId)) {
            showValueError(tr.duplicate);
            return null;
        }
        return [raw];
    }

    ruleForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const values = collectValues();
        if (!values) return;

        const note = noteInput.value.trim();
        let focusId;

        if (editor.ruleId) {
            const rule = findRule(editor.ruleId);
            if (rule) {
                Object.assign(rule, FilterStore.normalizeRule({
                    ...rule,
                    type: editor.type,
                    value: values[0],
                    action: editor.action,
                    note,
                    updated: Date.now()
                }));
                focusId = rule.id;
            }
        } else {
            const created = addRules(values.map(value => ({
                type: editor.type,
                value,
                action: editor.action,
                note
            })));
            focusId = created[0] && created[0].id;

            // The new rule must be visible in the current tab
            if (ui.tab !== 'all' && ui.tab !== editor.type) {
                ui.tab = editor.type;
                saveUiState();
            }
        }

        closeSheet(ruleSheet);
        persist();
        render();
        scrollToRule(focusId);
    });

    $('ruleCancelBtn').addEventListener('click', () => closeSheet(ruleSheet));
    createBtn.addEventListener('click', () => openRuleSheet(null));

    // --- Settings page -----------------------------------------------------------

    function showSettings(show) {
        closeMenus();
        mainView.hidden = show;
        settingsView.hidden = !show;
        (show ? backBtn : settingsBtn).focus();
    }

    settingsBtn.addEventListener('click', () => showSettings(true));
    backBtn.addEventListener('click', () => showSettings(false));

    function renderSettings() {
        const tr = t();
        const resolved = LANGUAGES.find(lang => lang.code === uiLanguage()) || LANGUAGES[0];
        $('languageName').textContent = state.language === SYSTEM_LANGUAGE ? tr.systemLanguage : resolved.name;
        $('timestampName').textContent = tr.timestampFormats[state.timestampFormat];
        $('versionValue').textContent = tr.version(chrome.runtime.getManifest().version);
        setLabel(settingsBtn, tr.settings);
        setLabel(backBtn, tr.back);
    }

    // Dropdown choice below a button. options: { value, label, hint, code, lang,
    // separatorAfter }; clicking the button again closes the list
    let choiceOpener = null;

    function openChoiceMenu(button, options, selected, onSelect) {
        if (choiceOpener === button) {
            closeMenus();
            return;
        }
        closeMenus();

        choiceMenu.textContent = '';
        options.forEach(option => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'menu-item';
            item.setAttribute('role', 'menuitemradio');
            item.setAttribute('aria-checked', String(option.value === selected));
            if (option.lang) item.lang = option.lang;
            item.innerHTML = ICONS.check;

            const text = document.createElement('span');
            text.className = 'preset-item-text';
            text.textContent = option.label;
            if (option.hint) {
                const hint = document.createElement('span');
                hint.className = 'preset-item-meta';
                hint.textContent = option.hint;
                text.appendChild(hint);
            }
            item.appendChild(text);

            if (option.code) {
                const code = document.createElement('span');
                code.className = 'language-code';
                code.textContent = option.code;
                item.appendChild(code);
            }

            item.addEventListener('click', function () {
                closeMenus();
                onSelect(option.value);
                persist();
                render();
                button.focus();
            });
            choiceMenu.appendChild(item);

            if (option.separatorAfter) {
                const sep = document.createElement('div');
                sep.className = 'menu-sep';
                choiceMenu.appendChild(sep);
            }
        });

        choiceOpener = button;
        choiceMenu.hidden = false;
        button.setAttribute('aria-expanded', 'true');

        // Below the button, right-aligned
        const rect = button.getBoundingClientRect();
        choiceMenu.style.top = `${rect.bottom + 4}px`;
        choiceMenu.style.left = `${Math.max(4, rect.right - choiceMenu.getBoundingClientRect().width)}px`;
        choiceMenu.querySelector('[aria-checked="true"]')?.focus();
    }

    // Language: "System" first (the default), then the languages, named in those
    // languages
    languageBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const systemName = (LANGUAGES.find(lang => lang.code === FilterStore.resolveLanguage(SYSTEM_LANGUAGE)) ||
            LANGUAGES[0]).name;
        openChoiceMenu(languageBtn, [
            {
                value: SYSTEM_LANGUAGE,
                label: t().systemLanguage,
                hint: t().systemLanguageHint(systemName),
                separatorAfter: true
            },
            ...LANGUAGES.map(lang => ({ value: lang.code, label: lang.name, code: lang.code, lang: lang.code }))
        ], state.language, value => {
            state.language = value;
        });
    });

    // Message time: the hint shows how it looks right now
    timestampBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const tr = t();
        const now = Date.now();
        openChoiceMenu(timestampBtn, TIMESTAMP_FORMATS.map(format => ({
            value: format,
            label: tr.timestampFormats[format],
            hint: format === 'off' ? '' : FilterStore.formatTime(now, format)
        })), state.timestampFormat, value => {
            state.timestampFormat = value;
        });
    });

    // --- Sheets, menus, keyboard ----------------------------------------------

    let sheetOpener = null;

    function openSheet(sheet, opener) {
        sheetOpener = opener;
        sheet.hidden = false;
    }

    function closeSheet(sheet) {
        sheet.hidden = true;
        if (sheetOpener && sheetOpener.isConnected) sheetOpener.focus();
        sheetOpener = null;
    }

    // Clicking the backdrop closes the sheet
    [ruleSheet, presetSheet, importSheet].forEach(sheet => {
        sheet.addEventListener('mousedown', function (e) {
            if (e.target === sheet) closeSheet(sheet);
        });
    });

    function closeMenus() {
        presetMenu.hidden = true;
        ruleMenu.hidden = true;
        choiceMenu.hidden = true;
        presetBtn.setAttribute('aria-expanded', 'false');
        if (choiceOpener) choiceOpener.setAttribute('aria-expanded', 'false');
        choiceOpener = null;
        ruleList.querySelectorAll('.menu-open').forEach(row => row.classList.remove('menu-open'));
        menuRuleId = null;
    }

    document.addEventListener('mousedown', function (e) {
        if (!e.target.closest('.menu, #presetBtn, .dropdown-btn')) closeMenus();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        const openSheetEl = [ruleSheet, presetSheet, importSheet].find(sheet => !sheet.hidden);
        if (openSheetEl) {
            closeSheet(openSheetEl);
        } else if (!presetMenu.hidden || !ruleMenu.hidden || !choiceMenu.hidden) {
            closeMenus();
        } else if (!settingsView.hidden) {
            showSettings(false);
        } else if (ui.editMode) {
            setEditMode(false);
        } else if (searchInput.value) {
            clearSearchBtn.click();
        } else {
            return;
        }
        e.preventDefault();
    });

    // --- Toast with undo --------------------------------------------------------

    let undoAction = null;
    let toastTimer = null;

    function showToast(text, onUndo) {
        undoAction = onUndo || null;
        toastText.textContent = text;
        toastUndo.hidden = !onUndo;
        toast.classList.add('visible');

        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, 5000);
    }

    function hideToast() {
        toast.classList.remove('visible');
        undoAction = null;
    }

    toastUndo.addEventListener('click', function () {
        if (undoAction) undoAction();
        hideToast();
    });

    // --- Full render ------------------------------------------------------------

    toggleFilterBtn.addEventListener('click', function () {
        state.isFilterEnabled = !state.isFilterEnabled;
        persist();
        renderHeader();
        renderBanner();
    });

    function renderHeader() {
        const tr = t();
        const viewed = viewedPreset();
        presetName.textContent = viewed.name;
        presetBtn.title = tr.presets;

        const usage = presetUsage(viewed);
        presetStatus.dataset.state = usage;
        presetStatus.innerHTML = usage === 'bound' ? ICONS.link : '';
        presetStatus.append(usage === 'bound' ? tr.statusBound(currentChannel)
            : usage === 'default' ? tr.statusDefault
            : tr.statusUnused(currentChannel));
        toggleFilterBtn.setAttribute('aria-checked', String(state.isFilterEnabled));
        setLabel(toggleFilterBtn, `${state.isFilterEnabled ? tr.switchOn : tr.switchOff}. ${tr.switchHint}`);
    }

    function renderBanner() {
        const tr = t();
        const hasInclude = viewedPreset().rules.some(rule => rule.enabled && rule.action === 'include');

        if (!state.isFilterEnabled) {
            banner.hidden = false;
            banner.dataset.type = '';
            banner.textContent = tr.bannerOff;
        } else if (!hasInclude && viewedPreset().rules.length) {
            banner.hidden = false;
            banner.dataset.type = 'warning';
            banner.textContent = tr.bannerNoInclude;
        } else {
            banner.hidden = true;
        }
    }

    function render() {
        const tr = t();
        document.documentElement.lang = uiLanguage();
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = tr[el.dataset.i18n];
        });

        searchInput.placeholder = tr.search;
        searchInput.setAttribute('aria-label', tr.search);
        setLabel(clearSearchBtn, tr.clearSearch);
        setLabel(bulkEnableBtn, tr.bulkEnable);
        setLabel(bulkDisableBtn, tr.bulkDisable);
        setLabel(bulkDeleteBtn, tr.bulkDelete);
        $('includeMark').innerHTML = ICONS.plus;
        $('excludeMark').innerHTML = ICONS.minus;

        sortSelect.textContent = '';
        Object.entries(tr.sort).forEach(([value, label]) => {
            sortSelect.appendChild(new Option(label, value, false, value === ui.sort));
        });
        sortSelect.setAttribute('aria-label', tr.sort[ui.sort]);

        const suggestions = $('badgeSuggestions');
        suggestions.textContent = '';
        tr.badgeSuggestions.forEach(name => suggestions.appendChild(new Option(name)));

        footer.hidden = ui.editMode;
        bulkFooter.hidden = !ui.editMode;

        renderHeader();
        renderTabs();
        renderBanner();
        renderList();
        renderSettings();
    }

    // --- Startup ----------------------------------------------------------------

    createRolePicker();

    try {
        state = await FilterStore.loadAndMigrate();
    } catch (error) {
        state = FilterStore.normalizeState({});
    }

    // The tab URL is available thanks to host_permissions for twitch.tv
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentChannel = FilterStore.channelFromUrl(tab && tab.url || '');
    } catch (error) {
        // No access to the tab: show the default preset
    }
    ui.viewPresetId = effectivePreset().id;

    render();
    searchInput.focus();
});
