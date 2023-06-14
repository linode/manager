import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Toggle } from 'src/components/Toggle';

interface ToggleProps {
  toggleDisableDialog: () => void;
  onChange: (value: boolean) => void;
  twoFactorEnabled: boolean;
  twoFactorConfirmed: boolean;
  disabled?: boolean;
}

export const TwoFactorToggle = (props: ToggleProps) => {
  const { disabled, twoFactorEnabled } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { twoFactorConfirmed, onChange } = props;
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
        label={twoFactorEnabled ? 'Enabled' : 'Disabled'}
        control={
          <Toggle
            checked={twoFactorEnabled}
            onChange={handleChange}
            data-qa-toggle-tfa={twoFactorEnabled}
            disabled={disabled}
          />
        }
      />
    </FormControl>
  );
};
