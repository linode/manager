import {
  authentication,
  stackScriptInProgress,
  supportTicket,
  supportTicketStorageDefaults,
  ticketReply,
} from 'src/utilities/storage';

export const clearTokenDataFromLocalStorage = () => {
  authentication.token.set('');
  authentication.scopes.set('');
  authentication.expire.set('');
};

export const clearNonceAndCodeVerifierFromLocalStorage = () => {
  authentication.nonce.set('');
  authentication.codeVerifier.set('');
};

export const clearUserInput = () => {
  supportTicket.set(supportTicketStorageDefaults);
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
