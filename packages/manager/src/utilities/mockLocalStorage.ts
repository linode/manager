/**
 * Used for tests where a component relies on localStorage.
 * Usage:
 *
 * import LocalStorageMock from 'src/utilities/mockLocalStorage';
 * Object.defineProperty(window, 'localStorage', {
 *   value: new LocalStorageMock()
 * });
 */

class LocalStorageMock {
  store: any = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

export default LocalStorageMock;
