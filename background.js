// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Risher. Licensed under GPL-3.0-only, see LICENSE

importScripts('settings.js');

// After an install, update or reload of the extension the content script of
// already open Twitch tabs loses its connection to the extension: settings
// changes no longer reach it until the page is reloaded. Inject the new
// version into those tabs right away; it replaces the old copy (see the
// takeover event in content.js)
chrome.runtime.onInstalled.addListener(async () => {
    for (const script of chrome.runtime.getManifest().content_scripts || []) {
        const tabs = await chrome.tabs.query({ url: script.matches });
        for (const tab of tabs) {
            // A discarded tab loads the new version when it is opened again
            if (tab.discarded) continue;
            try {
                const target = { tabId: tab.id };
                if (script.css) await chrome.scripting.insertCSS({ target, files: script.css });
                await chrome.scripting.executeScript({ target, files: script.js });
            } catch (error) {
                // The tab is closed or cannot be scripted (e.g. an error page)
            }
        }
    }
});

// --- Filtered chat history ----------------------------------------------------
// Kept in the IndexedDB of the extension rather than of twitch.tv: the Twitch
// page has no access to it, and it is deleted together with the extension.
// Entry: { id, channel, receivedAt, login, name, text, badges, html, signature }

let historyDb = null;

function openHistoryDb() {
    if (!historyDb) {
        historyDb = new Promise((resolve, reject) => {
            const request = indexedDB.open('chatHistory', 1);
            request.onupgradeneeded = () => {
                const store = request.result.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                store.createIndex('channelTime', ['channel', 'receivedAt']);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                historyDb = null;
                reject(request.error);
            };
        });
    }
    return historyDb;
}

// Run a request in a transaction and wait for the transaction to finish
async function historyTransaction(mode, work) {
    const db = await openHistoryDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', mode);
        let result;
        Promise.resolve(work(tx.objectStore('messages'))).then(value => {
            result = value;
        });
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

function requestResult(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const channelRange = channel => IDBKeyRange.bound([channel, -Infinity], [channel, Infinity]);

// The latest entries of a channel, oldest first
function getHistory(channel, limit) {
    return historyTransaction('readonly', store => new Promise(resolve => {
        const entries = [];
        const request = store.index('channelTime').openCursor(channelRange(channel), 'prev');
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor && entries.length < limit) {
                entries.push(cursor.value);
                cursor.continue();
            } else {
                resolve(entries.reverse());
            }
        };
    }));
}

// Add entries; a channel keeps at most HISTORY_LIMIT of the latest ones
function addHistory(entries) {
    const channels = new Set(entries.map(entry => entry.channel));
    return historyTransaction('readwrite', async store => {
        entries.forEach(entry => store.add(entry));
        for (const channel of channels) {
            const index = store.index('channelTime');
            const extra = await requestResult(index.count(channelRange(channel))) - HISTORY_LIMIT;
            if (extra <= 0) continue;
            await new Promise(resolve => {
                let left = extra;
                const request = index.openCursor(channelRange(channel));
                request.onsuccess = () => {
                    const cursor = request.result;
                    if (cursor && left-- > 0) {
                        cursor.delete();
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
            });
        }
    });
}

function clearHistory() {
    return historyTransaction('readwrite', store => store.clear());
}

// --- Desktop notifications -----------------------------------------------------
// About messages of rules marked "notify" when the Twitch tab is not in front.
// The "notifications" permission is optional: it is requested when the user
// turns the setting on, so chrome.notifications may be missing

// Notification id -> tab it came from (a click brings the tab to the front)
const notificationTabs = new Map();
let notificationClicks = false;

function listenNotificationClicks() {
    if (notificationClicks || !chrome.notifications) return;
    notificationClicks = true;
    chrome.notifications.onClicked.addListener(id => {
        const tabId = notificationTabs.get(id);
        notificationTabs.delete(id);
        chrome.notifications.clear(id);
        if (tabId === undefined) return;
        chrome.tabs.update(tabId, { active: true }, tab => {
            if (!chrome.runtime.lastError && tab) chrome.windows.update(tab.windowId, { focused: true });
        });
    });
    chrome.notifications.onClosed.addListener(id => notificationTabs.delete(id));
}

listenNotificationClicks();
if (chrome.permissions && chrome.permissions.onAdded) {
    chrome.permissions.onAdded.addListener(listenNotificationClicks);
}

// Result: { ok, reason }. reason: 'permission' — the permission is not granted,
// 'blocked' — notifications of the extension are turned off in Chrome
async function showNotification(message, sender) {
    if (!chrome.notifications) return { ok: false, reason: 'permission' };
    listenNotificationClicks();
    const level = await new Promise(resolve => chrome.notifications.getPermissionLevel(resolve));
    if (level === 'denied') return { ok: false, reason: 'blocked' };
    const ok = await new Promise(resolve => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: String(message.title || '').slice(0, 100),
            message: String(message.message || '').slice(0, 300),
            contextMessage: String(message.note || '').slice(0, 60),
            silent: true
        }, id => {
            if (chrome.runtime.lastError || !id) {
                resolve(false);
                return;
            }
            if (sender.tab) notificationTabs.set(id, sender.tab.id);
            resolve(true);
        });
    });
    return { ok, reason: ok ? null : 'error' };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'notify') {
        showNotification(message, sender).then(sendResponse, () => sendResponse({ ok: false, reason: 'error' }));
        return true;
    }
    if (!message || typeof message.type !== 'string' || !message.type.startsWith('history:')) return false;

    let work;
    if (message.type === 'history:get') {
        work = getHistory(String(message.channel), Math.min(Number(message.limit) || HISTORY_LIMIT, HISTORY_LIMIT));
    } else if (message.type === 'history:add' && Array.isArray(message.entries)) {
        work = addHistory(message.entries.filter(entry => entry && typeof entry.channel === 'string'));
    } else if (message.type === 'history:clear') {
        work = clearHistory();
    } else {
        return false;
    }

    work.then(
        result => sendResponse({ ok: true, result }),
        error => sendResponse({ ok: false, error: String(error) })
    );
    // The response is sent asynchronously
    return true;
});
