import React from 'react';

import {
  LIVE_CHAT_ENABLE_EVENT,
  LIVE_CHAT_FAILED_EVENT,
  LIVE_CHAT_READY_EVENT,
} from 'src/features/Support/SupportTickets/liveChatConstants';

let hasLiveChatInitialized = false;
let embeddedMessagingScriptPromise: Promise<void> | undefined;
let chatEventListenersAttached = false;
let hasEmbeddedMessagingBootstrapInitialized = false;
let hasEmbeddedMessagingInitialized = false;
let hasPreloadAttempted = false;
let liveChatTornDown = false;

type EmbeddedMessagingBootstrap = {
  init: (
    orgId: string,
    deploymentName: string,
    deploymentUrl: string,
    options: { scrt2URL: string }
  ) => void;
  settings: {
    language?: string;
  };
  utilAPI?: {
    hideChatButton?: () => void;
    launchChat?: () => void;
    minimizeChat?: () => void;
  };
};

const dispatchLiveChatReady = () => {
  window.dispatchEvent(new CustomEvent(LIVE_CHAT_READY_EVENT));
};

const clearLiveChatSessionItems = () => {
  window.sessionStorage.removeItem('LiveChatToken');
  window.sessionStorage.removeItem('LiveChatSubject');
  window.sessionStorage.removeItem('LiveChatDescription');
};

const handleGhostSessionResume = () => {
  dispatchLiveChatReady();
  clearLiveChatSessionItems();
};

const handleConversationOpened = () => {
  // ConversationOpened also fires for fresh chats. Delay cleanup to avoid
  // racing prechat token injection in the normal new-chat flow.
  dispatchLiveChatReady();

  setTimeout(() => {
    clearLiveChatSessionItems();
  }, 3000);
};

const getEmbeddedMessagingBootstrap = () =>
  (
    window as Window & {
      embeddedservice_bootstrap?: EmbeddedMessagingBootstrap;
    }
  ).embeddedservice_bootstrap;

const embeddedMessagingConfig = {
  bootstrapJsUrl: import.meta.env.REACT_APP_CHAT_BOOTSTRAP_JS_URL ?? '',
  deploymentName: import.meta.env.REACT_APP_CHAT_DEPLOYMENT_NAME ?? '',
  deploymentUrl: import.meta.env.REACT_APP_CHAT_DEPLOYMENT_URL ?? '',
  orgId: import.meta.env.REACT_APP_CHAT_ORG_ID ?? '',
  scrt2Url: import.meta.env.REACT_APP_CHAT_SCRT2_URL ?? '',
};

function getAllowedMessageOrigins(): Set<string> {
  const allowedOrigins = new Set<string>();
  const urls = [
    embeddedMessagingConfig.bootstrapJsUrl,
    embeddedMessagingConfig.deploymentUrl,
    embeddedMessagingConfig.scrt2Url,
  ];

  for (const url of urls) {
    if (url) {
      try {
        allowedOrigins.add(new URL(url).origin);
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return allowedOrigins;
}

function preconnectToChatOrigins() {
  const urls = [
    embeddedMessagingConfig.bootstrapJsUrl,
    embeddedMessagingConfig.deploymentUrl,
    embeddedMessagingConfig.scrt2Url,
  ].filter(Boolean);

  const uniqueOrigins = new Set<string>();

  urls.forEach((url) => {
    try {
      uniqueOrigins.add(new URL(url).origin);
    } catch {
      // Ignore malformed URLs; runtime init will still validate script loading.
    }
  });

  uniqueOrigins.forEach((origin) => {
    const selector = `link[rel="preconnect"][href="${origin}"]`;
    if (document.head.querySelector(selector)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

function loadEmbeddedMessagingScript() {
  if (!embeddedMessagingConfig.bootstrapJsUrl) {
    return Promise.reject(
      new Error('Missing Embedded Messaging bootstrap JS URL.')
    );
  }

  if (getEmbeddedMessagingBootstrap()) {
    return Promise.resolve();
  }

  if (embeddedMessagingScriptPromise) {
    return embeddedMessagingScriptPromise;
  }

  embeddedMessagingScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = embeddedMessagingConfig.bootstrapJsUrl;
    script.onload = () => resolve();
    script.onerror = () => {
      embeddedMessagingScriptPromise = undefined;
      reject(new Error('Failed to load Embedded Messaging script.'));
    };
    document.body.appendChild(script);
  });

  return embeddedMessagingScriptPromise;
}

function hideEmbeddedMessagingContainer() {
  const selectors = [
    '#embeddedmessaging-container',
    '#embeddedMessaging-container',
    '[id*="embeddedmessaging-container"]',
    '[id*="embeddedMessaging-container"]',
    '[id*="embeddedMessaging"]',
    '[class*="embeddedMessaging"]',
    'iframe[id*="embeddedMessaging"]',
    'iframe[title*="chat" i]',
    'button[id*="embeddedMessaging"]',
    'button[title*="chat" i]',
  ];

  const activeElement = document.activeElement;

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      if (
        activeElement instanceof HTMLElement &&
        element.contains(activeElement)
      ) {
        activeElement.blur();
      }

      element.style.setProperty('display', 'none', 'important');
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('opacity', '0', 'important');
      element.style.setProperty('pointer-events', 'none', 'important');
      element.setAttribute('inert', '');
      element.removeAttribute('aria-hidden');
    });
  });

  try {
    const utilAPI = getEmbeddedMessagingBootstrap()?.utilAPI;
    utilAPI?.minimizeChat?.();
    utilAPI?.hideChatButton?.();
  } catch {
    // Ignore failures from optional third-party chat APIs.
  }
}

function clearSalesforceSessionData() {
  // Salesforce Embedded Messaging persists session state in localStorage/sessionStorage.
  // If left behind after the Salesforce side closes, it causes reconnection loops.
  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (
      key &&
      (key.startsWith('ESAPI_') ||
        key.startsWith('ESW') ||
        key.startsWith('embeddedservice') ||
        key.startsWith('liveagent'))
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));

  const sessionKeysToRemove: string[] = [];

  for (let i = 0; i < window.sessionStorage.length; i++) {
    const key = window.sessionStorage.key(i);
    if (
      key &&
      (key.startsWith('ESAPI_') ||
        key.startsWith('ESW') ||
        key.startsWith('embeddedservice') ||
        key.startsWith('liveagent'))
    ) {
      sessionKeysToRemove.push(key);
    }
  }

  sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
}

