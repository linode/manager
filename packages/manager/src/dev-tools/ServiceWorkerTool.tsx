import * as React from 'react';

import { mswDB } from 'src/mocks/indexedDB';
import { extraMockPresets } from 'src/mocks/presets';
import { dbSeeders } from 'src/mocks/presets/crud/seeds';
import { removeSeeds } from 'src/mocks/presets/crud/seeds/utils';

import { BaselinePresetOptions } from './components/BaselinePresetOptions';
import { DevToolSelect } from './components/DevToolSelect';
import { ExtraPresetOptions } from './components/ExtraPresetOptions';
import { SeedOptions } from './components/SeedOptions';
import {
  getBaselinePreset,
  getCustomAccountData,
  getCustomEventsData,
  getCustomMaintenanceData,
  getCustomNotificationsData,
  getCustomProfileData,
  getCustomUserAccountPermissionsData,
  getCustomUserEntityPermissionsData,
  getExtraPresets,
  getExtraPresetsMap,
  getSeeders,
  getSeedsCountMap,
  isMSWEnabled,
  saveBaselinePreset,
  saveCustomAccountData,
  saveCustomEventsData,
  saveCustomMaintenanceData,
  saveCustomNotificationsData,
  saveCustomProfileData,
  saveCustomUserAccountPermissionsData,
  saveCustomUserEntityPermissionsData,
  saveExtraPresets,
  saveExtraPresetsMap,
  saveMSWEnabled,
  saveSeeders,
  saveSeedsCountMap,
} from './utils';

import type {
  Account,
  AccountMaintenance,
  Event,
  Notification,
  PermissionType,
  Profile,
} from '@linode/api-v4';
import type {
  MockPresetBaselineId,
  MockPresetCrudId,
  MockPresetExtraGroup,
  MockPresetExtraId,
  MockState,
} from 'src/mocks/types';

interface ServiceWorkerSaveState {
  hasSaved: boolean;
  hasUnsavedChanges: boolean;
  mocksCleared?: boolean;
}

/**
 * Renders the service worker tool.
 */
