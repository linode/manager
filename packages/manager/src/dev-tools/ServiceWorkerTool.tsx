import { Tooltip } from '@linode/ui';
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
  getExtraPresets,
  getExtraPresetsMap,
  getSeeders,
  getSeedsCountMap,
  isMSWEnabled,
  saveBaselinePreset,
  saveExtraPresets,
  saveExtraPresetsMap,
  saveMSWEnabled,
  saveSeeders,
  saveSeedsCountMap,
} from './utils';

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
  const [
    baselinePreset,
    setBaselinePreset,
  ] = React.useState<MockPresetBaselineId>(loadedBaselinePreset);
  const [extraPresets, setExtraPresets] = React.useState<string[]>(
    loadedExtraPresets
  );
  const [presetsCountMap, setPresetsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedPresetsMap);
  const [seeders, setSeeders] = React.useState<string[]>(loadedSeeders);
  const [seedsCountMap, setSeedsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedSeedsCountMap);
  const isCrudPreset =
    loadedBaselinePreset === 'baseline:crud' ||
    baselinePreset === 'baseline:crud';

  const [saveState, setSaveState] = React.useState<ServiceWorkerSaveState>({
    hasSaved: false,
    hasUnsavedChanges: false,
    mocksCleared: false,
  });

  const globalHandlers = {
    applyChanges: () => {
      // Save base preset, extra presets, and content seeders to local storage.
      saveBaselinePreset(baselinePreset);
      saveExtraPresets(extraPresets);
      saveSeeders(seeders);
      saveSeedsCountMap(seedsCountMap);
      saveExtraPresetsMap(presetsCountMap);

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

      // We only have to reload the window if MSW is already enabled. Otherwise,
      // the changes will automatically be picked up next time MSW is enabled.
      if (isMSWEnabled) {
        window.location.reload();
      }
    },

    discardChanges: () => {
      setBaselinePreset(getBaselinePreset());
      setExtraPresets(getExtraPresets());
      setSeeders(getSeeders(dbSeeders));
      setSeedsCountMap(getSeedsCountMap());
      setPresetsCountMap(getExtraPresetsMap());
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: false,
      });
    },

    resetAll: () => {
      mswDB.clear('mockState');
      mswDB.clear('seedState');
      seederHandlers.removeAll();
      setBaselinePreset('baseline:preset-mocking');
      setExtraPresets([]);
      setPresetsCountMap({});
      saveBaselinePreset('baseline:preset-mocking');
      saveExtraPresets([]);
      saveSeeders([]);
      saveSeedsCountMap({});
      saveExtraPresetsMap({});

      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
        mocksCleared: true,
      });
    },

    toggleMSW: (e: React.ChangeEvent<HTMLInputElement>) => {
      saveMSWEnabled(e.target.checked);
      window.location.reload();
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
      <Tooltip
        placement="top"
        title={!isMSWEnabled ? '⚠️ Enable MSW to select a preset' : ''}
      >
        <div className="dev-tools__tool__body dev-tools__msw">
          <div className="dev-tools__msw__presets">
            <div>
              <input
                checked={isMSWEnabled}
                onChange={(e) => globalHandlers.toggleMSW(e)}
                style={{ margin: 0 }}
                type="checkbox"
              />
              <span style={{ marginLeft: 8 }}>
                <span>Enable MSW</span>
              </span>
            </div>
            <div>
              <span
                style={{ marginRight: 8, opacity: !isMSWEnabled ? 0.5 : 1 }}
              >
                Base Preset
              </span>
              <DevToolSelect
                disabled={!isMSWEnabled}
                onChange={(e) => presetHandlers.changeBase(e)}
                value={baselinePreset}
              >
                <BaselinePresetOptions />
              </DevToolSelect>
            </div>
          </div>
          <div
            className={`dev-tools__msw__extras ${
              !isMSWEnabled ? 'disabled' : ''
            }`}
          >
            <div className="dev-tools__msw__column">
              <div
                className={`dev-tools__msw__column__heading ${
                  !isCrudPreset ? 'disabled' : ''
                }`}
              >
                Seeds <span style={{ fontSize: 12 }}>(CRUD preset only)</span>
                <button
                  className="small right-align"
                  disabled={!isMSWEnabled || !isCrudPreset}
                  onClick={() => seederHandlers.removeAll()}
                >
                  Remove all seeds
                </button>
              </div>
              <div className="dev-tools__msw__column__body">
                <div className="dev-tools__list-box">
                  <SeedOptions
                    disabled={!isMSWEnabled || !isCrudPreset}
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
                    disabled={!isMSWEnabled}
                    handlers={extraPresets}
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
      </Tooltip>
      <div className="dev-tools__tool__footer">
        <div className="dev-tools__button-list">
          <button
            disabled={saveState.mocksCleared}
            onClick={globalHandlers.resetAll}
          >
            Reset all (Store, Seeds & Presets)
          </button>
          <button
            disabled={saveState.hasUnsavedChanges ? false : true}
            onClick={globalHandlers.discardChanges}
          >
            Discard Changes
          </button>
          <button
            className={saveState.hasUnsavedChanges ? 'green' : ''}
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
