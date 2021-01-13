import * as React from 'react';
import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import Switch, { SwitchProps } from 'src/components/core/Switch';
import HelpIcon from 'src/components/HelpIcon';
import './toggle.css';

interface Props {
  tooltipText?: JSX.Element | string;
  interactive?: boolean;
}

type CombinedProps = Props & SwitchProps;

const LinodeSwitchControl: React.FC<CombinedProps> = props => {
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
      {tooltipText && <HelpIcon text={tooltipText} interactive={interactive} />}
    </React.Fragment>
  );
};

export default LinodeSwitchControl;
