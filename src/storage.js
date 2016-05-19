const getItem = window.localStorage.getItem.bind(window.localStorage);
const setItem = window.localStorage.setItem.bind(window.localStorage);

export function getStorage(key) {
  const item = getItem(key);
  if (item === null) return item;
  return JSON.parse(item);
}

export function setStorage(key, value) {
  return setItem(key, JSON.stringify(value));
}
