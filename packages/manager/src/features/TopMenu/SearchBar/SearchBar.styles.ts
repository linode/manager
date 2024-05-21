import { styled } from '@mui/material/styles';

import { IconButton } from 'src/components/IconButton';

export const StyledIconButton = styled(IconButton, {
  label: 'StyledIconButton',
})(({ theme }) => ({
  '& > span': {
    justifyContent: 'flex-end',
  },
  '& svg': {
    height: 25,
    width: 25,
  },
  '&:hover, &:focus': {
    color: '#c1c1c0',
  },
  backgroundColor: 'inherit',
  border: 'none',
  color: '#c9c7c7',
  cursor: 'pointer',
  padding: theme.spacing(),
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
  top: 1,
}));

export const StyledSearchBarWrapperDiv = styled('div', {
  label: 'StyledSearchBarWrapperDiv',
})(({ theme }) => ({
  '& > div .react-select__control': {
    '&:hover': {
      borderColor: 'transparent',
    },
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  '& > div .react-select__control--is-focused:hover': {
    borderColor: 'transparent',
  },
  '& > div .react-select__indicators': {
    display: 'none',
  },
  '& > div .react-select__menu': {
    border: 0,
    borderRadius: 4,
    boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
    marginTop: 12,
    maxHeight: 350,
    overflowY: 'auto',
  },
  '& > div .react-select__menu-list': {
    overflowX: 'hidden',
    padding: 0,
  },
  '& > div .react-select__value-container': {
    '& p': {
      fontSize: '0.875rem',
      overflow: 'visible',
    },
    overflow: 'hidden',
  },
  '& svg': {
    height: 20,
    width: 20,
  },
  '&.active': {
    ...theme.inputStyles.focused,
    '&:hover': {
      ...theme.inputStyles.focused,
    },
  },
  '&:hover': {
    ...theme.inputStyles.hover,
  },
  ...theme.inputStyles.default,
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  height: 34,
  marginLeft: theme.spacing(1),
  padding: theme.spacing(1),
  position: 'relative', // for search results
  [theme.breakpoints.down('md')]: {
    '&.active': {
      opacity: 1,
      visibility: 'visible',
      zIndex: 3,
    },
    left: 0,
    margin: 0,
    opacity: 0,
    position: 'absolute',
    visibility: 'hidden',
    width: 'calc(100% - 100px)',
    zIndex: -1,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  transition: theme.transitions.create(['opacity']),
}));
