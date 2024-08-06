import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { extraMockPresets } from 'src/mocks/presets';

import { getMSWPreset } from '../utils';

interface ExtraPresetOptionsProps {
  disabled: boolean;
  handlers: string[];
  onPresetCountChange: (e: React.ChangeEvent, presetId: string) => void;
  onTogglePreset: (e: React.ChangeEvent, presetId: string) => void;
  presetsCountMap: { [key: string]: number };
}

/**
 * Renders a list of extra presets with an optional count.
 */
export const ExtraPresetOptions = ({
  disabled,
  handlers,
  onPresetCountChange,
  onTogglePreset,
  presetsCountMap,
}: ExtraPresetOptionsProps) => {
  const isCrudPreset = getMSWPreset() === 'baseline-crud';

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
                  disabled={
                    disabled ||
                    (!isCrudPreset &&
                      extraMockPreset.id === 'api-response-time')
                  }
                  style={{
                    marginRight: 12,
                  }}
                  checked={handlers.includes(extraMockPreset.id)}
                  onChange={(e) => onTogglePreset(e, extraMockPreset.id)}
                  type="checkbox"
                />
                <span title={extraMockPreset.desc || extraMockPreset.label}>
                  {extraMockPreset.label}
                </span>
                {extraMockPreset.canUpdateCount && (
                  <input
                    disabled={
                      disabled ||
                      (!isCrudPreset &&
                        extraMockPreset.id === 'api-response-time')
                    }
                    aria-label={`Value for ${extraMockPreset.label}`}
                    min={0}
                    onChange={(e) => onPresetCountChange(e, extraMockPreset.id)}
                    type="number"
                    value={presetsCountMap[extraMockPreset.id] || 0}
                  />
                )}
              </li>
            ))}
        </div>
      ))}
    </ul>
  );
};
