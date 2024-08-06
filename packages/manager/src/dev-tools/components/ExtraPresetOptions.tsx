import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { extraMockPresets } from 'src/mocks/presets';

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
              <li
                key={extraMockPreset.id}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <div>
                  <input
                    style={{
                      marginRight: 12,
                    }}
                    checked={handlers.includes(extraMockPreset.id)}
                    disabled={disabled}
                    onChange={(e) => onTogglePreset(e, extraMockPreset.id)}
                    type="checkbox"
                  />
                  <span title={extraMockPreset.desc || extraMockPreset.label}>
                    {extraMockPreset.label}
                  </span>
                </div>
                {extraMockPreset.canUpdateCount && (
                  <div
                    style={{
                      display: 'flex',
                      position: 'relative',
                      width: 85,
                    }}
                  >
                    <span
                      style={{
                        color: '#000',
                        left: '5px',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      +
                    </span>
                    <input
                      onChange={(e) =>
                        onPresetCountChange(e, extraMockPreset.id)
                      }
                      aria-label={`Value for ${extraMockPreset.label}`}
                      disabled={disabled}
                      min={0}
                      style={{ paddingLeft: '20px', width: '100%' }}
                      type="number"
                      value={presetsCountMap[extraMockPreset.id] || 0}
                    />
                  </div>
                )}
              </li>
            ))}
        </div>
      ))}
    </ul>
  );
};