function handleChatClosed() {
  hideEmbeddedMessagingContainer();
  hasLiveChatInitialized = false;
  hasEmbeddedMessagingInitialized = false;
  window.sessionStorage.removeItem('EnableLiveChat');
  clearSalesforceSessionData();
}

const handleSalesforceMessage = (event: MessageEvent) => {
  const allowedOrigins = getAllowedMessageOrigins();

  // Validate that the message origin is from an allowed Salesforce domain
  if (!allowedOrigins.has(event.origin)) {
    return;
  }

  const payload =
    typeof event.data === 'string'
      ? (() => {
          try {
            return JSON.parse(event.data);
          } catch {
            return { action: event.data };
          }
        })()
      : (event.data ?? {});

  const action = payload?.action ?? payload?.type ?? payload?.event;

  if (
    action === 'prechatLoaded' ||
    action === 'prechat:loaded' ||
    action === 'embeddedMessaging:prechatLoaded'
  ) {
    const token = window.sessionStorage.getItem('LiveChatToken');
    const subject = window.sessionStorage.getItem('LiveChatSubject');

    const dataMap = {
      JWE_Token: token ?? '',
      Title: subject ?? '',
    };

    if (event.source && event.origin) {
      (event.source as WindowProxy).postMessage(
        { action: 'hiddenParameters', data: dataMap },
        event.origin
      );
    }

    window.sessionStorage.removeItem('LiveChatToken');
  } else if (action === 'chatInitiationResult') {
    const subject = window.sessionStorage.getItem('LiveChatSubject');
    const description = window.sessionStorage.getItem('LiveChatDescription');

    clearLiveChatSessionItems();
    if (payload?.data?.statusCode === 200) {
      window.dispatchEvent(new CustomEvent(LIVE_CHAT_READY_EVENT));
    } else {
      hasLiveChatInitialized = false;
      hideEmbeddedMessagingContainer();
      window.dispatchEvent(
        new CustomEvent(LIVE_CHAT_FAILED_EVENT, {
          detail: {
            description: description ?? '',
            subject: subject ?? '',
            errorType: payload?.data?.type,
            errorDescription: payload?.data?.description,
          },
        })
      );
    }
  } else if (action === 'onEmbeddedMessagingWindowClosed') {
    handleChatClosed();
  }
};

function attachEmbeddedMessagingLifecycleListeners() {
  if (chatEventListenersAttached) return;
  chatEventListenersAttached = true;

  window.addEventListener(
    'onEmbeddedMessagingWindowRestored',
    handleGhostSessionResume
  );
  window.addEventListener(
    'onEmbeddedMessagingConversationOpened',
    handleConversationOpened
  );

  window.addEventListener('message', handleSalesforceMessage);

  const closeEvents = ['onEmbeddedMessagingWindowClosed'];

  closeEvents.forEach((eventName) => {
    window.addEventListener(eventName, () => {
      const iframe =
        document.querySelector('iframe[id*="embeddedMessaging"]') ||
        document.querySelector('iframe[title*="chat" i]');

      // If the iframe is gone or hidden, treat it as closed.
      setTimeout(() => {
        const iframeStillVisible =
          iframe &&
          document.body.contains(iframe) &&
          window.getComputedStyle(iframe).display !== 'none' &&
          window.getComputedStyle(iframe).visibility !== 'hidden';

        if (!iframeStillVisible) {
          handleChatClosed();
        }
      }, 300);
    });
  });
}

