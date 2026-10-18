// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Risher. Licensed under GPL-3.0-only, see LICENSE

// Shared by the popup and the content script: roles, rules, presets and their
// storage in chrome.storage.sync. Top-level names are declared with var: after
// an extension update background.js injects the scripts into open tabs again,
// and a repeated const would be a "has already been declared" error

// Roles are detected by the badges in a message: first by the global badge ID
// in the image URL, then by its name (alt). Names are localized, so the
// keywords are in English and Russian. logins: well-known logins (most bots
// have no badge). color and icon (20×20) are for the popup UI
var ROLE_BADGES = {
    broadcaster: {
        ids: ['5527c58c-fb7d-422d-b71b-f309dcb85cc1'],
        names: /broadcaster|стример|автор трансляции|вещатель/i,
        color: '#e91916',
        icon: 'M3 5h9a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm11 3.5 4-2.5v8l-4-2.5v-3Z'
    },
    moderator: {
        ids: ['3267646d-33f0-4b17-b3df-f923a41db1d0'],
        names: /moderator|модератор/i,
        color: '#00ad03',
        icon: 'M10 2 3 5v4.5c0 4 3 7.3 7 8.5 4-1.2 7-4.5 7-8.5V5l-7-3Z'
    },
    vip: {
        ids: ['b817aba4-fad8-49e2-b88a-7cc744dfa6ec'],
        names: /\bvip\b/i,
        color: '#e005b9',
        icon: 'M5 3h10l3 5-8 10L2 8l3-5Z'
    },
    verified: {
        ids: ['d12a2e27-16f6-41d0-ab77-b780518f00a3'],
        names: /verified|partner|подтвержд|партн[её]р/i,
        color: '#9146ff',
        icon: 'M10 1.5l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.1L10 18.5l-2.2-1.6-2.7.1-.9-2.6L2 12.8l.9-2.6L2 7.6l2.2-1.6.9-2.6 2.7.1L10 1.5Zm-1 11.3 4.7-4.7-1.4-1.4L9 10 7.2 8.2 5.8 9.6 9 12.8Z'
    },
    subscriber: {
        ids: ['5d9f2208-5dd8-11e7-8513-2ff4adfae661', '511b78a9-ab37-472f-9569-457753bbe7d3'],
        names: /subscriber|founder|подписчик|основатель/i,
        color: '#e6a100',
        icon: 'M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8L10 1.8Z'
    },
    staff: {
        ids: [
            'd97c37bd-a6f5-4c38-8f76-0d0f5d7a7b9f',
            '9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe',
            '9384c43e-4ce7-4e94-b2a1-b93656896eba'
        ],
        names: /staff|admin|global mod|сотрудник|администратор|глобальный модератор/i,
        color: '#1f69ff',
        icon: 'M13.5 2a4.5 4.5 0 0 0-4.3 5.8l-6.6 6.6a1.4 1.4 0 0 0 0 2l1 1a1.4 1.4 0 0 0 2 0l6.6-6.6A4.5 4.5 0 0 0 18 6.5l-2.7 2.7-2.5-.1-.1-2.5 2.8-2.7A4.5 4.5 0 0 0 13.5 2Z'
    },
    chatbot: {
        ids: [],
        names: /chat ?bot|чат-?бот/i,
        logins: [
            'nightbot', 'streamelements', 'moobot', 'fossabot', 'streamlabs', 'wizebot',
            'sery_bot', 'botrixoficial', 'soundalerts', 'kofistreambot', 'frostytoolsdotcom',
            'own3d', 'pretzelrocks', 'blerp', 'deepbot', 'phantombot', 'coebot', 'streamholics',
            'creatisbot', 'songlistbot', 'mixitupapp', 'lumiastream', 'dixperbro', 'streamerbot',
            'tangiabot', 'sessionbot', 'pokemoncommunitygame', 'supibot', 'buttsbot'
        ],
        color: '#14b8a6',
        icon: 'M9 2h2v2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4V2ZM7 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM1 8h1v4H1V8Zm17 0h1v4h-1V8Z'
    }
};

// Rule: { id, type, value, mode, action: include|exclude, enabled, note,
//         updated, conditions, notify }
//   role    — a key of ROLE_BADGES
//   user    — author login
//   badge   — part of any badge name
//   keyword — the message text, see KEYWORD_MODES
// conditions: up to MAX_CONDITIONS more { type, value, mode } that must match
// too (AND), e.g. "moderator" and "mentions me". notify: a sound / desktop
// notification when a new message is shown by this rule
// The order is the order of types in the UI
var RULE_TYPES = ['role', 'user', 'badge', 'keyword'];

