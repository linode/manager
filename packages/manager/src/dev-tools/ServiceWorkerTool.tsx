import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';
import { mswDB } from 'src/mocks/indexedDB';
import { dbSeeders } from 'src/mocks/seeds';
import { removeSeeds } from 'src/mocks/seeds/utils';

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
  MockPresetBaselineGroupId,
  MockPresetCrudGroupId,
  MockPresetExtraGroupId,
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
  const isCrudPreset = loadedBaselinePreset === 'baseline:crud';
  const [
    baselinePreset,
    setBaselinePreset,
  ] = React.useState<MockPresetBaselineGroupId>(loadedBaselinePreset);
  const [extraPreset, setExtraPreset] = React.useState<string[]>(
    loadedExtraPresets
  );
  const [presetsCountMap, setPresetsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedPresetsMap);
  const [seeders, setSeeders] = React.useState<string[]>(loadedSeeders);
  const [seedsCountMap, setSeedsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedSeedsCountMap);

  const [saveState, setSaveState] = React.useState<ServiceWorkerSaveState>({
    hasSaved: false,
    hasUnsavedChanges: false,
    mocksCleared: false,
  });

  const globalHandlers = {
    applyChanges: () => {
      // Save base preset, extra presets, and content seeders to local storage.
      saveBaselinePreset(baselinePreset);
      saveExtraPresets(extraPreset);
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
      setExtraPreset(getExtraPresets());
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
      setBaselinePreset(getBaselinePreset());
      setExtraPreset(getExtraPresets());
      setPresetsCountMap(loadedPresetsMap);
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
    handleCountChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      seederId: MockPresetCrudGroupId
    ) => {
      const updatedCountMap = {
        ...seedsCountMap,
        [seederId]: parseInt(e.target.value, 10),
      };

      setSeedsCountMap(updatedCountMap);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
      // When updating the count and the checkbox is not checked, check it for convenience
      if (parseInt(e.target.value, 10) > 0 && !seeders.includes(seederId)) {
        setSeeders([...seeders, seederId]);
      }
      // if value is 0, uncheck the checkbox
      if (parseInt(e.target.value, 10) === 0 && seeders.includes(seederId)) {
        setSeeders(seeders.filter((seeder) => seeder !== seederId));
      }
    },

    handleToggle: async (
      e: React.ChangeEvent<HTMLInputElement>,
      seederId: MockPresetCrudGroupId
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
  };

  const presetHandlers = {
    changeBase: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBaselinePreset(e.target.value as MockPresetBaselineGroupId);
      saveBaselinePreset(e.target.value as MockPresetBaselineGroupId);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    changeCount: (
      e: React.ChangeEvent<HTMLInputElement>,
      presetId: MockPresetBaselineGroupId
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

    toggle: (
      e: React.ChangeEvent<HTMLInputElement>,
      handlerPresetId: MockPresetExtraGroupId
    ) => {
      const willEnable = e.target.checked;
      if (willEnable && !extraPreset.includes(handlerPresetId)) {
        setExtraPreset([...extraPreset, handlerPresetId]);
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      } else if (!willEnable && extraPreset.includes(handlerPresetId)) {
        setExtraPreset(
          extraPreset.filter((handler) => {
            return handler !== handlerPresetId;
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
              <div className="dev-tools__msw__column__heading">
                Seeds <span style={{ fontSize: 12 }}>(CRUD preset only)</span>
                <button
                  className="small right-align"
                  onClick={() => seederHandlers.removeAll()}
                >
                  Remove all seeds
                </button>
              </div>
              <div className="dev-tools__msw__column__body">
                <div className="dev-tools__list-box">
                  <SeedOptions
                    disabled={!isMSWEnabled || !isCrudPreset}
                    onCountChange={seederHandlers.handleCountChange}
                    onToggleSeeder={seederHandlers.handleToggle}
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
                    handlers={extraPreset}
                    onPresetCountChange={presetHandlers.changeCount}
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
            Reset to Defaults
          </button>
          <button
            disabled={saveState.hasUnsavedChanges ? false : true}
            onClick={globalHandlers.discardChanges}
          >
            Discard Changes
          </button>
          <button
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