export const ServiceWorkerTool = () => {
  const loadedBaselinePreset = getBaselinePreset();
  const loadedExtraPresets = getExtraPresets();
  const loadedSeeders = getSeeders(dbSeeders);
  const loadedSeedsCountMap = getSeedsCountMap();
  const loadedPresetsMap = getExtraPresetsMap();
  const [baselinePreset, setBaselinePreset] =
    React.useState<MockPresetBaselineId>(loadedBaselinePreset);
  const [extraPresets, setExtraPresets] =
    React.useState<string[]>(loadedExtraPresets);
  const [customAccountData, setCustomAccountData] = React.useState<
    Account | null | undefined
  >(getCustomAccountData());
  const [customProfileData, setCustomProfileData] = React.useState<
    null | Profile | undefined
  >(getCustomProfileData());
  const [
    customUserAccountPermissionsData,
    setCustomUserAccountPermissionsData,
  ] = React.useState<null | PermissionType[] | undefined>(
    getCustomUserAccountPermissionsData()
  );
  const [customUserEntityPermissionsData, setCustomUserEntityPermissionsData] =
    React.useState<null | PermissionType[] | undefined>(
      getCustomUserEntityPermissionsData()
    );
  const [customEventsData, setCustomEventsData] = React.useState<
    Event[] | null | undefined
  >(getCustomEventsData());
  const [customMaintenanceData, setCustomMaintenanceData] = React.useState<
    AccountMaintenance[] | null | undefined
  >(getCustomMaintenanceData());
  const [customNotificationsData, setCustomNotificationsData] = React.useState<
    Notification[] | null | undefined
  >(getCustomNotificationsData());
  const [presetsCountMap, setPresetsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedPresetsMap);
  const [seeders, setSeeders] = React.useState<string[]>(loadedSeeders);
  const [seedsCountMap, setSeedsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedSeedsCountMap);
  const [mswEnabled, setMswEnabled] = React.useState(isMSWEnabled);
  const isCrudPreset =
    loadedBaselinePreset === 'baseline:crud' ||
    baselinePreset === 'baseline:crud';

  const [saveState, setSaveState] = React.useState<ServiceWorkerSaveState>({
    hasSaved: false,
    hasUnsavedChanges: false,
    mocksCleared: false,
  });

  React.useEffect(() => {
    const currentAccountData = getCustomAccountData();
    const currentProfileData = getCustomProfileData();
    const currentUserAccountPermissionsData =
      getCustomUserAccountPermissionsData();
    const currentUserEntityPermissionsData =
      getCustomUserEntityPermissionsData();
    const currentEventsData = getCustomEventsData();
    const currentMaintenanceData = getCustomMaintenanceData();
    const currentNotificationsData = getCustomNotificationsData();
    const hasCustomAccountChanges =
      JSON.stringify(currentAccountData) !== JSON.stringify(customAccountData);
    const hasCustomProfileChanges =
      JSON.stringify(currentProfileData) !== JSON.stringify(customProfileData);
    const hasCustomEventsChanges =
      JSON.stringify(currentEventsData) !== JSON.stringify(customEventsData);
    const hasCustomMaintenanceChanges =
      JSON.stringify(currentMaintenanceData) !==
      JSON.stringify(customMaintenanceData);
    const hasCustomNotificationsChanges =
      JSON.stringify(currentNotificationsData) !==
      JSON.stringify(customNotificationsData);

    const hasCustomUserAccountPermissionsChanges =
      JSON.stringify(currentUserAccountPermissionsData) !==
      JSON.stringify(customUserAccountPermissionsData);
    const hasCustomUserEntityPermissionsChanges =
      JSON.stringify(currentUserEntityPermissionsData) !==
      JSON.stringify(customUserEntityPermissionsData);

    if (
      hasCustomAccountChanges ||
      hasCustomProfileChanges ||
      hasCustomEventsChanges ||
      hasCustomMaintenanceChanges ||
      hasCustomNotificationsChanges ||
      hasCustomUserAccountPermissionsChanges ||
      hasCustomUserEntityPermissionsChanges
    ) {
      setSaveState((prev) => ({
        ...prev,
        hasUnsavedChanges: true,
      }));
    }
  }, [
    customAccountData,
    customEventsData,
    customMaintenanceData,
    customNotificationsData,
    customProfileData,
    customUserAccountPermissionsData,
    customUserEntityPermissionsData,
  ]);

  const globalHandlers = {
    applyChanges: () => {
      // Save base preset, extra presets, and content seeders to local storage.
      saveBaselinePreset(baselinePreset);
      saveExtraPresets(extraPresets);
      saveSeeders(seeders);
      saveSeedsCountMap(seedsCountMap);
      saveExtraPresetsMap(presetsCountMap);

      if (extraPresets.includes('account:custom') && customAccountData) {
        saveCustomAccountData(customAccountData);
      }

      if (extraPresets.includes('profile:custom') && customProfileData) {
        saveCustomProfileData(customProfileData);
      }
      if (extraPresets.includes('events:custom') && customEventsData) {
        saveCustomEventsData(customEventsData);
      }
      if (
        extraPresets.includes('maintenance:custom') &&
        customMaintenanceData
      ) {
        saveCustomMaintenanceData(customMaintenanceData);
      }
      if (
        extraPresets.includes('notifications:custom') &&
        customNotificationsData
      ) {
        saveCustomNotificationsData(customNotificationsData);
      }
      if (
        extraPresets.includes('userAccountPermissions:custom') &&
        customUserAccountPermissionsData
      ) {
        saveCustomUserAccountPermissionsData(customUserAccountPermissionsData);
      }
      if (
        extraPresets.includes('userEntityPermissions:custom') &&
        customUserEntityPermissionsData
      ) {
        saveCustomUserEntityPermissionsData(customUserEntityPermissionsData);
      }

      const promises = seeders.map((seederId) => {
        const seeder = dbSeeders.find((dbSeeder) => dbSeeder.id === seederId);

        return seeder?.seeder({} as MockState);
      });

      Promise.all(promises).then(() => {
        setSaveState((prevSaveState) => ({
          ...prevSaveState,
          hasSaved: true,
          hasUnsavedChanges: false,
        }));
      });

      window.location.reload();
    },

    discardChanges: () => {
      setBaselinePreset(getBaselinePreset());
      setExtraPresets(getExtraPresets());
      setSeeders(getSeeders(dbSeeders));
      setSeedsCountMap(getSeedsCountMap());
      setPresetsCountMap(getExtraPresetsMap());
      setCustomAccountData(getCustomAccountData());
      setCustomProfileData(getCustomProfileData());
      setCustomEventsData(getCustomEventsData());
      setCustomMaintenanceData(getCustomMaintenanceData());
      setCustomNotificationsData(getCustomNotificationsData());
      setCustomUserAccountPermissionsData(
        getCustomUserAccountPermissionsData()
      );
      setCustomUserEntityPermissionsData(getCustomUserEntityPermissionsData());
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: false,
      });
    },

    resetAll: () => {
      mswDB.clear('mockState');
      mswDB.clear('seedState');
      seederHandlers.removeAll();

      setBaselinePreset('baseline:static-mocking');
      setExtraPresets([]);
      setPresetsCountMap({});
      setCustomAccountData(null);
      setCustomProfileData(null);
      setCustomEventsData(null);
      setCustomMaintenanceData(null);
      setCustomNotificationsData(null);
      setCustomUserAccountPermissionsData(null);
      setCustomUserEntityPermissionsData(null);

      saveBaselinePreset('baseline:static-mocking');
      saveExtraPresets([]);
      saveSeeders([]);
      saveSeedsCountMap({});
      saveExtraPresetsMap({});
      saveCustomAccountData(null);
      saveCustomProfileData(null);
      saveCustomEventsData(null);
      saveCustomMaintenanceData(null);
      saveCustomNotificationsData(null);
      saveCustomUserAccountPermissionsData(null);
      saveCustomUserEntityPermissionsData(null);

      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
        mocksCleared: true,
      });
    },

    toggleMSW: (e: React.ChangeEvent<HTMLInputElement>) => {
      saveMSWEnabled(e.target.checked);
      setMswEnabled(e.target.checked);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },
  };

  const seederHandlers = {
    changeCount: (
      e: React.ChangeEvent<HTMLInputElement>,
      seederId: MockPresetCrudId
    ) => {
      setSeedsCountMap({
        ...seedsCountMap,
        [seederId]: parseInt(e.target.value, 10),
      });
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    removeAll: () => {
      // remove all seeds & reset all seed fields to 0
      setSeeders([]);
      setSeedsCountMap(
        Object.fromEntries(Object.keys(seedsCountMap).map((key) => [key, 0]))
      );
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    toggle: async (
      e: React.ChangeEvent<HTMLInputElement>,
      seederId: MockPresetCrudId
    ) => {
      const willEnable = e.target.checked;
      if (willEnable && !seeders.includes(seederId)) {
        setSeeders([...seeders, seederId]);
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      } else if (!willEnable && seeders.includes(seederId)) {
        setSeeders(
          seeders.filter((seeder) => {
            return seeder !== seederId;
          })
        );
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
        await removeSeeds(seederId);
      }
    },
  };

  const presetHandlers = {
    changeBase: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBaselinePreset(e.target.value as MockPresetBaselineId);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    changeCount: (
      e: React.ChangeEvent<HTMLInputElement>,
      presetId: MockPresetBaselineId
    ) => {
      setPresetsCountMap({
        ...presetsCountMap,
        [presetId]: parseInt(e.target.value, 10),
      });
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    changeSelect: (
      e: React.ChangeEvent<HTMLSelectElement>,
      groupId: MockPresetExtraGroup['id']
    ) => {
      const newPresetId = e.target.value;

      const updatedExtraPresets = extraPresets.filter((presetId) => {
        const preset = extraMockPresets.find((p) => p.id === presetId);

        return preset?.group.id !== groupId;
      });

      // Add the new preset if one was selected
      if (newPresetId) {
        updatedExtraPresets.push(newPresetId);
      }

      setExtraPresets(updatedExtraPresets);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    toggle: (
      e: React.ChangeEvent<HTMLInputElement>,
      presetId: MockPresetExtraId
    ) => {
      const willEnable = e.target.checked;
      if (willEnable && !extraPresets.includes(presetId)) {
        setExtraPresets([...extraPresets, presetId]);
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      } else if (!willEnable && extraPresets.includes(presetId)) {
        setExtraPresets(
          extraPresets.filter((handler) => {
            return handler !== presetId;
          })
        );
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      }
    },
  };

  return (
    <div className="dev-tools__tool">
      <div className="dev-tools__tool__header">
        <span title="Configure API mocking rules">API Mocks</span>
      </div>

      <div className="dev-tools__tool__body dev-tools__msw">
        <div className="dev-tools__msw__presets">
          <div>
            <label title="Enable MSW">
              <input
                checked={mswEnabled}
                onChange={(e) => globalHandlers.toggleMSW(e)}
                type="checkbox"
              />
              <span
                className={`dev-tools__msw__presets__toggle ${
                  mswEnabled ? 'enabled' : 'disabled'
                }`}
              >
                Enable MSW
              </span>
            </label>
          </div>
          <div>
            <span style={{ marginRight: 8 }}>Base Preset</span>
            <DevToolSelect
              onChange={(e) => presetHandlers.changeBase(e)}
              value={baselinePreset}
            >
              <BaselinePresetOptions />
            </DevToolSelect>
          </div>
        </div>
        <div className="dev-tools__msw__extras">
          <div className="dev-tools__msw__column">
            <div
              className={`dev-tools__msw__column__heading ${
                !isCrudPreset ? 'disabled' : ''
              }`}
            >
              Seeds <span style={{ fontSize: 12 }}>(CRUD preset only)</span>
              <button
                className="dev-tools-button small right-align"
                disabled={!isCrudPreset}
                onClick={() => seederHandlers.removeAll()}
              >
                Remove all seeds
              </button>
            </div>
            <div className="dev-tools__msw__column__body">
              <div className="dev-tools__list-box">
                <SeedOptions
                  disabled={!isCrudPreset}
                  onCountChange={seederHandlers.changeCount}
                  onToggleSeeder={seederHandlers.toggle}
                  seeders={seeders}
                  seedsCountMap={seedsCountMap}
                />
              </div>
            </div>
          </div>
          <div className="dev-tools__msw__column">
            <div className="dev-tools__msw__column__heading">Presets</div>
            <div className="dev-tools__msw__column__body">
              <div className="dev-tools__list-box">
                <ExtraPresetOptions
                  customAccountData={customAccountData}
                  customEventsData={customEventsData}
                  customMaintenanceData={customMaintenanceData}
                  customNotificationsData={customNotificationsData}
                  customProfileData={customProfileData}
                  customUserAccountPermissionsData={
                    customUserAccountPermissionsData
                  }
                  customUserEntityPermissionsData={
                    customUserEntityPermissionsData
                  }
                  handlers={extraPresets}
                  onCustomAccountChange={setCustomAccountData}
                  onCustomEventsChange={setCustomEventsData}
                  onCustomMaintenanceChange={setCustomMaintenanceData}
                  onCustomNotificationsChange={setCustomNotificationsData}
                  onCustomProfileChange={setCustomProfileData}
                  onCustomUserAccountPermissionsChange={
                    setCustomUserAccountPermissionsData
                  }
                  onCustomUserEntityPermissionsChange={
                    setCustomUserEntityPermissionsData
                  }
                  onPresetCountChange={presetHandlers.changeCount}
                  onSelectChange={presetHandlers.changeSelect}
                  onTogglePreset={presetHandlers.toggle}
                  presetsCountMap={presetsCountMap}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dev-tools__tool__footer">
        <div className="dev-tools__button-list">
          <button
            className="dev-tools-button"
            disabled={saveState.mocksCleared}
            onClick={globalHandlers.resetAll}
          >
            Reset all (Store, Seeds & Presets)
          </button>
          <button
            className="dev-tools-button"
            disabled={saveState.hasUnsavedChanges ? false : true}
            onClick={globalHandlers.discardChanges}
          >
            Discard Changes
          </button>
          <button
            className={`dev-tools-button ${
              saveState.hasUnsavedChanges ? 'green' : ''
            }`}
            disabled={saveState.hasUnsavedChanges ? false : true}
            onClick={globalHandlers.applyChanges}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
