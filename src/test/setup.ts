import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Chrome extension API mocks for the test environment.
 *
 * These are intentionally minimal — each test should configure only the
 * behaviors it needs via vi.mocked(...).mockResolvedValue(...) or similar.
 *
 * The shape here mirrors the subset of `chrome.*` that QueryCraft actually
 * uses: storage.local (get/set/remove) and tabs (query/update).
 */

interface MockStorageArea {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

interface MockChrome {
  storage: { local: MockStorageArea };
  tabs: {
    query: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  runtime: {
    onInstalled: { addListener: ReturnType<typeof vi.fn> };
    onMessage: { addListener: ReturnType<typeof vi.fn> };
    sendMessage: ReturnType<typeof vi.fn>;
  };
}

function createMockChrome(): MockChrome {
  const inMemoryStorage = new Map<string, unknown>();

  return {
    storage: {
      local: {
        get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
          if (keys === undefined || keys === null) {
            return Object.fromEntries(inMemoryStorage.entries());
          }
          if (typeof keys === 'string') {
            return { [keys]: inMemoryStorage.get(keys) };
          }
          if (Array.isArray(keys)) {
            const result: Record<string, unknown> = {};
            for (const k of keys) result[k] = inMemoryStorage.get(k);
            return result;
          }
          // Defaults object form
          const result: Record<string, unknown> = {};
          for (const [k, defaultValue] of Object.entries(keys)) {
            result[k] = inMemoryStorage.get(k) ?? defaultValue;
          }
          return result;
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [k, v] of Object.entries(items)) inMemoryStorage.set(k, v);
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          const list = Array.isArray(keys) ? keys : [keys];
          for (const k of list) inMemoryStorage.delete(k);
        }),
        clear: vi.fn(async () => inMemoryStorage.clear()),
      },
    },
    tabs: {
      query: vi.fn(async () => [{ id: 1, url: 'https://example.com/?a=1', active: true }]),
      update: vi.fn(async () => undefined),
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn() },
      sendMessage: vi.fn(async () => undefined),
    },
  };
}

beforeEach(() => {
  // Reset chrome API for each test to prevent cross-test state leaks.
  (globalThis as unknown as { chrome: MockChrome }).chrome = createMockChrome();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock navigator.clipboard for the clipboard hook.
Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn(async () => undefined),
    readText: vi.fn(async () => ''),
  },
});

// Mock matchMedia for the theme hook — jsdom doesn't implement it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
