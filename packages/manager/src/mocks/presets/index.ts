import { baselineAccountActivationPreset } from './baseline/accountReview';
import { baselineApiMaintenanceModePreset } from './baseline/apiMaintenanceMode';
import { baselineApiOfflinePreset } from './baseline/apiOffline';
import { baselineApiUnstablePreset } from './baseline/apiUnstable';
import { baselineCrudPreset } from './baseline/crud';
import { baselineLegacyPreset } from './baseline/legacy';
import { baselineNoMocksPreset } from './baseline/noMocks';
import { customAccountPreset } from './extra/account/customAccount';
import { customNotificationsPreset } from './extra/account/customNotifications';
import { customProfilePreset } from './extra/account/customProfile';
import { managedDisabledPreset } from './extra/account/managedDisabled';
import { managedEnabledPreset } from './extra/account/managedEnabled';
import { apiResponseTimePreset } from './extra/api/api';
import { linodeLimitsPreset } from './extra/limits/linode-limits';
import { lkeLimitsPreset } from './extra/limits/lke-limits';
import { coreAndDistributedRegionsPreset } from './extra/regions/coreAndDistributed';
import { coreOnlyRegionsPreset } from './extra/regions/coreOnly';
import { legacyRegionsPreset } from './extra/regions/legacyRegions';

import type { MockPresetBaseline, MockPresetExtra } from '../types';

/** The preset that we fall back on if the local storage value is unset or invalid. */
export const defaultBaselineMockPreset = baselineNoMocksPreset;

/** Baseline mock presets get applied before all other presets, and one must be selected. */
export const baselineMockPresets: MockPresetBaseline[] = [
  baselineNoMocksPreset,
  baselineCrudPreset,
  baselineLegacyPreset,
  baselineAccountActivationPreset,
  baselineApiMaintenanceModePreset,
  baselineApiOfflinePreset,
  baselineApiUnstablePreset,
];

/**
 * Extra mock presets can be used to conditionally apply extra functionality via mocks.
 *
 * ⚠️ The order here is the order shown in the dev tools.
 * */
export const extraMockPresets: MockPresetExtra[] = [
  apiResponseTimePreset,
  customAccountPreset,
  customProfilePreset,
  customNotificationsPreset,
  linodeLimitsPreset,
  lkeLimitsPreset,
  managedEnabledPreset,
  managedDisabledPreset,
  coreAndDistributedRegionsPreset,
  coreOnlyRegionsPreset,
  legacyRegionsPreset,
];

/** An array of all mock presets. */
export const allMockPresets: (MockPresetBaseline | MockPresetExtra)[] = [
  ...baselineMockPresets,
  ...extraMockPresets,
];
