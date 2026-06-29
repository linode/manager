import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { sortByString } from '@akamai/compute-ui-core/formatting';
import * as React from 'react';

import { SingleRowTruncatedList } from '../../Shared/SingleRowTruncatedList/SingleRowTruncatedList';
import styles from '../../Shared/SingleRowTruncatedList/SingleRowTruncatedList.module.css';

import type { CombinedEntity, ExtendedRoleView } from '../../Shared/types';
import type { AccountRoleType, EntityRoleType } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  onButtonClick: (roleName: AccountRoleType | EntityRoleType) => void;
  onRemoveAssignment: (entity: CombinedEntity, role: ExtendedRoleView) => void;
  role: ExtendedRoleView;
}

const MAX_ITEMS_TO_RENDER = 25;

export const AssignedEntities = ({
  onButtonClick,
  onRemoveAssignment,
  role,
  disabled,
}: Props) => {
  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      role.entity_names!.map((name, index) => ({
        name,
        id: role.entity_ids![index],
      })),
    [role.entity_names, role.entity_ids]
  );

  const sortedEntities = React.useMemo(
    () =>
      [...combinedEntities].sort((a, b) => sortByString(a.name, b.name, 'asc')),
    [combinedEntities]
  );

  const entitiesToRender = React.useMemo(
    () => sortedEntities.slice(0, MAX_ITEMS_TO_RENDER),
    [sortedEntities]
  );

  const chipGapPx = Number.parseInt(Spacing.S8, 10) || 8;

  const items = entitiesToRender.map((entity) => (
    <Tooltip
      disabled={entity.name.length <= 30}
      key={entity.id}
      tooltipPlacement="top"
      tooltipText={entity.name}
    >
      <div className={styles.entityChip}>
        <div className={styles.entityChipBadge} data-testid="entities">
          {entity.name.length > 30
            ? `${entity.name.slice(0, 20)}...`
            : entity.name}
          <Button
            className={styles.entityChipRemoveButton}
            disabled={disabled}
            onClick={() => onRemoveAssignment(entity, role)}
            size="small"
            variant="link"
          >
            <Icon icon="close" size="xs" />
          </Button>
        </div>
      </div>
    </Tooltip>
  ));

  // Phantom uses the true total so the reserved overflow-pill width matches large +N labels.
  const phantomLabel = `+${sortedEntities.length}`;

  return (
    <SingleRowTruncatedList
      gapPx={chipGapPx}
      items={items}
      overflowButtonPhantom={
        <span className={styles.overflowPillBadge}>
          <Button
            className={styles.overflowPillButton}
            size="small"
            variant="link"
          >
            {phantomLabel}
          </Button>
        </span>
      }
      renderOverflowButton={(hiddenCount) => (
        <span className={styles.overflowPillBadge}>
          <Tooltip
            tooltipPlacement="top"
            tooltipText="Click to View All Entities"
          >
            <Button
              className={styles.overflowPillButton}
              onClick={() => onButtonClick(role.name)}
              size="small"
              variant="link"
            >
              +{hiddenCount}
            </Button>
          </Tooltip>
        </span>
      )}
      totalCount={sortedEntities.length}
    />
  );
};
