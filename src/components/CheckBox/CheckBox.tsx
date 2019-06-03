import * as classNames from 'classnames';
import * as React from 'react';
import CheckboxIcon from 'src/assets/icons/checkbox.svg';
import CheckboxCheckedIcon from 'src/assets/icons/checkboxChecked.svg';
import Checkbox, { CheckboxProps } from 'src/components/core/Checkbox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

type CSSClasses = 'root' | 'checked' | 'disabled' | 'warning' | 'error';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    color: '#ccc',
    transition: theme.transitions.create(['color']),
    '& .defaultFill': {
      transition: theme.transitions.create(['fill'])
    },
    '&:hover': {
      color: theme.palette.primary.main,
      fill: theme.color.white,
      '& .defaultFill': {
        fill: theme.color.white
      }
    },
    '&:hover$warning': {
      color: '#ffd322'
    },
    '&:hover$error': {
      color: '#cf1f1f'
    }
  },
  checked: {
    color: theme.palette.primary.main
  },
  warning: {
    color: theme.palette.status.warningDark,
    '& .defaultFill': {
      fill: theme.palette.status.warning
    },
    '&$checked': {
      color: theme.palette.status.warningDark
    }
  },
  error: {
    color: theme.palette.status.errorDark,
    '& .defaultFill': {
      fill: theme.palette.status.error
    },
    '&$checked': {
      color: theme.palette.status.errorDark
    }
  },
  disabled: {
    color: '#ccc !important',
    fill: `${theme.bg.main} !important`,
    pointerEvents: 'none',
    '& .defaultFill': {
      opacity: 0.5,
      fill: `${theme.bg.main}`
    }
  }
});

interface Props extends CheckboxProps {
  variant?: 'warning' | 'error';
  text?: string | JSX.Element;
  toolTipText?: string;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeCheckBox: React.StatelessComponent<FinalProps> = props => {
  const { toolTipText, text, classes, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: Boolean(props.checked),
    [classes.warning]: props.variant === 'warning',
    [classes.error]: props.variant === 'error'
  });

  if (props.text) {
    return (
      <React.Fragment>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              className={classnames}
              icon={<CheckboxIcon />}
              checkedIcon={<CheckboxCheckedIcon />}
              data-qa-checked={props.checked}
              {...rest}
            />
          }
          label={props.text}
        />
        {toolTipText && <HelpIcon text={toolTipText} />}
      </React.Fragment>
    );
  }

  return (
    <Checkbox
      color="primary"
      className={classnames}
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      {...rest}
    />
  );
};

export default withStyles(styles)(LinodeCheckBox);
