import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import zxcvbn from 'zxcvbn';

import { TextFieldProps } from 'src/components/TextField';

import { StrengthIndicator } from '../PasswordInput/StrengthIndicator';
import { HideShowText } from './HideShowText';

interface Props extends TextFieldProps {
  disabledReason?: JSX.Element | string;
  hideStrengthLabel?: boolean;
  hideValidation?: boolean;
}

const PasswordInput = (props: Props) => {
  const {
    disabledReason,
    hideStrengthLabel,
    hideValidation,
    required,
    value,
    ...rest
  } = props;

  const strength = React.useMemo(() => maybeStrength(value), [value]);

  return (
    <Grid container spacing={1}>
      <Grid xs={12}>
        <HideShowText
          {...rest}
          fullWidth
          required={required}
          tooltipText={disabledReason}
          value={value}
        />
      </Grid>
      {!hideValidation && (
        <Grid xs={12}>
          <StrengthIndicator
            hideStrengthLabel={hideStrengthLabel}
            strength={strength}
          />
        </Grid>
      )}
    </Grid>
  );
};

const maybeStrength = (value: Props['value']) => {
  if (!value) {
    return null;
  }

  return zxcvbn(String(value)).score;
};

export default React.memo(PasswordInput);
