import { useEffect } from 'react';

import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { revokeToken } from 'src/session';
import { getAuthToken } from 'src/utilities/authentication';
import {
  getEnvLocalStorageOverrides,
  stackScriptInProgress,
  supportTicket,
  supportTicketStorageDefaults,
  ticketReply,
} from 'src/utilities/storage';

export const Logout = () => {
  useEffect(() => {
    const clientId = getEnvLocalStorageOverrides()?.clientID ?? CLIENT_ID;
    const authToken = getAuthToken().token;

    clearUserInput();
    if (clientId && authToken) {
      revokeToken(clientId, authToken.split(' ')[1]);
    }
    window.location.assign(getLoginUrl() + '/logout');
  }, []);

  return null;
};

const getLoginUrl = () => {
  try {
    return new URL(getEnvLocalStorageOverrides()?.loginRoot ?? LOGIN_ROOT);
  } catch (_) {
    return LOGIN_ROOT;
  }
};

// TODO -- find a better home for this util
const clearUserInput = () => {
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
