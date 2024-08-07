import { baselineAccountActivationPreset } from './baseline/baseline-account-review';
import { baselineApiMaintenanceModePreset } from './baseline/baseline-api-maintenance-mode';
import { baselineApiOfflinePreset } from './baseline/baseline-api-offline';
import { baselineApiUnstablePreset } from './baseline/baseline-api-unstable';
import { baselineCrudPreset } from './baseline/baseline-crud';
import { baselineLegacyPreset } from './baseline/baseline-legacy';
import { baselineNoMocksPreset } from './baseline/baseline-no-mocks';
import { childAccountPreset } from './extra/account/child-account';
import { managedDisabledPreset } from './extra/account/managed-disabled';
import { managedEnabledPreset } from './extra/account/managed-enabled';
import { parentAccountPreset } from './extra/account/parent-account';
import { apiResponseTimePreset } from './extra/api/api';
import { coreAndDistributedRegionsPreset } from './extra/regions/coreAndDistributed';
import { coreOnlyRegionsPreset } from './extra/regions/coreOnly';
import { legacyRegionsPreset } from './extra/regions/legacy-regions';

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
  parentAccountPreset,
  childAccountPreset,
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
