import { styled } from '@mui/material/styles';

import { Chip } from 'src/components/Chip';
import { omittedProps } from 'src/utilities/omittedProps';

import { StyledLinkButton } from '../Button/StyledLinkButton';

import type { TagProps } from './Tag';

export const StyledChip = styled(Chip, {
  shouldForwardProp: omittedProps(['colorVariant', 'closeMenu', 'maxLength']),
})<TagProps>(({ theme, ...props }) => ({
  '& .MuiChip-label': {
    '&:hover': {
      borderBottomRightRadius: props.onDelete && 0,
      borderTopRightRadius: props.onDelete && 0,
    },
    borderRadius: 4,
    color: theme.name === 'light' ? '#3a3f46' : '#fff',
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
  '&:focus': {
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
    backgroundColor: theme.color.tagButton,
  },
  // Overrides MUI chip default styles so these appear as separate elements.
  '&:hover': {
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
    backgroundColor: theme.color.tagButton,
  },
  fontSize: '0.875rem',
  height: 30,
  padding: 0,
  ...(props.colorVariant === 'blue' && {
    '& > span': {
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      color: 'white',
    },

    backgroundColor: theme.palette.primary.main,
  }),
  ...(props.colorVariant === 'lightBlue' && {
    '& > span': {
      '&:focus': {
        backgroundColor: theme.color.tagButton,
        color: theme.color.black,
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
    backgroundColor: theme.color.tagButton,
  }),
}));

export const StyledDeleteButton = styled(StyledLinkButton, {
  label: 'StyledDeleteButton',
})(({ theme }) => ({
  '& svg': {
    borderRadius: 0,
    color: theme.color.tagIcon,
    height: 15,
    width: 15,
  },
  '&:focus': {
    backgroundColor: theme.bg.lightBlue1,
    color: theme.color.black,
  },
  '&:hover': {
    '& svg': {
      color: 'white',
    },
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  borderBottomRightRadius: 3,
  borderLeft: `1px solid ${theme.name === 'light' ? '#fff' : '#2e3238'}`,
  borderRadius: 0,
  borderTopRightRadius: 3,
  height: 30,
  margin: 0,
  minWidth: 30,
  padding: theme.spacing(),
}));
