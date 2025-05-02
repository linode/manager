import { Stack } from '@linode/ui';
import * as React from 'react';
import zxcvbn from 'zxcvbn';

import { StrengthIndicator } from '../PasswordInput/StrengthIndicator';
import { HideShowText } from './HideShowText';

import type { TextFieldProps } from '@linode/ui';

interface Props extends TextFieldProps {
  disabledReason?: JSX.Element | string;
  hideStrengthLabel?: boolean;
  hideValidation?: boolean;
}

export const PasswordInput = React.memo((props: Props) => {
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
    <Stack spacing={1}>
      <HideShowText
        {...rest}
        fullWidth
        required={required}
        tooltipText={disabledReason}
        value={value}
      />
      {!hideValidation && (
        <StrengthIndicator
          hideStrengthLabel={hideStrengthLabel}
          strength={strength}
        />
      )}
    </Stack>
  );
});

const maybeStrength = (value: Props['value']) => {
  if (!value) {
    return null;
  }

  return zxcvbn(String(value)).score;
};