// How a keyword is matched: a part of the text, a whole word, a regular
// expression, or a mention of a user (value: login or MENTION_ME, the user
// of the extension)
var KEYWORD_MODES = ['contains', 'word', 'regex', 'mention'];
var MENTION_ME = '@me';
var MAX_CONDITIONS = 2;

// Preset: { id, name, rules, channels }. channels: logins of the channels
// where the preset turns on automatically. A channel is bound to at most one
// preset; other channels use activePresetId

// Twitch login: Latin letters, digits and underscore, up to 25 characters
var LOGIN_PATTERN = /^[a-z0-9_]{1,25}$/;

// twitch.tv sections that are not channels
var RESERVED_PATHS = [
    'videos', 'directory', 'downloads', 'settings', 'wallet', 'subscriptions',
    'inventory', 'drops', 'popout', 'moderator', 'u', 'search', 'turbo', 'prime', 'p', 'jobs'
];

var EXPORT_FORMAT = 'twitch-chat-filter-preset';

// Interface languages. A new language: a line here + translations in popup.js
// (translations) and content.js (TRANSLATIONS). Settings store a language code
// or 'system', the browser language (the default)
var SYSTEM_LANGUAGE = 'system';

// Message time in the filtered chat: short (11:23), with seconds (11:23:18) or
// hidden
var TIMESTAMP_FORMATS = ['short', 'full', 'off'];

// Settings that change only how the filtered chat looks: changing them does not
// filter the messages again
var VIEW_SETTINGS = ['language', 'autoCollapse', 'hideNames', 'notifySound', 'notifyDesktop', 'notifyScope', 'sendStatus'];

// What to notify about: every new message of the filtered chat, or only the
// messages of rules marked "notify"
var NOTIFY_SCOPES = ['all', 'rules'];

// Filtered chat history: messages per channel kept between page reloads
var HISTORY_LIMIT = 1000;

var LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' }
];

