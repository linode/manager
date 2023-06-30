import * as React from 'react';
import { Chip, ChipProps } from 'src/components/Chip';
import Popover from '@mui/material/Popover';
import { styled, useTheme } from '@mui/material/styles';

interface ShowMoreProps<T> {
  ariaItemType: string;
  chipProps?: ChipProps;
  items: T[];
  render: (items: T[]) => any;
}

export const ShowMore = <T extends {}>(props: ShowMoreProps<T>) => {
  const { render, items, chipProps, ariaItemType } = props;
  const theme = useTheme();
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
        {...chipProps}
        aria-label={`+${items.length} ${ariaItemType}`}
        clickable
        component={'button'}
        data-qa-show-more-chip
        label={`+${items.length}`}
        onClick={handleClick}
        sx={
          anchorEl
            ? {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }
            : null
        }
      />

      <StyledPopover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 28, horizontal: 'left' }}
        aria-label={`${items.length} additional ${ariaItemType}`}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        role="dialog"
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {render(items)}
      </StyledPopover>
    </React.Fragment>
  );
};

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.bg.lightBlue1,
  fontWeight: 500,
  lineHeight: 1,
  marginLeft: theme.spacing(0.5),
  paddingLeft: 2,
  paddingRight: 2,
  position: 'relative',
  '&:hover': {
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
