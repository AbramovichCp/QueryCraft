/**
 * Thin adapter over chrome.tabs. Centralizing this makes the rest of the app
 * testable without needing to mock the global `chrome` namespace everywhere.
 */

export interface ActiveTab {
  id: number;
  url: string;
}

export const tabs = {
  async getActive(): Promise<ActiveTab | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id === undefined || !tab.url) return null;
    return { id: tab.id, url: tab.url };
  },

  async updateUrl(tabId: number, url: string): Promise<void> {
    await chrome.tabs.update(tabId, { url });
  },
};