function ensureEmbeddedMessagingInitialized() {
  if (hasEmbeddedMessagingInitialized) {
    return;
  }

  const embeddedMessagingBootstrap = getEmbeddedMessagingBootstrap();
  if (!embeddedMessagingBootstrap) {
    throw new Error('Embedded Messaging bootstrap is not available.');
  }

  embeddedMessagingBootstrap.settings.language = 'en_US';
  embeddedMessagingBootstrap.init(
    embeddedMessagingConfig.orgId,
    embeddedMessagingConfig.deploymentName,
    embeddedMessagingConfig.deploymentUrl,
    {
      scrt2URL: embeddedMessagingConfig.scrt2Url,
    }
  );

  hasEmbeddedMessagingInitialized = true;
}

async function openLiveChatOnce() {
  if (liveChatTornDown) {
    return;
  }

  const enableLiveChat =
    window.sessionStorage.getItem('EnableLiveChat') === 'true';

  if (!enableLiveChat) {
    return;
  }

  if (hasLiveChatInitialized) {
    const launchChat = () => {
      try {
        getEmbeddedMessagingBootstrap()?.utilAPI?.launchChat?.();
      } catch {
        // Ignore failures from optional third-party chat APIs.
      }
    };

    launchChat();
    window.sessionStorage.removeItem('EnableLiveChat');
    clearLiveChatSessionItems();
    window.setTimeout(dispatchLiveChatReady, 0);
    return;
  }

  hasLiveChatInitialized = true;

  const liveChatToken = window.sessionStorage.getItem('LiveChatToken');
  if (!liveChatToken) {
    hasLiveChatInitialized = false;
    return;
  }

  try {
    await loadEmbeddedMessagingScript();
  } catch {
    hasLiveChatInitialized = false;
    return;
  }

  attachEmbeddedMessagingLifecycleListeners();
  window.sessionStorage.removeItem('EnableLiveChat');

  try {
    ensureEmbeddedMessagingInitialized();
  } catch {
    hasLiveChatInitialized = false;
    return;
  }

  const launchChat = () => {
    try {
      getEmbeddedMessagingBootstrap()?.utilAPI?.launchChat?.();
    } catch {
      // Ignore failures from optional third-party chat APIs.
    }
  };

  if (getEmbeddedMessagingBootstrap()?.utilAPI?.launchChat) {
    launchChat();
    return;
  }

  window.addEventListener('onEmbeddedMessagingButtonCreated', launchChat, {
    once: true,
  });
}

function initEmbeddedMessaging() {
  if (hasEmbeddedMessagingBootstrapInitialized) {
    return;
  }

  hasEmbeddedMessagingBootstrapInitialized = true;
  window.addEventListener(LIVE_CHAT_ENABLE_EVENT, openLiveChatOnce);
  openLiveChatOnce();
}

function preloadEmbeddedMessagingScript() {
  if (hasPreloadAttempted || getEmbeddedMessagingBootstrap()) {
    return;
  }

  hasPreloadAttempted = true;

  const startPreload = () => {
    preconnectToChatOrigins();
    loadEmbeddedMessagingScript().catch(() => {
      // Ignore preload failures; chat flow will retry on demand.
    });
  };

  const win = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      options?: { timeout: number }
    ) => number;
  };

  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(startPreload, { timeout: 1500 });
  } else {
    globalThis.setTimeout(startPreload, 500);
  }
}

let liveChatTeardownObserver: MutationObserver | null = null;

function stopTeardownObserver() {
  if (liveChatTeardownObserver) {
    liveChatTeardownObserver.disconnect();
    liveChatTeardownObserver = null;
  }
}

function startTeardownObserver() {
  stopTeardownObserver();

  liveChatTeardownObserver = new MutationObserver(() => {
    hideEmbeddedMessagingContainer();
  });

  liveChatTeardownObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Stop observing after 30 seconds — by then the SDK should have settled.
  window.setTimeout(stopTeardownObserver, 30000);
}

export function teardownLiveChat() {
  liveChatTornDown = true;
  hasLiveChatInitialized = false;
  hasEmbeddedMessagingInitialized = false;
  clearLiveChatSessionItems();
  window.sessionStorage.removeItem('EnableLiveChat');
  window.removeEventListener(LIVE_CHAT_ENABLE_EVENT, openLiveChatOnce);
  window.removeEventListener(
    'onEmbeddedMessagingWindowRestored',
    handleGhostSessionResume
  );
  window.removeEventListener(
    'onEmbeddedMessagingConversationOpened',
    handleConversationOpened
  );
  window.removeEventListener('message', handleSalesforceMessage);

  clearSalesforceSessionData();
  hideEmbeddedMessagingContainer();
  startTeardownObserver();
}

export const useLiveChatBootstrap = () => {
  React.useEffect(() => {
    initEmbeddedMessaging();
    preloadEmbeddedMessagingScript();
  }, []);
};
