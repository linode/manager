import { IconButton } from '@linode/ui';
import { Tooltip } from '@linode/ui';
import * as React from 'react';

import GroupByTag from 'src/assets/icons/group-by-tag.svg';

interface GroupByTagToggleProps {
  isGroupedByTag: boolean;
  isLargeAccount?: boolean;
  toggleGroupByTag: () => boolean;
}

export const GroupByTagToggle = React.memo((props: GroupByTagToggleProps) => {
  const { isGroupedByTag, isLargeAccount, toggleGroupByTag } = props;

  const groupByDescriptionId = React.useId();

  return (
    <>
      <div className="visually-hidden" id={groupByDescriptionId}>
        {isGroupedByTag
          ? 'group by tag is currently enabled'
          : 'group by tag is currently disabled'}
      </div>
      <Tooltip
        placement="top-end"
        title={`${isGroupedByTag ? 'Ungroup' : 'Group'} by tag`}
      >
        <IconButton
          sx={{
            padding: 0,
          }}
          aria-describedby={groupByDescriptionId}
          aria-label={`Toggle group by tag`}
          className={isGroupedByTag ? 'MuiIconButton-isActive' : ''}
          disableRipple
          // See https://github.com/linode/manager/pull/6653 for more details
          disabled={isLargeAccount}
          // Group by Tag is not available if you have a large account.
          onClick={toggleGroupByTag}
        >
          <GroupByTag />
        </IconButton>
      </Tooltip>
    </>
  );
});
