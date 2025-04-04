import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';

import type { ExtraPresetOptionsProps } from './ExtraPresetOptions';

interface ExtraPresetOptionCheckboxProps
  extends Omit<
    ExtraPresetOptionsProps,
    'onPresetCountChange' | 'onTogglePreset'
  > {
  group: string;
}

export const ExtraPresetOptionSelect = (
  props: ExtraPresetOptionCheckboxProps
) => {
  const { group, handlers, onSelectChange } = props;

  return (
    <div>
      <select
        value={
          handlers.find(
            (h) =>
              extraMockPresets.find((p) => p.id === h && p.group.id === group)
                ?.id
          ) || ''
        }
        className="dt-select dev-tools__select thin"
        onChange={(e) => onSelectChange(e, group)}
        style={{ width: 125 }}
      >
        <option value="">No preset</option>
        {extraMockPresets
          .filter((extraMockPreset) => extraMockPreset.group.id === group)
          .map((extraMockPreset) => (
            <option
              key={extraMockPreset.id}
              title={extraMockPreset.desc || extraMockPreset.label}
              value={extraMockPreset.id}
            >
              {extraMockPreset.label}
            </option>
          ))}
      </select>
    </div>
  );
};
