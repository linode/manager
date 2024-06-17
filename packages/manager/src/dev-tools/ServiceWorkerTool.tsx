import * as React from 'react';

import { DevToolSelect } from './components/DevToolSelect';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { getContextPopulatorGroups } from 'src/mocks/mockContext';
import {
  baselineMockPresets,
  defaultBaselineMockPreset,
  extraMockPresets,
} from 'src/mocks/presets';

import { allContextPopulators } from 'src/mocks/context/populators';

const LOCAL_STORAGE_KEY = 'msw';
const LOCAL_STORAGE_POPULATORS_KEY = 'msw-populators';
const LOCAL_STORAGE_PRESET_KEY = 'msw-preset';
const LOCAL_STORAGE_PRESET_EXTRAS_KEY = 'msw-preset-extras';

/**
 * Whether MSW is enabled via local storage setting.
 *
 * `true` if MSW is enabled, `false` otherwise.
 */
export const isMSWEnabled =
  localStorage.getItem(LOCAL_STORAGE_KEY) === 'enabled';

/**
 * Enables or disables MSW via local storage setting.
 *
 * Reloads page upon changing setting.
 *
 * @param enabled - Whether or not to enable MSW.
 */
export const setMSWEnabled = (enabled: boolean) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, enabled ? 'enabled' : 'disabled');
  window.location.reload();
};

/**
 * Returns the ID of the selected MSW preset.
 *
 * @returns ID of selected MSW preset, or `null` if no preset is saved.
 */
export const getMSWPreset = () => {
  return (
    localStorage.getItem(LOCAL_STORAGE_PRESET_KEY) ??
    defaultBaselineMockPreset.id
  );
};

/**
 * Saves ID of selected MSW preset in local storage.
 *
 * If MSW is enabled, changing the selected MSW preset will trigger a page reload.
 */
export const setMSWPreset = (presetId: string) => {
  localStorage.setItem(LOCAL_STORAGE_PRESET_KEY, presetId);

  // if (presetId !== previousPreset && isMSWEnabled) {
  //   window.location.reload();
  // }
};

export const getMSWExtraPresets = (): string[] => {
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

export const setMSWExtraPresets = (presets: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_PRESET_EXTRAS_KEY, presets.join(','));
};

export const getMSWContextPopulators = (): string[] => {
  const encodedPopulators = localStorage.getItem(LOCAL_STORAGE_POPULATORS_KEY);
  if (!encodedPopulators) {
    return [];
  }
  const storedPopulators = encodedPopulators.split(',');

  // Filter out any stored populators that no longer exist in the code base.
  return storedPopulators.filter((storedPopulator) =>
    allContextPopulators.find(
      (contextPopulator) => contextPopulator.id === storedPopulator
    )
  );
};

export const setMSWContextPopulators = (populators: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_POPULATORS_KEY, populators.join(','));
  //window.location.reload();
};

const renderBaselinePresetOptions = () =>
  getMockPresetGroups(baselineMockPresets).map((group) => {
    return (
      <optgroup label={group || 'Uncategorized'} key={group || 'Uncategorized'}>
        {baselineMockPresets
          .filter((mockPreset) => mockPreset.group === group)
          .map((mockPreset) => {
            return (
              <option value={mockPreset.id} key={mockPreset.id}>
                {mockPreset.label}
              </option>
            );
          })}
      </optgroup>
    );
  });

const renderContentPopulatorOptions = (
  populators: string[],
  onChange: (e: React.ChangeEvent, populatorId: string) => void
) => {
  return (
    <ul>
      {getContextPopulatorGroups(allContextPopulators).map((group) => (
        <>
          <li
            key={group || 'Uncategorized'}
            className="dev-tools__list-box__separator"
          >
            {group || 'Uncategorized'}
          </li>
          {allContextPopulators
            .filter((contextPopulator) => contextPopulator.group === group)
            .map((contextPopulator) => (
              <li key={contextPopulator.id}>
                <input
                  type="checkbox"
                  style={{ marginRight: 12 }}
                  checked={populators.includes(contextPopulator.id)}
                  onChange={(e) => onChange(e, contextPopulator.id)}
                />
                <span title={contextPopulator.desc || contextPopulator.label}>
                  {contextPopulator.label}
                </span>
              </li>
            ))}
        </>
      ))}
    </ul>
  );
};

