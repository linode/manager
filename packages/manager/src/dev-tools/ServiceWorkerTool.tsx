import * as React from 'react';
import { getMockPresetGroups } from 'src/mocks/mockPreset';
import {
  baselineMockPresets,
  defaultBaselineMockPreset,
  extraMockPresets,
} from 'src/mocks/presets';

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
  return localStorage.getItem(LOCAL_STORAGE_PRESET_KEY);
};

/**
 * Saves ID of selected MSW preset in local storage.
 *
 * If MSW is enabled, changing the selected MSW preset will trigger a page reload.
 */
export const saveMSWPreset = (presetId: string) => {
  const previousPreset = localStorage.getItem(LOCAL_STORAGE_PRESET_KEY);
  localStorage.setItem(LOCAL_STORAGE_PRESET_KEY, presetId);

  if (presetId !== previousPreset && isMSWEnabled) {
    window.location.reload();
  }
};

export const getMSWExtraPresets = (): string[] => {
  const encodedPresets = localStorage.getItem(LOCAL_STORAGE_PRESET_EXTRAS_KEY);
  if (!encodedPresets) {
    return [];
  }
  return encodedPresets.split(',');
};

export const setMSWExtraPresets = (presets: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_PRESET_EXTRAS_KEY, presets.join(','));
  window.location.reload();
};

export const getMSWContextPopulators = (): string[] => {
  const encodedPopulators = localStorage.getItem(LOCAL_STORAGE_POPULATORS_KEY);
  if (!encodedPopulators) {
    return [];
  }
  return encodedPopulators.split(',');
};

export const setMSWContextPopulators = (populators: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_POPULATORS_KEY, populators.join(','));
  window.location.reload();
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

// const renderBaselinePresetOptions = () => baselineMockPresets.map((mockPreset) => {
//   return <option value={mockPreset.id}>{mockPreset.label}</option>;
// });

const renderExtraPresetOptions = () => {
  return (
    <div>
      <form>
        {extraMockPresets.map((extraMockPreset) => {
          return (
            <div key={extraMockPreset.id}>
              <input type="checkbox" />
              {extraMockPreset.label}
            </div>
          );
        })}
      </form>
    </div>
  );
};

export const ServiceWorkerTool = () => {
  const [MSWPreset, setMSWPreset] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!MSWPreset) {
      const storedPreset = localStorage.getItem(LOCAL_STORAGE_PRESET_KEY);
      const newPreset = storedPreset || defaultBaselineMockPreset.id;
      setMSWPreset(newPreset);
    } else {
      saveMSWPreset(MSWPreset);
    }
  }, [MSWPreset]);

  return (
    <>
      <input
        checked={isMSWEnabled}
        onChange={(e) => setMSWEnabled(e.target.checked)}
        style={{ margin: 0 }}
        type="checkbox"
      />
      <span style={{ marginLeft: 8 }}>
        <span style={{ color: isMSWEnabled ? '#aaff00' : 'white' }}>
          {isMSWEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </span>
      <hr />
      <div style={{ marginBottom: 8 }}>
        <span style={{ display: 'block' }}>Preset</span>
        <select
          value={MSWPreset || undefined}
          onChange={(e) => setMSWPreset(e.target.value)}
        >
          {renderBaselinePresetOptions()}
        </select>
      </div>

      <span style={{ display: 'block' }}>Extra Handlers</span>
      {renderExtraPresetOptions()}
    </>
  );
};
