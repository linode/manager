import * as React from 'react';

import { getStateSeederGroups } from 'src/mocks/mockState';
import { dbSeeders } from 'src/mocks/presets/crud/seeds';

interface SeedOptionsProps {
  disabled: boolean;
  onCountChange: (e: React.ChangeEvent, populatorId: string) => void;
  onToggleSeeder: (e: React.ChangeEvent, populatorId: string) => void;
  seeders: string[];
  seedsCountMap: { [key: string]: number };
}

/**
 * Renders a list of seeders and their counts.
 */
export const SeedOptions = ({
  disabled,
  onCountChange,
  onToggleSeeder,
  seeders,
  seedsCountMap,
}: SeedOptionsProps) => {
  return (
    <ul>
      {getStateSeederGroups(dbSeeders).map((group) => (
        <div key={group}>
          {dbSeeders
            .filter((dbSeeder) => dbSeeder.group.id === group)
            .map((dbSeeder) => (
              <li key={dbSeeder.id}>
                <label title={dbSeeder.desc || dbSeeder.label}>
                  <input
                    checked={seeders.includes(dbSeeder.id)}
                    disabled={disabled}
                    onChange={(e) => onToggleSeeder(e, dbSeeder.id)}
                    type="checkbox"
                  />
                  {dbSeeder.label}
                </label>
                {dbSeeder.canUpdateCount && (
                  <input
                    aria-label={`Value for ${dbSeeder.label}`}
                    disabled={disabled || !seeders.includes(dbSeeder.id)}
                    min={0}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        e.target.value = '0';
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      onCountChange(
                        {
                          target: { value },
                        } as React.ChangeEvent<HTMLInputElement>,
                        dbSeeder.id
                      );
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.value = '';
                      }
                    }}
                    style={{ marginLeft: 8, width: 60 }}
                    type="number"
                    value={seedsCountMap[dbSeeder.id] || '0'}
                  />
                )}
              </li>
            ))}
        </div>
      ))}
    </ul>
  );
};
