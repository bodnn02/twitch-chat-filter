# Changelog

## v1.12.0
- Keyword rules match a part of the text, a whole word, a regular expression or a mention (@name; empty — mentions of you)
- "And also" conditions: a rule can require up to two more conditions, e.g. Moderator and a mention of you
- Notifications about new messages of the filtered chat: a sound and/or a desktop notification when the Twitch tab is in the background (both off by default; the permission is asked only when you turn desktop notifications on). "Notify about": all messages of the filtered chat, or only rules marked "Notify about new messages"
- Quick add from the chat: hover a message in the original or the filtered chat and show or hide this user with one click. The button sits next to Twitch's own message menu ("⋮"), or on the username line when there is none
- Exported messages start with a link to the stream (the recording on VOD pages)
- Notifications also work when the Twitch tab is in the background or the browser is minimized: Twitch does not draw new chat messages then, so the extension reads the chat of the channel from the Twitch chat server as an anonymous guest until you come back to the tab
- "Test" button for desktop notifications in Settings
- Match counters: each rule shows how many messages it matched and when it last did
- Send status: the message input outline shows whether your message reached the chat
- The extension menu picks up rules added from the chat while it is open

## v1.11.0
- Filtered chat history: matching messages stay after reloading the page (up to 1000 per channel, stored only in the extension), with date separators. Saved messages are filtered again when the rules change. Can be turned off or cleared in Settings
- Export the filtered chat: copy as text or save as .txt / .csv (button in the filtered chat header)
- New setting "Collapse when quiet": the filtered chat shrinks to its header after 5 minutes without matching messages and expands with the next one
- New setting "Hide usernames": names and mentions in the filtered chat are blurred for screen capture
- On VOD pages the preset bound to the channel is used (the channel is taken from the page)
- After an extension update, open Twitch tabs get the new version right away: settings changes work without reloading the page

## v1.10.0
- Pinned messages and Twitch notifications (subscriptions, tips) are shown above the filtered chat together with the leaderboard
- Message time is shown inside the message line, short by default (11:23); the full date and time appear on hover
- New setting "Message time": short, with seconds or hidden; message times are kept when filter settings change
- With both chats hidden, the message input stays at the bottom of the column

## v1.9.0
- New language option "System" (the browser language), used by default
- Leaderboard, pinned message and hype train are shown above the filtered chat instead of covering it, and stay available when the original chat is hidden
- Pop-ups next to the message input (channel points rewards, etc.) are shown over the filtered chat instead of being cut off
- Switching to Settings in the popup no longer jumps

## v1.8.0
- The popup header is split: the preset name opens the preset menu, the gear opens a separate Settings page
- Interface language is chosen from a dropdown on the Settings page (ready for more languages)

## v1.7.0
- Presets can be bound to channels and turn on automatically on them; the popup opens the preset used on the current channel
- Copy a preset to the clipboard and import it (a plain comma-separated list of usernames is accepted too)
- New role: Chatbot (chatbot badge or a well-known bot account)
- Rule types are color-coded with icons; sorting by type puts roles first
- Twitch panels above the chat (leaderboard, pinned messages, hype train) no longer cover the filtered chat
- Twitch's pop-out chat window is no longer split into filtered and original chat

## v1.6.0
- Rules instead of separate user and role sections: user, role, badge and keyword rules in one list with tabs, search and sorting
- Each rule shows (+) or hides (−) matching messages and can be turned off without deleting it
- Presets: save sets of rules and switch between them; the filtered chat header shows the active preset
- Bulk selection: enable, disable or delete several rules at once
- Settings from v1.5 are moved into a "Default" preset automatically

## v1.5.0
- Filter by roles: streamer, moderators, VIPs, verified accounts, subscribers, Twitch staff (detected by chat badges)
- Redesigned popup: status card with a plain-language summary of what is shown, role tiles, username validation (also accepts `@name` and channel links), undo for removing users and clearing the list
- The username field also searches: the list is filtered as you type, and a name that is already added is highlighted
- Styled scrollbars in the popup and the filtered chat
- Removed blacklist mode (users of blacklist mode get the filter turned off after the update, so nothing is hidden unexpectedly)
- Removed hidden/saved message counters and saved messages; old data is deleted from storage

## v1.4.0
- Fixed filtering when Twitch reuses chat elements for new messages (VOD chat)
- Filtered chat shows full Twitch messages: name colors, badges, emotes, stickers, mentions
- Clicks in the filtered chat work like in the original one: user card, emote card, message menu, VOD timestamp seek
- Hover card with a larger image and name for badges and emotes
- Emote-only messages are no longer dropped
- User list is backed up on twitch.tv and restored after reinstalling the extension; list can be copied and pasted in bulk
- Redesigned popup and chat headers (SVG icons, mode badge, empty-state hints, localized tooltips)
- Double-click the divider to reset the 50/50 split

## v1.3.0
- Fixed live chat filtering (updated selectors for the current Twitch DOM: `.chat-line__message`)
- Resizable split between filtered and original chat (drag the divider; ratio is remembered)
- Pop-out buttons: filtered chat opens in its own window, original chat uses Twitch's native popout
- Your own messages are always shown in the filtered chat regardless of mode
- Filtering matches users by login (`data-a-user`) instead of the display name

## v1.2.0
- Security: chat messages and usernames are rendered as plain text (fixed HTML injection)
- Fixed duplicate messages in the filtered chat (deduplication no longer depends on timestamps)
- Saved messages and counters moved to `chrome.storage.local` (no more sync quota errors); writes are batched
- Saved messages are persisted even when the popup is closed
- Settings now propagate to all open Twitch tabs via `storage.onChanged` (removed `activeTab` permission)
- Toggling the filter off now shows all messages in the filtered chat
- Incremental message rendering instead of rebuilding the whole chat on every message
- Proper cleanup on Twitch SPA navigation (no duplicated containers or leaked observers)
- Auto-scroll pauses when you scroll up to read history
- Localized display names ("Name (login)") are matched by login

## v1.0.0
- Initial release
- Basic whitelist/blacklist filtering
- Dual chat view
- Message saving functionality
- Real-time filtering
