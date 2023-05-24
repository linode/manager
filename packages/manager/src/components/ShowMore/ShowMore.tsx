import classNames from 'classnames';
import * as React from 'react';
import Chip, { ChipProps } from 'src/components/core/Chip';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';

interface ShowMoreProps<T> {
  items: T[];
  render: (items: T[]) => any;
  chipProps?: ChipProps;
  ariaItemType: string;
}

export const ShowMore = <T extends unknown>(props: ShowMoreProps<T>) => {
  const { render, items, chipProps, ariaItemType } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <StyledChip
        className={classNames(
          {
            active: anchorEl,
          },
          'chip'
        )}
        label={`+${items.length}`}
        aria-label={`+${items.length} ${ariaItemType}`}
        onClick={handleClick}
        {...chipProps}
        data-qa-show-more-chip
        component={'button' as 'div'}
        clickable
      />

      <StyledPopover
        role="dialog"
        aria-label={`${items.length} additional ${ariaItemType}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 28,
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {render(items)}
      </StyledPopover>
    </React.Fragment>
  );
};

const StyledChip = styled(Chip)(({ theme }) => ({
  // backgroundColor: theme.bg.lightBlue1,
  backgroundColor: 'red !important',
  fontWeight: 500,
  lineHeight: 1,
  marginLeft: theme.spacing(0.5),
  paddingLeft: 2,
  paddingRight: 2,
  position: 'relative',
  '&:hover, &.active': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  '&:focus': {
    backgroundColor: theme.bg.lightBlue1,
    outline: '1px dotted #999',
  },
  '& .MuiChip-label': {
    paddingLeft: 6,
    paddingRight: 6,
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    maxHeight: 200,
    maxWidth: 400,
    minWidth: 'auto',
    overflowY: 'scroll',
    padding: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 285,
    },
    '&::-webkit-scrollbar': {
      webkitAppearance: 'none',
      width: 7,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.color.grey2,
      borderRadius: 4,
      WebkitBoxShadow: '0 0 1px rgba(255,255,255,.5)',
    },
  },
}));
