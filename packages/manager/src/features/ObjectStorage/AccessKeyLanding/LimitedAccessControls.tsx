import * as React from 'react';
import Toggle from 'src/components/Toggle';
import FormControlLabel from 'src/components/core/FormControlLabel';

interface Props {
  checked: boolean;
  handleToggle: () => void;
}

export const LimitedAccessControls: React.FC<Props> = props => {
  const { checked, handleToggle } = props;
  return (
    <FormControlLabel
      control={
        <Toggle
          onChange={handleToggle}
          checked={checked}
          data-testid="limited-access-toggle"
        />
      }
      label={'Limited Access'}
    />
  );
};

export default React.memo(LimitedAccessControls);
