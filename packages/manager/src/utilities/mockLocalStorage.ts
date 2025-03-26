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
  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  store: any = {};
}

export default LocalStorageMock;
