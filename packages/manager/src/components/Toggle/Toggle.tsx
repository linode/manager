import * as React from 'react';
import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import Switch, { SwitchProps } from 'src/components/core/Switch';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import './toggle.css';

interface Props extends SwitchProps {
  tooltipText?: JSX.Element | string;
  interactive?: boolean;
}

const Toggle: React.FC<Props> = (props) => {
  const { tooltipText, interactive, ...rest } = props;

  return (
    <React.Fragment>
      <Switch
        icon={<ToggleOff />}
        checkedIcon={<ToggleOn />}
        data-qa-toggle={props.checked}
        color="primary"
        {...rest}
      />
      {tooltipText && (
        <TooltipIcon
          text={tooltipText}
          interactive={interactive}
          status="help"
        />
      )}
    </React.Fragment>
  );
};

export default Toggle;
