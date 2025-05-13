import { defaultBaselineMockPreset, extraMockPresets } from 'src/mocks/presets';

import {
  LOCAL_STORAGE_ACCOUNT_FORM_DATA_KEY,
  LOCAL_STORAGE_KEY,
  LOCAL_STORAGE_NOTIFICATIONS_FORM_DATA_KEY,
  LOCAL_STORAGE_PRESET_EXTRAS_KEY,
  LOCAL_STORAGE_PRESET_KEY,
  LOCAL_STORAGE_PRESETS_MAP_KEY,
  LOCAL_STORAGE_PROFILE_FORM_DATA_KEY,
  LOCAL_STORAGE_SEEDERS_KEY,
  LOCAL_STORAGE_SEEDS_COUNT_MAP_KEY,
} from './constants';

import type { Account, Notification, Profile } from '@linode/api-v4';
import type {
  MockPresetBaselineId,
  MockPresetExtraId,
  MockSeeder,
} from 'src/mocks/types';

/**
 * Whether MSW is enabled via local storage setting.
 *
 * `true` if MSW is enabled, `false` otherwise.
 */
export const isMSWEnabled =
  localStorage.getItem(LOCAL_STORAGE_KEY) === 'enabled';

/**
 * Saves MSW enabled or disabled state to local storage.
 *
 * @param enabled - Whether or not to enable MSW.
 */
export const saveMSWEnabled = (enabled: boolean): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, enabled ? 'enabled' : 'disabled');
};

/**
 * Returns the ID of the selected MSW preset that is stored in local storage.
 *
 * @returns ID of selected MSW preset, or `null` if no preset is saved.
 */
export const getBaselinePreset = (): MockPresetBaselineId => {
  return (
    (localStorage.getItem(LOCAL_STORAGE_PRESET_KEY) as MockPresetBaselineId) ??
    defaultBaselineMockPreset.id
  );
};

/**
 * Saves ID of selected MSW preset in local storage.
 */
export const saveBaselinePreset = (presetId: MockPresetBaselineId): void => {
  localStorage.setItem(LOCAL_STORAGE_PRESET_KEY, presetId);
};

/**
 * Retrieves the seeding count map from local storage.
 */
export const getSeedsCountMap = (): { [key: string]: number } => {
  const encodedCountMap = localStorage.getItem(
    LOCAL_STORAGE_SEEDS_COUNT_MAP_KEY
  );

  return encodedCountMap ? JSON.parse(encodedCountMap) : {};
};

/**
 * Saves the seeding count map to local storage.
 */
export const saveSeedsCountMap = (countMap: { [key: string]: number }) => {
  localStorage.setItem(
    LOCAL_STORAGE_SEEDS_COUNT_MAP_KEY,
    JSON.stringify(countMap)
  );
};

/**
 * Retrieves the presets map from local storage.
 */
export const getExtraPresetsMap = (): {
  [K in MockPresetExtraId]: number;
} => {
  const encodedPresetsMap = localStorage.getItem(LOCAL_STORAGE_PRESETS_MAP_KEY);

  return encodedPresetsMap ? JSON.parse(encodedPresetsMap) : {};
};

/**
 * Saves the presets map to local storage.
 */
export const saveExtraPresetsMap = (presetsMap: { [key: string]: number }) => {
  localStorage.setItem(
    LOCAL_STORAGE_PRESETS_MAP_KEY,
    JSON.stringify(presetsMap)
  );
};

/**
 * Returns an array of enabled extra MSW presets that are stored in local storage.
 *
 * An empty array is returned when the expected data does not exist in local
 * storage.
 */
export const getExtraPresets = (): string[] => {
  const encodedPresets = localStorage.getItem(LOCAL_STORAGE_PRESET_EXTRAS_KEY);
  if (!encodedPresets) {
    return [];
  }
  const storedPresets = encodedPresets.split(',');

  // Filter out any stored presets that no longer exist in the code base.
  return storedPresets.filter((storedPreset) =>
    extraMockPresets.find(
      (extraMockPreset) => extraMockPreset.id === storedPreset
    )
  );
};

/**
 * Saves the extra MSW presets to local storage.
 */
export const saveExtraPresets = (presets: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_PRESET_EXTRAS_KEY, presets.join(','));
};

/**
 * Returns an array of enabled context seeders that are stored in local storage.
 *
 * An empty array is returned when the expected data does not exist in local
 * storage.
 */
export const getSeeders = (dbSeeders: MockSeeder[]): string[] => {
  const encodedPopulators = localStorage.getItem(LOCAL_STORAGE_SEEDERS_KEY);
  if (!encodedPopulators) {
    return [];
  }
  const storedSeeders = encodedPopulators.split(',');

  // Filter out any stored populators that no longer exist in the code base.
  return storedSeeders.filter((storedSeeder) =>
    dbSeeders.find((dbSeeder) => dbSeeder.id === storedSeeder)
  );
};

/**
 * Saves the context seeders to local storage.
 */
export const saveSeeders = (populators: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_SEEDERS_KEY, populators.join(','));
};

/**
 * Retrieves the custom account form data from local storage.
 */
export const getCustomAccountData = (): Account | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_ACCOUNT_FORM_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Saves the custom account form data to local storage.
 */
export const saveCustomAccountData = (data: Account | null): void => {
  if (data) {
    localStorage.setItem(
      LOCAL_STORAGE_ACCOUNT_FORM_DATA_KEY,
      JSON.stringify(data)
    );
  }
};

/**
 * Retrieves the custom profile form data from local storage.
 */
export const getCustomProfileData = (): null | Profile => {
  const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_FORM_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Saves the custom profile form data to local storage.
 */
export const saveCustomProfileData = (data: null | Profile): void => {
  if (data) {
    localStorage.setItem(
      LOCAL_STORAGE_PROFILE_FORM_DATA_KEY,
      JSON.stringify(data)
    );
  }
};

/**
 * Retrieves the custom notifications form data from local storage.
 */
export const getCustomNotificationsData = (): Notification[] | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_FORM_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Saves the custom notifications form data to local storage.
 */
export const saveCustomNotificationsData = (
  data: Notification[] | null
): void => {
  if (data) {
    localStorage.setItem(
      LOCAL_STORAGE_NOTIFICATIONS_FORM_DATA_KEY,
      JSON.stringify(data)
    );
  }
};
