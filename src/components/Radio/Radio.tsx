import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import Radio, { RadioProps } from 'src/components/core/Radio';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

type CSSClasses = 'root' | 'checked' | 'disabled' | 'warning' | 'error';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      color: '#ccc',
      padding: '4px 10px',
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
      fill: '#f4f4f4 !important',
      pointerEvents: 'none',
      '& .defaultFill': {
        fill: '#f4f4f4'
      }
    }
  });

interface Props extends RadioProps {
  variant?: 'warning' | 'error';
}

type FinalProps = Props & WithStyles<CSSClasses>;

const LinodeRadioControl: React.StatelessComponent<FinalProps> = props => {
  const { classes, ...rest } = props;

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: props.checked === true,
    [classes.warning]: props.variant === 'warning',
    [classes.error]: props.variant === 'error'
  });

  return (
    <Radio
      color="primary"
      className={classnames}
      {...rest}
      icon={<RadioIcon />}
      checkedIcon={<RadioIconRadioed />}
      data-qa-radio={props.checked || false}
      inputProps={{
        'aria-label': props.name,
        ...props.inputProps
      }}
    />
  );
};

export default withStyles(styles)(LinodeRadioControl);
