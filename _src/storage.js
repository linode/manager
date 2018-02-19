const getItem = window.localStorage.getItem.bind(window.localStorage);
const setItem = window.localStorage.setItem.bind(window.localStorage);

export function getStorage(key) {
  const item = getItem(key);
  try {
    return JSON.parse(item);
  } catch (e) {
    return item;
  }
}

export function setStorage(key, value) {
  return setItem(key, JSON.stringify(value));
}
