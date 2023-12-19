import * as React from 'react';

import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import { Tooltip } from 'src/components/Tooltip';
import { StyledToggleButton } from 'src/features/Linodes/LinodesLanding/DisplayLinodes.styles';

interface GroupByTagToggleProps {
  isGroupedByTag: boolean;
  isLargeAccount?: boolean;
  toggleGroupByTag: () => boolean;
}

export const GroupByTagToggle = React.memo((props: GroupByTagToggleProps) => {
  const { isGroupedByTag, isLargeAccount, toggleGroupByTag } = props;

  return (
    <>
      <div className="visually-hidden" id="groupByDescription">
        {isGroupedByTag
          ? 'group by tag is currently enabled'
          : 'group by tag is currently disabled'}
      </div>
      <Tooltip
        placement="top-end"
        title={`${isGroupedByTag ? 'Ungroup' : 'Group'} by tag`}
      >
        <StyledToggleButton
          aria-describedby={'groupByDescription'}
          aria-label={`Toggle group by tag`}
          disableRipple
          // See https://github.com/linode/manager/pull/6653 for more details
          disabled={isLargeAccount}
          isActive={isGroupedByTag}
          // Group by Tag is not available if you have a large account.
          onClick={toggleGroupByTag}
          size="large"
        >
          <GroupByTag />
        </StyledToggleButton>
      </Tooltip>
    </>
  );
});
