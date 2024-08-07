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
    disabled,
    group,
    handlers,
    onPresetCountChange,
    onTogglePreset,
    presetsCountMap,
  } = props;
  const [localValues, setLocalValues] = React.useState<{
    [key: string]: string;
  }>(() =>
    Object.fromEntries(
      Object.entries(presetsCountMap).map(([key, value]) => [
        key,
        String(value),
      ])
    )
  );

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
                  onBlur={(e) => {
                    const value = e.target.value === '' ? '0' : e.target.value;
                    setLocalValues((prev) => ({
                      ...prev,
                      [extraMockPreset.id]: value,
                    }));
                    onPresetCountChange(
                      {
                        target: { value },
                      } as React.ChangeEvent<HTMLInputElement>,
                      extraMockPreset.id
                    );
                  }}
                  onChange={(e) => {
                    setLocalValues((prev) => ({
                      ...prev,
                      [extraMockPreset.id]: e.target.value,
                    }));
                  }}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  value={
                    localValues[extraMockPreset.id] ??
                    (presetsCountMap[extraMockPreset.id] || '0')
                  }
                  aria-label={`Value for ${extraMockPreset.label}`}
                  disabled={disabled || !handlers.includes(extraMockPreset.id)}
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
