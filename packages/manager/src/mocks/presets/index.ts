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

import type { MockPreset } from '../types';

/** The preset that we fall back on if the local storage value is unset or invalid. */
export const defaultBaselineMockPreset = baselineNoMocksPreset;

/** Baseline mock presets get applied before all other presets, and one must be selected. */
export const baselineMockPresets: MockPreset[] = [
  baselineNoMocksPreset,
  baselineCrudPreset,
  baselineLegacyPreset,
  baselineAccountActivationPreset,
  baselineApiMaintenanceModePreset,
  baselineApiOfflinePreset,
  baselineApiUnstablePreset,
];

/** Extra mock presets can be used to conditionally apply extra functionality via mocks. */
export const extraMockPresets: MockPreset[] = [
  managedEnabledPreset,
  managedDisabledPreset,
  parentAccountPreset,
  childAccountPreset,
];

/** An array of all mock presets. */
export const allMockPresets: MockPreset[] = [
  ...baselineMockPresets,
  ...extraMockPresets,
];
