import { FormControl, FormControlLabel, Toggle } from '@linode/ui';
import * as React from 'react';

import { PROFILE_AUTH_PENDO_IDS } from '../../constants';

interface ToggleProps {
  disabled?: boolean;
  onChange: (value: boolean) => void;
  toggleDisableDialog: () => void;
  twoFactorConfirmed: boolean;
  twoFactorEnabled: boolean;
}

export const TwoFactorToggle = (props: ToggleProps) => {
  const { disabled, twoFactorEnabled } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onChange, twoFactorConfirmed } = props;
    const enabled = e.currentTarget.checked;
    /**
     * only open the disable dialog if 2FA has been turned on and we're flipping the toggle off
     */
    if (!enabled && twoFactorConfirmed) {
      props.toggleDisableDialog();
    } else {
      /** Otherwise flip the toggle. If toggling on, the parent will handle the API request. */
      onChange(enabled);
    }
  };

  return (
    <FormControl fullWidth style={{ marginTop: 0 }}>
      <FormControlLabel
        control={
          <Toggle
            checked={twoFactorEnabled}
            data-pendo-id={
              twoFactorEnabled
                ? PROFILE_AUTH_PENDO_IDS.enable2FA
                : PROFILE_AUTH_PENDO_IDS.disable2FA
            }
            data-qa-toggle-tfa={twoFactorEnabled}
            disabled={disabled}
            onChange={handleChange}
          />
        }
        label={twoFactorEnabled ? 'Enabled' : 'Disabled'}
      />
    </FormControl>
  );
};
