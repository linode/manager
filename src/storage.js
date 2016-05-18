const window = window ? window : { };

const getItem = window.localStorage ?
  window.localStorage.getItem.bind(window.localStorage) : k => null;
const setItem = window.localStorage ?
  window.localStorage.setItem.bind(window.localStorage) : (k, v) => null;

export function getStorage(key) {
  const item = getItem(key);
  if (item === null) return item;
  return JSON.parse(item);
}

export function setStorage(key, value) {
  return setItem(key, JSON.stringify(value));
}
