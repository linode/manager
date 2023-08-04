import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Paper } from 'src/components/Paper';
import type { LinodeCreateProps } from './LinodeCreate';
import { TabPanels } from 'src/components/ReachTabPanels';

type StyledLinodeCreateProps = Pick<LinodeCreateProps, 'showAgreement'>;

export const StyledButtonGroupBox = styled(Box, { label: 'StyledButtonGroup' })(
  ({ theme }) => ({
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end',
    },
  })
);

export const StyledCreateButton = styled(Button, {
  label: 'StyledCreateButton',
})(({ theme }) => ({
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(1),
  },
}));

export const StyledForm = styled('form', { label: 'StyledForm' })({
  width: '100%',
});

export const StyledMessageDiv = styled('div', {
  label: 'StyledMessageDiv',
  shouldForwardProp: (prop) => isPropValid(['showAgreement'], prop),
})<StyledLinodeCreateProps>(({ theme, showAgreement }) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  flexGrow: 1,
  gap: theme.spacing(2),
  [(theme.breakpoints.down('sm'), theme.breakpoints.down('md'))]: {
    margin: theme.spacing(1),
  },

  // conditional styling
  ...(showAgreement
    ? {
        maxWidth: '70%',
        [theme.breakpoints.down('sm')]: {
          maxWidth: 'unset',
        },
      }
    : {}),
}));

export const StyledPaper = styled(Paper, { label: 'StyledPaper' })(
  ({ theme }) => ({
    '& [role="tablist"]': {
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(2),
    },
  })
);

export const StyledTabPanel = styled(TabPanels, { label: 'StyledTabPanel' })(
  ({ theme }) => ({
    '& .MuiPaper-root': {
      padding: 0,
    },
  })
);