var FilterStore = {
    // chrome.storage.sync limits a single key to 8 KB, so the rules of a preset
    // are stored in chunks: rules_<preset id>_<chunk number>
    CHUNK_BYTES: 7000,

    createId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    // Interface language from the setting: 'system' is the browser language, or
    // English if there is no such translation
    resolveLanguage(language) {
        if (language !== SYSTEM_LANGUAGE) return language;

        let browserLanguage = '';
        try {
            browserLanguage = chrome.i18n.getUILanguage();
        } catch (error) {
            browserLanguage = typeof navigator !== 'undefined' ? navigator.language : '';
        }
        const code = String(browserLanguage || '').toLowerCase().split('-')[0];
        return LANGUAGES.some(lang => lang.code === code) ? code : 'en';
    },

    // Message time: hours always have two digits so the time column is even
    formatTime(time, format) {
        const date = new Date(time);
        const pad = n => String(n).padStart(2, '0');
        const short = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        return format === 'full' ? `${short}:${pad(date.getSeconds())}` : short;
    },

    defaultPresetName(language) {
        return this.resolveLanguage(language) === 'ru' ? 'Основной' : 'Default';
    },

    // Username, "@username" or a channel link twitch.tv/username
    normalizeLogin(value) {
        return String(value)
            .trim()
            .replace(/^(https?:\/\/)?(www\.|m\.)?twitch\.tv\//i, '')
            .replace(/^@/, '')
            .replace(/\/.*$/, '')
            .toLowerCase();
    },

    // Channel from a Twitch page URL (null if it is not a channel page)
    channelFromUrl(url) {
        let parsed;
        try {
            parsed = new URL(url);
        } catch (error) {
            return null;
        }
        if (!/(^|\.)twitch\.tv$/.test(parsed.hostname)) return null;

        const segments = parsed.pathname.split('/').filter(Boolean).map(s => s.toLowerCase());
        let channel = segments[0];
        if (channel === 'moderator') channel = segments[1];
        if (!channel || RESERVED_PATHS.includes(channel) || !LOGIN_PATTERN.test(channel)) return null;
        return channel;
    },

    // Preset for a channel: the one bound to it or the default preset
    getPresetForChannel(state, channel) {
        return (channel && state.presets.find(preset => preset.channels.includes(channel))) ||
            this.getActivePreset(state);
    },

    // A regular expression of a keyword rule: case-insensitive, Unicode. null if
    // it is not valid
    compileRegex(value) {
        try {
            return new RegExp(value, 'iu');
        } catch (error) {
            return null;
        }
    },

    // What a rule (or one of its conditions) checks: { type, value, mode }, or
    // null if it is not valid
    normalizeCondition(raw) {
        if (!raw || !RULE_TYPES.includes(raw.type)) return null;

        let value = String(raw.value ?? '').trim().slice(0, 100);
        const mode = raw.type === 'keyword' && KEYWORD_MODES.includes(raw.mode) ? raw.mode : 'contains';
        if (raw.type === 'user') value = value.toLowerCase();
        if (raw.type === 'role' && !(value in ROLE_BADGES)) return null;
        if (mode === 'mention') {
            // An empty mention is a mention of the user of the extension
            value = !value || value.toLowerCase() === MENTION_ME ? MENTION_ME : this.normalizeLogin(value);
            if (value !== MENTION_ME && !LOGIN_PATTERN.test(value)) return null;
        }
        if (mode === 'regex' && !this.compileRegex(value)) return null;
        if (!value) return null;

        return { type: raw.type, value, mode };
    },

    normalizeRule(raw) {
        const main = this.normalizeCondition(raw);
        if (!main) return null;

        // Extra conditions: valid ones, without repeats and without the rule itself
        const keys = new Set([this.conditionKey(main)]);
        const conditions = (Array.isArray(raw.conditions) ? raw.conditions : [])
            .map(condition => this.normalizeCondition(condition))
            .filter(condition => {
                if (!condition || keys.has(this.conditionKey(condition))) return false;
                keys.add(this.conditionKey(condition));
                return true;
            })
            .slice(0, MAX_CONDITIONS);

        return {
            id: String(raw.id || this.createId()),
            ...main,
            action: raw.action === 'exclude' ? 'exclude' : 'include',
            enabled: raw.enabled !== false,
            note: String(raw.note || '').trim().slice(0, 60),
            updated: Number(raw.updated) || Date.now(),
            conditions,
            notify: raw.notify === true
        };
    },

    conditionKey(condition) {
        return `${condition.type}:${condition.mode || 'contains'}:${String(condition.value).toLowerCase()}`;
    },

    // Rules that check the same thing are duplicates (the order of the extra
    // conditions does not matter)
    ruleKey(rule) {
        const extra = (rule.conditions || []).map(condition => this.conditionKey(condition)).sort();
        return [this.conditionKey(rule), ...extra].join('&');
    },

    // Identical rules are not duplicated
    normalizeRules(rawRules) {
        const seen = new Set();
        return (Array.isArray(rawRules) ? rawRules : [])
            .map(rule => this.normalizeRule(rule))
            .filter(rule => {
                if (!rule) return false;
                const key = this.ruleKey(rule);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    },

    // A check of one condition: a function of the message { login, text (lower
    // case), raw (as written), badges, ownLogin }. Built once per settings change
    compileCondition(condition) {
        const match = String(condition.value).toLowerCase();
        switch (condition.type) {
            case 'user':
                return message => message.login === match;
            case 'badge':
                return message => message.badges.some(badge => badge.name.toLowerCase().includes(match));
            case 'role': {
                const def = ROLE_BADGES[condition.value];
                return message => Boolean(def.logins && def.logins.includes(message.login)) ||
                    message.badges.some(badge =>
                        def.ids.some(id => badge.src.includes(id)) || def.names.test(badge.name));
            }
            case 'keyword': {
                const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (condition.mode === 'regex') {
                    const regex = this.compileRegex(condition.value);
                    return message => Boolean(regex) && regex.test(message.raw);
                }
                if (condition.mode === 'word') {
                    // Not a part of a longer word: letters, digits and _ around it do not count
                    const regex = new RegExp(`(?<![\\p{L}\\p{N}_])${escape(match)}(?![\\p{L}\\p{N}_])`, 'iu');
                    return message => regex.test(message.raw);
                }
                if (condition.mode === 'mention') {
                    // "@login" or the login as a separate word
                    const pattern = login => new RegExp(`(?<![\\w])@?${escape(login)}(?![\\w])`, 'i');
                    const fixed = match === MENTION_ME ? null : pattern(match);
                    return message => {
                        const regex = fixed || (message.ownLogin ? pattern(message.ownLogin) : null);
                        return Boolean(regex) && regex.test(message.raw);
                    };
                }
                return message => message.text.includes(match);
            }
        }
        return () => false;
    },

    // Settings in a single shape. Also understands the format of versions before
    // 1.6 (usersList + roles, blacklist mode): the list becomes a set of "show"
    // rules. A blacklist would turn into a list of who to show, so the filter is
    // turned off for it
    normalizeState(raw) {
        raw = raw || {};
        const language = LANGUAGES.some(lang => lang.code === raw.language)
            ? raw.language
            : SYSTEM_LANGUAGE;
        let isFilterEnabled = raw.isFilterEnabled !== false;

        // A channel goes to the first preset it is bound to
        const boundChannels = new Set();
        let presets = (Array.isArray(raw.presets) ? raw.presets : [])
            .filter(preset => preset && preset.id)
            .map(preset => ({
                id: String(preset.id),
                name: String(preset.name || '').trim().slice(0, 40) || this.defaultPresetName(language),
                rules: this.normalizeRules(preset.rules),
                channels: (Array.isArray(preset.channels) ? preset.channels : [])
                    .map(channel => this.normalizeLogin(channel))
                    .filter(channel => {
                        if (!LOGIN_PATTERN.test(channel) || boundChannels.has(channel)) return false;
                        boundChannels.add(channel);
                        return true;
                    })
            }));

        if (!presets.length) {
            const legacyRules = [
                ...(Array.isArray(raw.usersList) ? raw.usersList : []).map(name => ({ type: 'user', value: name })),
                ...(Array.isArray(raw.roles) ? raw.roles : []).map(role => ({ type: 'role', value: role }))
            ];
            // Fixed id: the popup and the content script may migrate old settings at the
            // same time
            presets = [{
                id: 'default',
                name: this.defaultPresetName(language),
                rules: this.normalizeRules(legacyRules),
                channels: []
            }];
            if (raw.mode === 'blacklist') isFilterEnabled = false;
        }

        const activePresetId = presets.some(preset => preset.id === raw.activePresetId)
            ? raw.activePresetId
            : presets[0].id;

        const timestampFormat = TIMESTAMP_FORMATS.includes(raw.timestampFormat) ? raw.timestampFormat : 'short';

        // Filtered chat: keep history between page reloads (on by default), collapse
        // to the header when quiet, blur usernames for screen capture
        const historyEnabled = raw.historyEnabled !== false;
        const autoCollapse = raw.autoCollapse === true;
        const hideNames = raw.hideNames === true;

        // Notifications about new messages of the filtered chat: a sound and a
        // desktop notification when the Twitch tab is not in front (needs a
        // permission), both off by default. notifyScope: see NOTIFY_SCOPES.
        // sendStatus: the message input shows whether your message reached the chat
        const notifySound = raw.notifySound === true;
        const notifyDesktop = raw.notifyDesktop === true;
        const notifyScope = NOTIFY_SCOPES.includes(raw.notifyScope) ? raw.notifyScope : 'all';
        const sendStatus = raw.sendStatus !== false;

        return {
            presets, activePresetId, isFilterEnabled, language, timestampFormat,
            historyEnabled, autoCollapse, hideNames, notifySound, notifyDesktop, notifyScope, sendStatus
        };
    },

    getActivePreset(state) {
        return state.presets.find(preset => preset.id === state.activePresetId) || state.presets[0];
    },

    // fresh: storage is empty (the extension was just installed); legacy: settings
    // in the format of old versions
    async load() {
        const data = await chrome.storage.sync.get(null);

        if (!Array.isArray(data.presetList)) {
            const fresh = data.usersList === undefined && data.roles === undefined;
            return { state: this.normalizeState(data), fresh, legacy: !fresh };
        }

        const presets = data.presetList.map(meta => {
            const rules = [];
            for (let i = 0; i < (meta.chunks || 0); i++) {
                rules.push(...(data[`rules_${meta.id}_${i}`] || []));
            }
            return { id: meta.id, name: meta.name, rules, channels: meta.channels };
        });

        return {
            state: this.normalizeState({
                presets,
                activePresetId: data.activePresetId,
                isFilterEnabled: data.isFilterEnabled,
                language: data.language,
                timestampFormat: data.timestampFormat,
                historyEnabled: data.historyEnabled,
                autoCollapse: data.autoCollapse,
                hideNames: data.hideNames,
                notifySound: data.notifySound,
                notifyDesktop: data.notifyDesktop,
                notifyScope: data.notifyScope,
                sendStatus: data.sendStatus
            }),
            fresh: false,
            legacy: false
        };
    },

    // Load with migration from the old format. getBackup: the backup (for a
    // freshly installed extension)
    async loadAndMigrate(getBackup) {
        let { state, fresh, legacy } = await this.load();

        if (fresh && getBackup) {
            const backup = getBackup();
            if (backup) {
                state = this.normalizeState(backup);
                legacy = true;
            }
        }

        if (legacy) {
            await this.saveAll(state);
            await chrome.storage.sync.remove(['usersList', 'roles', 'mode']);
            await chrome.storage.local.remove(['hiddenMessagesCount', 'savedMessagesCount', 'savedWhitelistMessages']);
        }
        return state;
    },

    // Preset for the clipboard. Channel bindings are not included: they are
    // personal
    exportPreset(preset) {
        return JSON.stringify({
            format: EXPORT_FORMAT,
            version: 1,
            name: preset.name,
            rules: preset.rules.map(({ type, value, mode, action, enabled, note, conditions, notify }) =>
                ({ type, value, mode, action, enabled, note, conditions, notify }))
        });
    },

    // Parse a copied preset. Also understands a plain comma-separated list of
    // usernames (how the list was copied before 1.6). Returns { name, rules } or
    // null
    parsePreset(text) {
        text = String(text || '').trim();
        if (!text) return null;

        let data = null;
        try {
            data = JSON.parse(text);
        } catch (error) {
            // Not JSON: try a list of usernames
        }

        if (data && typeof data === 'object') {
            const rawRules = Array.isArray(data) ? data : data.rules;
            const rules = this.normalizeRules(rawRules);
            if (!rules.length) return null;
            return { name: String(data.name || '').trim().slice(0, 40), rules };
        }

        const names = text.split(/[\s,;]+/).map(name => this.normalizeLogin(name)).filter(Boolean);
        if (!names.length || !names.every(name => LOGIN_PATTERN.test(name))) return null;
        return { name: '', rules: this.normalizeRules(names.map(value => ({ type: 'user', value }))) };
    },

    // A rule without its default fields: sync storage is small (100 KB), and
    // normalizeRule fills the defaults back in when loading
    compactRule(rule) {
        const compact = { ...rule };
        if (compact.mode === 'contains') delete compact.mode;
        if (!compact.conditions || !compact.conditions.length) delete compact.conditions;
        else compact.conditions = compact.conditions.map(({ mode, ...rest }) => (mode === 'contains' ? rest : { ...rest, mode }));
        if (!compact.notify) delete compact.notify;
        return compact;
    },

    chunkRules(rules) {
        const chunks = [];
        let current = [];
        let size = 0;

        rules.forEach(rule => {
            const ruleSize = JSON.stringify(rule).length + 1;
            if (current.length && size + ruleSize > this.CHUNK_BYTES) {
                chunks.push(current);
                current = [];
                size = 0;
            }
            current.push(rule);
            size += ruleSize;
        });
        if (current.length) chunks.push(current);
        return chunks;
    },

    // Save everything with a single set so the content script gets one onChanged
    // event; chunks that are no longer needed are removed afterwards
    async saveAll(state) {
        const items = {
            presetList: [],
            activePresetId: state.activePresetId,
            isFilterEnabled: state.isFilterEnabled,
            language: state.language,
            timestampFormat: state.timestampFormat,
            historyEnabled: state.historyEnabled,
            autoCollapse: state.autoCollapse,
            hideNames: state.hideNames,
            notifySound: state.notifySound,
            notifyDesktop: state.notifyDesktop,
            notifyScope: state.notifyScope,
            sendStatus: state.sendStatus
        };

        state.presets.forEach(preset => {
            const chunks = this.chunkRules(preset.rules.map(rule => this.compactRule(rule)));
            chunks.forEach((chunk, i) => {
                items[`rules_${preset.id}_${i}`] = chunk;
            });
            items.presetList.push({
                id: preset.id,
                name: preset.name,
                chunks: chunks.length,
                channels: preset.channels
            });
        });

        const existing = await chrome.storage.sync.get(null);
        const stale = Object.keys(existing).filter(key => key.startsWith('rules_') && !(key in items));

        await chrome.storage.sync.set(items);
        if (stale.length) {
            await chrome.storage.sync.remove(stale);
        }
    }
};
