import { Divider, FormControl, FormControlLabel, RadioGroup } from '@linode/ui';
import { styled } from '@mui/material/styles';

import { FormGroup } from 'src/components/FormGroup';

const formGroupStyling = {
  '&.MuiFormGroup-root[role="radiogroup"]': {
    marginBottom: 0,
  },
  alignItems: 'flex-start',
};

export const StyledRadioGroup = styled(RadioGroup, {
  label: 'StyledRadioGroup',
})({
  ...formGroupStyling,
});

export const StyledFormControl = styled(FormControl, {
  label: 'StyledFormControl',
})({
  ...formGroupStyling,
});

export const StyledFormGroup = styled(FormGroup, { label: 'StyledFormGroup' })({
  ...formGroupStyling,
});

export const StyledDivider = styled(Divider, { label: 'StyledDivider' })(
  ({ theme }) => ({
    margin: '36px 8px 12px',
    width: `calc(100% - ${theme.spacing(2)})`,
  })
);

export const StyledFormControlLabel = styled(FormControlLabel, {
  label: 'StyledFormControlLabel',
})(({ theme }) => ({
  '& button': {
    color: theme.textColors.tableHeader,
    order: 3,
  },
}));
