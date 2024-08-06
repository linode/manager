import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';
import { getStateSeederGroups } from 'src/mocks/mockState';
import { dbSeeders } from 'src/mocks/seeds';

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
    <Tooltip
      title={disabled ? 'MSW must be in CRUD mode to change seeders' : ''}
    >
      <ul>
        {getStateSeederGroups(dbSeeders).map((group) => (
          <div key={group}>
            {dbSeeders
              .filter((dbSeeder) => dbSeeder.group === group)
              .map((dbSeeder) => (
                <li key={dbSeeder.id}>
                  <input
                    checked={seeders.includes(dbSeeder.id)}
                    disabled={disabled}
                    onChange={(e) => onToggleSeeder(e, dbSeeder.id)}
                    style={{ marginRight: 12 }}
                    type="checkbox"
                  />
                  <span title={dbSeeder.desc || dbSeeder.label}>
                    {dbSeeder.label}
                  </span>
                  {dbSeeder.canUpdateCount && (
                    <input
                      aria-label={`Value for ${dbSeeder.label}`}
                      disabled={disabled}
                      min={0}
                      onChange={(e) => onCountChange(e, dbSeeder.id)}
                      style={{ marginLeft: 8, width: 60 }}
                      type="number"
                      value={seedsCountMap[dbSeeder.id] || 0}
                    />
                  )}
                </li>
              ))}
          </div>
        ))}
      </ul>
    </Tooltip>
  );
};
