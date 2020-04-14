import { authentication, supportText } from 'src/utilities/storage';

export const clearLocalStorage = () => {
  authentication.token.set('');
  authentication.scopes.set('');
  authentication.expire.set('');
  authentication.nonce.set('');
};

export const clearUserInput = () => {
  // Add more things here as needed, right now we only cache
  // Support ticket title/description.

  supportText.set({ title: '', description: '' });
};
