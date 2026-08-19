let resolveReady: (() => void) | undefined;
let isReady = false;

const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export const isAuthCallbackPath = (pathname = window.location.pathname) =>
  pathname === '/oauth/callback' || pathname === '/admin/callback';

/** Resolves once the app shell has finished bootstrapping. */
export const waitForAppShell = () => readyPromise;

/** Called when bootstrap completes so root beforeLoad can proceed. */
export const markAppShellReady = () => {
  if (isReady) {
    return;
  }

  isReady = true;
  resolveReady?.();
};
