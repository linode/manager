import {
  authentication,
  stackScriptInProgress,
  supportText,
  ticketReply,
} from 'src/utilities/storage';

export const clearLocalStorage = () => {
  authentication.token.set('');
  authentication.scopes.set('');
  authentication.expire.set('');
  authentication.nonce.set('');
};

export const clearUserInput = () => {
  // Add more things here as needed, right now we only cache
  // Support ticket title/description.

  supportText.set({ description: '', title: '' });
  ticketReply.set({ text: '', ticketId: -1 });
  stackScriptInProgress.set({
    description: '',
    id: '',
    images: [],
    label: '',
    rev_note: '',
    script: '',
    updated: '',
  });
};
