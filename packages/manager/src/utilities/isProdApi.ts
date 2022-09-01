import { API_ROOT } from 'src/constants';
import { devToolsEnabled } from 'src/dev-tools/load';
import { storage } from 'src/utilities/storage';

/** If it's hitting the prod API */
export const isProdAPI = () => {
  const regExp = RegExp(/api.linode.com\/v4|cloud.linode.com\/api\/v4/);

  // If the user has dev tools enabled, we need to check the API root from the environment switcher
  if (devToolsEnabled()) {
    const localStorageEnv = storage.devToolsEnv.get();
    return regExp.test(localStorageEnv?.apiRoot ?? '');
  } else {
    // Otherwise test the API_ROOT from src/constants
    return regExp.test(API_ROOT);
  }
};
