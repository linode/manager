import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';

import type { ExtraPresetOptionsProps } from './ExtraPresetOptions';

interface ExtraPresetOptionCheckboxProps
  extends Omit<ExtraPresetOptionsProps, 'onSelectChange'> {
  group: string;
}

export const ExtraPresetOptionCheckbox = (
  props: ExtraPresetOptionCheckboxProps
) => {
  const {
    group,
    handlers,
    onPresetCountChange,
    onTogglePreset,
    presetsCountMap,
  } = props;

  return extraMockPresets
    .filter((extraMockPreset) => extraMockPreset.group.id === group)
    .map(
      (extraMockPreset) =>
        extraMockPreset.group.type === 'checkbox' && (
          <li
            className="dev-tools__list-box__separator"
            key={extraMockPreset.id}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <div>
              <label title={extraMockPreset.desc || extraMockPreset.label}>
                <input
                  checked={handlers.includes(extraMockPreset.id)}
                  onChange={(e) => onTogglePreset(e, extraMockPreset.id)}
                  type="checkbox"
                />
                {extraMockPreset.label}
              </label>
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
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      e.target.value = '0';
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    onPresetCountChange(
                      {
                        target: { value },
                      } as React.ChangeEvent<HTMLInputElement>,
                      extraMockPreset.id
                    );
                  }}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  value={
                    presetsCountMap[extraMockPreset.id] ??
                    (presetsCountMap[extraMockPreset.id] || '0')
                  }
                  aria-label={`Value for ${extraMockPreset.label}`}
                  disabled={!handlers.includes(extraMockPreset.id)}
                  min={0}
                  style={{ paddingLeft: '20px', width: '100%' }}
                  type="number"
                />
              </div>
            )}
          </li>
        )
    );
};
