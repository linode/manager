import { IconButton } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton, {
  label: 'StyledIconButton',
})(({ theme }) => ({
  '& > span': {
    justifyContent: 'flex-end',
  },
  '& svg': {
    height: 24,
    width: 24,
  },
  '&:hover, &:focus': {
    color: theme.tokens.header.Search.Icon.Hover,
  },
  backgroundColor: 'inherit',
  border: 'none',
  color: theme.tokens.header.Search.Icon.Default,
  cursor: 'pointer',
  padding: theme.tokens.spacing[40],
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const StyledSearchBarWrapperDiv = styled('div', {
  label: 'StyledSearchBarWrapperDiv',
})(({ theme }) => ({
  '& .react-select__single-value, & .react-select__input': {
    color: theme.tokens.header.Search.Text.Filled,
  },
  '& > div .react-select__control': {
    '&:hover': {
      backgroundColor: 'transparent',
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
    color: theme.tokens.header.Icon.Default,
    height: 20,
    width: 20,
  },
  '&:hover': {
    ...theme.inputStyles.hover,
    '& svg': {
      color: theme.tokens.header.Icon.Default,
    },
    backgroundColor: theme.tokens.header.Search.Background,
    border: 'none',
  },
  ...theme.inputStyles.default,
  alignItems: 'center',
  backgroundColor: theme.tokens.header.Search.Background,
  border: 'none',
  display: 'flex',
  flex: 1,
  height: 32,
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
