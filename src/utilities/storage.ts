export const getStorage = (key: string) => {
  const item = window.localStorage.getItem(key);
  try {
    return JSON.parse(item as any);
  } catch (e) {
    return item;
  }
}

export const setStorage = (key: string, value: string) => {
  return window.localStorage.setItem(key, value);
}
