const isAuthCallbackPath = () =>
  window.location.pathname === '/oauth/callback' ||
  window.location.pathname === '/admin/callback';

let resolveReady: (() => void) | undefined;
let isReady = isAuthCallbackPath();

const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
  if (isReady) {
    resolve();
  }
});

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
