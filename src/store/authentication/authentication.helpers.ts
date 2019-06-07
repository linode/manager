import { authentication } from 'src/utilities/storage';

export const clearLocalStorage = () => {
  authentication.token.set('');
  authentication.scopes.set('');
  authentication.expire.set('');
  authentication.nonce.set('');
  localStorage.setItem('store', '');
};
