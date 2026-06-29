import { Button, Tooltip } from '@akamai/cds-components/react';
import { Font } from '@akamai/cds-tokens';
import * as React from 'react';

import { SingleRowTruncatedList } from '../Shared/SingleRowTruncatedList/SingleRowTruncatedList';
import styles from '../Shared/SingleRowTruncatedList/SingleRowTruncatedList.module.css';

const MAX_USERS_TO_RENDER = 25;

interface Props {
  onViewAll: () => void;
  users: string[];
}

/**
 * Truncated comma-separated usernames for CDS table cells.
 * Uses SingleRowTruncatedList for width-based truncation in flex table layouts.
 */
export const DelegatedUsersList = ({ onViewAll, users }: Props) => {
  const usersToRender = React.useMemo(
    () => users.slice(0, MAX_USERS_TO_RENDER),
    [users]
  );

  const items = usersToRender.map((user, index) => (
    <span
      key={user}
      style={{
        font: Font.FontSize.M,
        whiteSpace: 'nowrap',
      }}
    >
      {index > 0 ? ', ' : ''}
      {user}
    </span>
  ));

  const phantomLabel = `+${users.length}`;

  return (
    <SingleRowTruncatedList
      ellipsisText=", ..."
      gapPx={0}
      items={items}
      overflowButtonPhantom={
        <span className={styles.overflowPillBadge}>
          <Button className={styles.overflowPillButton} variant="link">
            {phantomLabel}
          </Button>
        </span>
      }
      renderOverflowButton={(hiddenCount) => (
        <span className={styles.overflowPillBadge}>
          <Tooltip
            tooltipPlacement="top"
            tooltipText="Click to View All Delegate Users"
          >
            <Button
              className={styles.overflowPillButton}
              onClick={onViewAll}
              variant="link"
            >
              +{hiddenCount}
            </Button>
          </Tooltip>
        </span>
      )}
      totalCount={users.length}
    />
  );
};
