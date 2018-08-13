import { getAccountSettings } from 'src/services/account';

export const userHasManagedLocal = () => {
  const localUserHasManaged = localStorage.getItem('userHasManaged');

  // first check local storage
  if (localUserHasManaged === 'true') {
    return true;
  }
  if (localUserHasManaged === 'false') {
    return false;
  }
  // if localstorage doesn't exist, return null
  return null;
}

export const userHasManagedAPI = () => {
    return getAccountSettings()
    .then(response => {
      localStorage.setItem('userHasManaged', `${response.managed}`);
      return response.managed;
    })
}