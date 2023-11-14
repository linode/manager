import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { TabPanels } from 'src/components/ReachTabPanels';
import { omittedProps } from 'src/utilities/omittedProps';

import type { LinodeCreateProps } from './LinodeCreate';

type StyledLinodeCreateProps = Pick<LinodeCreateProps, 'showGDPRCheckbox'>;

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
  shouldForwardProp: omittedProps(['showGDPRCheckbox']),
})<StyledLinodeCreateProps>(({ showGDPRCheckbox, theme }) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  flexGrow: 1,
  gap: theme.spacing(2),
  [(theme.breakpoints.down('sm'), theme.breakpoints.down('md'))]: {
    margin: theme.spacing(1),
  },

  // conditional styling
  ...(showGDPRCheckbox
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

// Currently used in VPC and Firewall panels
export const StyledCreateLink = styled(Link, {
  label: 'StyledCreateLink',
})(({ theme }) => ({
  fontSize: '14px',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1.5),
  width: '100px',
}));
