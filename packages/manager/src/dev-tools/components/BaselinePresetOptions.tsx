import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { baselineMockPresets } from 'src/mocks/presets';

/**
 * Renders a select with options for baseline presets
 */
export const BaselinePresetOptions = () => {
  return getMockPresetGroups(baselineMockPresets).map((group) => (
    <optgroup key={group} label={group}>
      {baselineMockPresets
        .filter((mockPreset) => mockPreset.group.id === group)
        .map((mockPreset) => {
          return (
            <option key={mockPreset.id} value={mockPreset.id}>
              {mockPreset.label}
            </option>
          );
        })}
    </optgroup>
  ));
};
