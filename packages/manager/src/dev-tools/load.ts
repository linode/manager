import { ENABLE_DEV_TOOLS } from 'src/constants';
import { ApplicationStore } from 'src/store';

/**
 * Use this to dynamicly import our custom dev-tools ONLY when they
 * are needed.
 * @param store Redux store to control
 */
export async function loadDevTools(store: ApplicationStore) {
  await import('./dev-tools').then((devTools) => devTools.install(store));
}

/**
 * Defaults to `true` for development
 * Default to `false` in production builds
 *
 * Define `REACT_APP_ENABLE_DEV_TOOLS` to explicitly enable or disable dev tools
 */
export const shouldEnableDevTools =
  ENABLE_DEV_TOOLS !== undefined ? ENABLE_DEV_TOOLS : import.meta.env.DEV;
