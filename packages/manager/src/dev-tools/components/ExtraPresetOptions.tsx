import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { extraMockPresets } from 'src/mocks/presets';

interface ExtraPresetOptionsProps {
  disabled: boolean;
  handlers: string[];
  onTogglePreset: (e: React.ChangeEvent, presetId: string) => void;
  onPresetCountChange: (e: React.ChangeEvent, presetId: string) => void;
  presetsMap: { [key: string]: number };
}

/**
 * Renders a list of extra presets with an optional count.
 */
export const ExtraPresetOptions = ({
  disabled,
  handlers,
  onTogglePreset,
  onPresetCountChange,
  presetsMap,
}: ExtraPresetOptionsProps) => {
  return (
    <ul>
      {getMockPresetGroups(extraMockPresets).map((group) => (
        <div
          style={{
            // if last  group, add bottom padding
            paddingBottom:
              group ===
              getMockPresetGroups(extraMockPresets)[
                getMockPresetGroups(extraMockPresets).length - 1
              ]
                ? 4
                : 0,
          }}
          key={group}
        >
          <li className="dev-tools__list-box__separator">{group}</li>
          {extraMockPresets
            .filter((extraMockPreset) => extraMockPreset.group === group)
            .map((extraMockPreset) => (
              <li key={extraMockPreset.id}>
                <input
                  checked={
                    handlers.includes(extraMockPreset.id) ||
                    extraMockPreset.alwaysEnabled
                  }
                  style={{
                    display: extraMockPreset.alwaysEnabled ? 'none' : 'initial',
                    marginRight: 12,
                  }}
                  disabled={disabled}
                  onChange={(e) => onTogglePreset(e, extraMockPreset.id)}
                  type="checkbox"
                />
                <span title={extraMockPreset.desc || extraMockPreset.label}>
                  {extraMockPreset.label}
                </span>
                {extraMockPreset.alwaysEnabled && (
                  <input
                    aria-label={`Value for ${extraMockPreset.label}`}
                    min={0}
                    onChange={(e) => onPresetCountChange(e, extraMockPreset.id)}
                    type="number"
                    value={presetsMap[extraMockPreset.id] || 0}
                  />
                )}
              </li>
            ))}
        </div>
      ))}
    </ul>
  );
};
