import { styled } from '@mui/material/styles';

import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';

export const StyledEUAgreementCheckbox = styled(EUAgreementCheckbox, {
  label: 'StyledEUAgreementCheckbox',
})(({ theme }) => ({
  marginButton: theme.spacing(3),
  marginTop: theme.spacing(3),
}));
