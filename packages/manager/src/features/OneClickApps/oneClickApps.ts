import { oneClickApps as newOneClickApps } from './oneClickAppsv2';

import type { OCA } from './types';

/**
 * @deprecated See oneClickAppsv2.ts
 */
export const oneClickApps: OCA[] = Object.values(newOneClickApps);
