/**
 * QueryCraft background service worker.
 *
 * MV3 service workers are stateless and can be terminated at any time, so we
 * never store state in globals here. This worker exists only to:
 *   1. Respond to the `onInstalled` event (e.g., for future onboarding).
 *   2. Provide a target for future messaging if we add a context menu or
 *      omnibox integration.
 *
 * All real work (URL parsing, editing, clipboard, storage) happens in the
 * popup, which is a much better environment for UI logic and has the user
 * gesture we need for clipboard writes and tab updates.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Reserved for first-run setup.
  }
});

// Keep the worker warm while the popup is open? Not needed — chrome.tabs and
// chrome.storage both work from the popup directly.
export {};
