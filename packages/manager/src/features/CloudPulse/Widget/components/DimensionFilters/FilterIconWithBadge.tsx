import Badge from '@mui/material/Badge';
import React from 'react';

import FilterIcon from 'src/assets/icons/filter.svg';
interface FilterIconWithBadgeProps {
  count?: number;
  max?: number;
}

export const FilterIconWithBadge: React.FC<FilterIconWithBadgeProps> = ({
  count = 0,
  max = 9,
}) => {
  const display = count > max ? `${max}+` : count;
  return (
    <Badge
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      badgeContent={display}
      invisible={count === 0}
      overlap="rectangular"
      sx={(theme) => ({
        // allow badge to overflow outside the icon without being clipped
        overflow: 'visible',
        // style the actual badge
        '& .MuiBadge-badge': {
          top: 3, // nudge up
          right: 3, // nudge right
          minWidth: 16,
          height: 16,
          padding: 0, // remove large padding so circle isn't cut
          borderRadius: '50%',
          boxSizing: 'border-box',
          fontSize: 10,
          lineHeight: 1,
          color: theme.tokens.color.Neutrals.White,
          backgroundColor: theme.palette.error.dark,
        },
      })}
    >
      <FilterIcon height={24} width={24} />
    </Badge>
  );
};
