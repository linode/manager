import Badge from '@mui/material/Badge';
import React from 'react';

import FilterIcon from 'src/assets/icons/filter.svg';
import FilledFilterIcon from 'src/assets/icons/filterfilled.svg';
interface CloudPulseDimensionFilterIconWithBadgeProps {
  /**
   * The count to be displayed in the badge
   */
  count: number;
}

export const CloudPulseDimensionFilterIconWithBadge = React.memo(
  ({ count }: CloudPulseDimensionFilterIconWithBadgeProps) => {
    return (
      <Badge
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        badgeContent={count}
        invisible={count === 0}
        sx={(theme) => ({
          // allow badge to overflow outside the icon without being clipped
          overflow: 'visible',
          // style the actual badge
          '& .MuiBadge-badge': {
            top: 3, // nudge up
            right: 3, // nudge right
            minWidth: 8,
            width: 15,
            height: 16,
            borderRadius: '100%',
            fontSize: 10,
            lineHeight: 1,
            color: theme.tokens.color.Neutrals.White,
            backgroundColor: theme.palette.error.dark,
          },
        })}
      >
        {count === 0 ? (
          <FilterIcon data-testid="filter" height={24} width={24} />
        ) : (
          <FilledFilterIcon
            data-testid="filled-filter"
            height={24}
            width={24}
          />
        )}
      </Badge>
    );
  }
);