const renderExtraPresetOptions = (
  handlers: string[],
  onChange: (e: React.ChangeEvent, presetId: string) => void
) => {
  return (
    <ul>
      {getMockPresetGroups(extraMockPresets).map((group) => (
        <>
          <li
            key={group || 'Uncategorized'}
            className="dev-tools__list-box__separator"
          >
            {group || 'Uncategorized'}
          </li>
          {extraMockPresets
            .filter((extraMockPreset) => extraMockPreset.group === group)
            .map((extraMockPreset) => (
              <li key={extraMockPreset.id}>
                <input
                  type="checkbox"
                  style={{ marginRight: 12 }}
                  checked={handlers.includes(extraMockPreset.id)}
                  onChange={(e) => onChange(e, extraMockPreset.id)}
                />
                <span title={extraMockPreset.desc || extraMockPreset.label}>
                  {extraMockPreset.label}
                </span>
              </li>
            ))}
        </>
      ))}
    </ul>
  );
};

interface ServiceWorkerSaveState {
  hasUnsavedChanges: boolean;
  hasSaved: boolean;
}

export const ServiceWorkerTool = () => {
  const loadedBasePreset = getMSWPreset();
  const loadedPresets = getMSWExtraPresets();
  const loadedPopulators = getMSWContextPopulators();

  const [MSWBasePreset, setMSWBasePreset] = React.useState<string>(
    loadedBasePreset
  );
  const [MSWHandlers, setMSWHandlers] = React.useState<string[]>(loadedPresets);
  const [MSWPopulators, setMSWPopulators] = React.useState<string[]>(
    loadedPopulators
  );

  const [saveState, setSaveState] = React.useState<ServiceWorkerSaveState>({
    hasUnsavedChanges: false,
    hasSaved: false,
  });

  // React.useEffect(() => {
  //   if (!MSWPreset) {
  //     const storedPreset = localStorage.getItem(LOCAL_STORAGE_PRESET_KEY);
  //     const newPreset = storedPreset || defaultBaselineMockPreset.id;
  //     setMSWPreset(newPreset);
  //   } else {
  //     saveMSWPreset(MSWPreset);
  //   }
  // }, [MSWPreset]);

  const handleChangeBasePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMSWBasePreset(e.target.value);
    setSaveState({
      hasSaved: false,
      hasUnsavedChanges: true,
    });
  };

  const handleChangePopulator = (
    e: React.ChangeEvent<HTMLInputElement>,
    populatorId: string
  ) => {
    const willEnable = e.target.checked;
    if (willEnable && !MSWPopulators.includes(populatorId)) {
      setMSWPopulators([...MSWPopulators, populatorId]);
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    } else if (!willEnable && MSWPopulators.includes(populatorId)) {
      setMSWPopulators(
        MSWPopulators.filter((populator) => {
          return populator !== populatorId;
        })
      );
      setSaveState({
        hasSaved: false,
        hasUnsavedChanges: true,
      });
    }
  };

  const handleChangeHandler = (
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
  };

  const handleApplyChanges = () => {
    // Save base preset, extra presets, and content populators to local storage.
    setMSWPreset(MSWBasePreset);
    setMSWExtraPresets(MSWHandlers);
    setMSWContextPopulators(MSWPopulators);

    // Update save state to reflect saved changes if page does not refresh.
    setSaveState({
      hasUnsavedChanges: false,
      hasSaved: true,
    });

    // We only have to reload the window if MSW is already enabled. Otherwise,
    // the changes will automatically be picked up next time MSW is enabled.
    if (isMSWEnabled) {
      window.location.reload();
    }
  };

  // const saveContentAndHandlers = () => {

  // };

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
              onChange={(e) => setMSWEnabled(e.target.checked)}
              style={{ margin: 0 }}
              type="checkbox"
            />
            <span style={{ marginLeft: 8 }}>
              <span>Enable MSW</span>
            </span>
          </div>
          <div>
            <span style={{ marginRight: 8 }}>Base Preset</span>
            <DevToolSelect
              value={MSWBasePreset}
              onChange={(e) => handleChangeBasePreset(e)}
            >
              {renderBaselinePresetOptions()}
            </DevToolSelect>
          </div>
        </div>
        <div className="dev-tools__msw__extras">
          <div className="dev-tools__msw__column">
            <div className="dev-tools__msw__column__heading">Content</div>
            <div className="dev-tools__msw__column__body">
              <div className="dev-tools__list-box">
                {renderContentPopulatorOptions(
                  MSWPopulators,
                  handleChangePopulator
                )}
              </div>
            </div>
          </div>
          <div className="dev-tools__msw__column">
            <div className="dev-tools__msw__column__heading">Presets</div>
            <div className="dev-tools__msw__column__body">
              <div className="dev-tools__list-box">
                {renderExtraPresetOptions(MSWHandlers, handleChangeHandler)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dev-tools__tool__footer">
        <div className="dev-tools__button-list">
          {saveState.hasSaved && <span>Your changes have been saved.</span>}
          <button disabled={saveState.hasUnsavedChanges ? false : true}>
            Discard Changes
          </button>
          <button
            disabled={saveState.hasUnsavedChanges ? false : true}
            onClick={handleApplyChanges}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
