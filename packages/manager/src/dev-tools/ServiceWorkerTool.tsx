import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';
import { mswDB } from 'src/mocks/indexedDB';
import { dbSeeders } from 'src/mocks/seeds';
import { removeSeeds } from 'src/mocks/utilities/seedUtils';

import { BaselinePresetOptions } from './components/BaselinePresetOptions';
import { DevToolSelect } from './components/DevToolSelect';
import { ExtraPresetOptions } from './components/ExtraPresetOptions';
import { SeedOptions } from './components/SeedOptions';
import {
  getMSWContextSeeders,
  getMSWExtraPresets,
  getMSWPreset,
  getMSWPresetsMap,
  getMSWSeedsCountMap,
  isMSWEnabled,
  saveMSWContextPopulators,
  saveMSWEnabled,
  saveMSWExtraPresets,
  saveMSWPreset,
  saveMSWPresetsMap,
  saveMSWSeedsCountMap,
} from './utils';

import type { MockSeederIds, MockState } from 'src/mocks/types';

interface ServiceWorkerSaveState {
  hasSaved: boolean;
  hasUnsavedChanges: boolean;
  mocksCleared?: boolean;
}

/**
 * Renders the service worker tool.
 */
export const ServiceWorkerTool = () => {
  const loadedBasePreset = getMSWPreset();
  const loadedPresets = getMSWExtraPresets();
  const loadedSeeders = getMSWContextSeeders(dbSeeders);
  const loadedSeedsCountMap = getMSWSeedsCountMap();
  const loadedPresetsMap = getMSWPresetsMap();
  const [MSWBasePreset, setMSWBasePreset] = React.useState<string>(
    loadedBasePreset
  );
  const [MSWHandlers, setMSWHandlers] = React.useState<string[]>(loadedPresets);
  const [MSWSeeders, setMSWSeeders] = React.useState<string[]>(loadedSeeders);
  const [seedsCountMap, setSeedsCountMap] = React.useState<{
    [key: string]: number;
  }>(loadedSeedsCountMap);
  const [presetsMap, setPresetsMap] = React.useState<{
    [key: string]: number;
  }>({
    ...loadedPresetsMap,
    // set defaults
    'api-response-time': loadedPresetsMap['api-response-time'] ?? 400,
  });

  const [saveState, setSaveState] = React.useState<ServiceWorkerSaveState>({
    hasSaved: false,
    hasUnsavedChanges: false,
    mocksCleared: false,
  });

  const globalHandlers = {
    applyChanges: () => {
      // Save base preset, extra presets, and content populators to local storage.
      saveMSWPreset(MSWBasePreset);
      saveMSWExtraPresets(MSWHandlers);
      saveMSWContextPopulators(MSWSeeders);
      saveMSWSeedsCountMap(seedsCountMap);
      saveMSWPresetsMap(presetsMap);

      const promises = MSWSeeders.map((seederId) => {
        const populator = dbSeeders.find(
          (dbSeeder) => dbSeeder.id === seederId
        );

        return populator?.seeder({} as MockState);
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
      setMSWBasePreset(getMSWPreset());
      setMSWHandlers(getMSWExtraPresets());
      setMSWSeeders(getMSWContextSeeders(dbSeeders));
      setSeedsCountMap(getMSWSeedsCountMap());
      setPresetsMap(getMSWPresetsMap());
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: false,
      });
    },

    resetAll: () => {
      mswDB.clear('mockState');
      mswDB.clear('seedState');
      seederHandlers.removeAll();
      setMSWBasePreset(getMSWPreset());
      setMSWHandlers(getMSWExtraPresets());
      setPresetsMap({
        ...loadedPresetsMap,
        'api-response-time': 400,
      });
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
      seederId: MockSeederIds
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
      if (parseInt(e.target.value, 10) > 0 && !MSWSeeders.includes(seederId)) {
        setMSWSeeders([...MSWSeeders, seederId]);
      }
      // if value is 0, uncheck the checkbox
      if (parseInt(e.target.value, 10) === 0 && MSWSeeders.includes(seederId)) {
        setMSWSeeders(MSWSeeders.filter((seeder) => seeder !== seederId));
      }
    },

    handleToggle: async (
      e: React.ChangeEvent<HTMLInputElement>,
      seederId: MockSeederIds
    ) => {
      const willEnable = e.target.checked;
      if (willEnable && !MSWSeeders.includes(seederId)) {
        setMSWSeeders([...MSWSeeders, seederId]);
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      } else if (!willEnable && MSWSeeders.includes(seederId)) {
        setMSWSeeders(
          MSWSeeders.filter((seeder) => {
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
      setMSWSeeders([]);
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
      setMSWBasePreset(e.target.value);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    changeCount: (e: React.ChangeEvent<HTMLInputElement>, presetId: string) => {
      setPresetsMap({
        ...presetsMap,
        [presetId]: parseInt(e.target.value, 10),
      });
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    },

    toggle: (
      e: React.ChangeEvent<HTMLInputElement>,
      handlerPresetId: string
    ) => {
      const willEnable = e.target.checked;
      if (willEnable && !MSWHandlers.includes(handlerPresetId)) {
        setMSWHandlers([...MSWHandlers, handlerPresetId]);
        setSaveState({
          hasSaved: false,
          hasUnsavedChanges: true,
        });
      } else if (!willEnable && MSWHandlers.includes(handlerPresetId)) {
        setMSWHandlers(
          MSWHandlers.filter((handler) => {
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
            <Tooltip
              placement="top"
              title={!isMSWEnabled ? 'Enable MSW to select a preset' : ''}
            >
              <div>
                <span
                  style={{ marginRight: 8, opacity: !isMSWEnabled ? 0.5 : 1 }}
                >
                  Base Preset
                </span>
                <DevToolSelect
                  disabled={!isMSWEnabled}
                  onChange={(e) => presetHandlers.changeBase(e)}
                  value={MSWBasePreset}
                >
                  <BaselinePresetOptions />
                </DevToolSelect>
              </div>
            </Tooltip>
          </div>
        </div>
        <Tooltip
          placement="top"
          title={!isMSWEnabled ? 'Enable MSW to select a preset' : ''}
        >
          <div
            className={`dev-tools__msw__extras ${
              !isMSWEnabled ? 'disabled' : ''
            }`}
          >
            <div className="dev-tools__msw__column">
              <div className="dev-tools__msw__column__heading">
                Seeds{' '}
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
                    disabled={!isMSWEnabled}
                    onCountChange={seederHandlers.handleCountChange}
                    onToggleSeeder={seederHandlers.handleToggle}
                    seeders={MSWSeeders}
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
                    handlers={MSWHandlers}
                    onPresetCountChange={presetHandlers.changeCount}
                    onTogglePreset={presetHandlers.toggle}
                    presetsMap={presetsMap}
                  />
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
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
