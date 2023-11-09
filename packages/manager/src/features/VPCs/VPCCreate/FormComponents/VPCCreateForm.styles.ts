import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';
import { omittedProps } from 'src/utilities/omittedProps';

type StyledVPCFormProps = {
  isDrawer?: boolean;
};

export const StyledBodyTypography = styled(Typography, {
  label: 'StyledBodyTypography',
  shouldForwardProp: omittedProps(['isDrawer']),
})<StyledVPCFormProps>(({ isDrawer, theme }) => ({
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(2),
  ...(!isDrawer && {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '80%',
    },
  }),
}));

export const StyledHeaderTypography = styled(Typography, {
  label: 'StyledHeaderTypography',
  shouldForwardProp: omittedProps(['isDrawer']),
})<StyledVPCFormProps>(({ isDrawer, theme }) => ({
  marginTop: isDrawer ? theme.spacing(3) : theme.spacing(1),
}));
