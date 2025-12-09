import { Chip, LinkButton, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { TagProps } from './Tag';

export const StyledChip = styled(Chip, {
  shouldForwardProp: omittedProps(['colorVariant', 'closeMenu', 'maxLength']),
})<TagProps>(({ theme, ...props }) => ({
  '& .MuiChip-label': {
    '&:hover': {
      borderBottomRightRadius: props.onDelete && 0,
      borderTopRightRadius: props.onDelete && 0,
      color: `${theme.color.white} !important`,
    },
    borderRadius: 4,
    font: theme.font.normal,
    maxWidth: 350,
    padding: '7px 10px',
  },
  // Targets first span (tag label)
  '& > span': {
    borderBottomRightRadius: 0,
    borderRadius: 3,
    borderTopRightRadius: 0,
    padding: '7px 10px',
  },
  '&:focus, &:hover, &.Mui-focusVisible': {
    ['& .MuiChip-deleteIcon']: {
      color: theme.color.tagIcon,
    },
    ['& .MuiChip-label']: {
      color: theme.color.tagButtonText,
    },
    backgroundColor: theme.color.tagButtonBg,
  },
  fontSize: '0.875rem',
  height: 30,
  padding: 0,
  transition: 'none',
  ...(props.colorVariant === 'blue' && {
    '& > span': {
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        color: theme.tokens.color.Neutrals.White,
      },
      color: theme.tokens.color.Neutrals.White,
    },

    backgroundColor: theme.palette.primary.main,
  }),
  ...(props.colorVariant === 'lightBlue' && {
    '& > span': {
      '&:focus': {
        backgroundColor: theme.color.tagButtonBg,
        color: theme.color.white,
      },
      '&:hover': {
        backgroundColor: theme.color.tagButtonBgHover,
        color: theme.color.tagButtonTextHover,
      },
    },
    backgroundColor: theme.color.tagButtonBg,
    color: theme.color.tagButtonText,
  }),
}));

export const StyledDeleteButton = styled(LinkButton, {
  label: 'StyledDeleteButton',
})(({ theme }) => ({
  '& svg': {
    borderRadius: theme.tokens.alias.Radius.Default,
    color: theme.color.tagIcon,
    height: 15,
    width: 15,
  },
  '&:focus, &:hover': {
    '& svg': {
      color: theme.color.white,
    },
    backgroundColor: `${theme.color.buttonPrimaryHover} !important`,
  },
  borderBottomRightRadius: 3,
  borderLeft: `1px solid ${
    theme.name === 'light'
      ? theme.tokens.color.Neutrals.White
      : theme.tokens.color.Neutrals[100]
  }`,
  borderRadius: theme.tokens.alias.Radius.Default,
  borderTopRightRadius: 3,
  height: 30,
  margin: 0,
  minWidth: 30,
  padding: theme.spacing(),
}));
