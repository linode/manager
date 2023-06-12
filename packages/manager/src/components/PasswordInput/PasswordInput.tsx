import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import zxcvbn from 'zxcvbn';
import { StrengthIndicator } from '../PasswordInput/StrengthIndicator';
import { Props as TextFieldProps } from 'src/components/TextField';
import { HideShowText } from './HideShowText';

interface Props extends TextFieldProps {
  disabledReason?: string | JSX.Element;
  hideStrengthLabel?: boolean;
  hideValidation?: boolean;
}

const PasswordInput = (props: Props) => {
  const {
    value,
    required,
    disabledReason,
    tooltipInteractive,
    hideStrengthLabel,
    hideValidation,
    ...rest
  } = props;

  const strength = React.useMemo(() => maybeStrength(value), [value]);

  return (
    <Grid container spacing={1}>
      <Grid xs={12}>
        <HideShowText
          {...rest}
          tooltipText={disabledReason}
          tooltipInteractive={tooltipInteractive}
          value={value}
          fullWidth
          required={required}
        />
      </Grid>
      {!hideValidation && (
        <Grid xs={12}>
          <StrengthIndicator
            strength={strength}
            hideStrengthLabel={hideStrengthLabel}
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
