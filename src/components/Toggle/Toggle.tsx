import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import ToggleOff from 'src/assets/icons/toggleOff.svg';
import ToggleOn from 'src/assets/icons/toggleOn.svg';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Switch, { SwitchProps } from 'src/components/core/Switch';
import HelpIcon from 'src/components/HelpIcon';
import './toggle.css';

type CSSClasses = 'root' | 'checked' | 'disabled';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing(1)
    },
    checked: {},
    disabled: {}
  });

interface Props {
  tooltipText?: string;
}

type CombinedProps = Props & SwitchProps & WithStyles<CSSClasses>;

const LinodeSwitchControl: React.StatelessComponent<CombinedProps> = props => {
  const { classes, tooltipText, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.checked]: Boolean(props.checked),
    [classes.disabled]: props.disabled === true
  });

  return (
    <React.Fragment>
      <Switch
        className={classnames}
        icon={<ToggleOff />}
        checkedIcon={<ToggleOn />}
        data-qa-toggle={props.checked}
        color="primary"
        {...rest}
      />
      {tooltipText && <HelpIcon text={tooltipText} />}
    </React.Fragment>
  );
};

export default withStyles(styles)(LinodeSwitchControl);
