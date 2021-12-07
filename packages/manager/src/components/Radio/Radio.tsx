import classNames from 'classnames';
import * as React from 'react';
import { default as _Radio, RadioProps } from 'src/components/core/Radio';
import { makeStyles, Theme } from 'src/components/core/styles';
import RadioIcon from '../../assets/icons/radio.svg';
import RadioIconRadioed from '../../assets/icons/radioRadioed.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: '#ccc',
    padding: '10px 10px',
    transition: theme.transitions.create(['color']),
    '& .defaultFill': {
      transition: theme.transitions.create(['fill']),
    },
    '&:hover': {
      color: theme.palette.primary.main,
      fill: theme.color.white,
      '& .defaultFill': {
        fill: theme.color.white,
      },
    },
  },
  checked: {
    color: theme.palette.primary.main,
  },
  disabled: {
    color: '#ccc !important',
    fill: '#f4f4f4 !important',
    pointerEvents: 'none',
    '& .defaultFill': {
      fill: '#f4f4f4',
    },
  },
}));

export const Radio: React.FC<RadioProps> = (props) => {
  const classes = useStyles();

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: props.checked === true,
  });

  return (
    <_Radio
      color="primary"
      className={classnames}
      {...props}
      icon={<RadioIcon />}
      checkedIcon={<RadioIconRadioed />}
      data-qa-radio={props.checked || false}
      inputProps={{
        role: 'radio',
        'aria-label': props.name,
        'aria-checked': props.checked,
        ...props.inputProps,
      }}
    />
  );
};

export default Radio;
