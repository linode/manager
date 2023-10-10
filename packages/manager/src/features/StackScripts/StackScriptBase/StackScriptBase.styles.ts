import { styled } from '@mui/material/styles';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { Table } from 'src/components/Table';

import type { WithStackScriptBaseOptions } from './StackScriptBase';

type StyledStackScriptBaseProps = Pick<
  WithStackScriptBaseOptions,
  'isSelecting'
>;

export const StyledContentDiv = styled('div', {
  label: 'StyledContentDiv',
})<StyledStackScriptBaseProps>(({ isSelecting, theme }) => ({
  ...(isSelecting
    ? {
        backgroundColor: `${theme.bg.app} !important`,
        marginTop: `-${theme.spacing()}`,
      }
    : {
        backgroundColor: theme.bg.bgPaper,
      }),
  display: 'flex',
  flexWrap: 'nowrap',
  paddingBottom: '8px !important',
  paddingTop: theme.spacing(),
  position: 'sticky',
  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  top: 0,
  width: '100%',
  zIndex: 11,
}));

export const StyledEmptyStateDiv = styled('div', {
  label: 'StyledEmptyStateDiv',
})(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export const StyledDebouncedSearchTextfield = styled(DebouncedSearchTextField, {
  label: 'StyledDebouncedSearchTextfield',
})(({ theme }) => ({
  '& + button': {
    paddingBottom: 0,
    paddingTop: 0,
  },
  '& .input': {
    backgroundColor: theme.bg.bgPaper,
    border: `1px solid ${theme.color.grey3}`,
    borderRadius: 0,
    minHeight: 'auto',
    minWidth: 415,
  },
  '& > div': {
    marginRight: 0,
  },
  '& > input': {
    padding: theme.spacing(),
  },
  backgroundColor: theme.color.white,
  flexBasis: '100%',
  marginTop: 0,
}));

export const StyledLoaderDiv = styled('div', { label: 'StyledLoaderDiv' })(
  ({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
  })
);

// Styles to override base placeholder styles for StackScript null state
export const StyledPlaceHolder = styled(Placeholder, {
  label: 'StyledPlaceHolder',
})(({ theme }) => ({
  '& svg': {
    marginTop: 4,
    transform: 'scale(0.8)',
  },
  margin: 0,
  padding: `${theme.spacing(1)} 0`,
  width: '100%',
}));

export const StyledTable = styled(Table, { label: 'StyledTable' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.bgPaper,
  })
);
