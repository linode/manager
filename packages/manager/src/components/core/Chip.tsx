import * as React from 'react';
import classNames from 'classnames';
import { makeStyles, Theme } from './styles';
import {
  default as _Chip,
  ChipProps as _ChipProps,
} from '@material-ui/core/Chip';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '0.65rem',
  },
  clickable: {
    backgroundColor: theme.name === 'lightTheme' ? '#e5f1ff' : '#415d81',
    '&:hover': {
      backgroundColor: theme.name === 'lightTheme' ? '#cce2ff' : '#374863',
    },
  },
  outlined: {
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  ['outline-gray']: {
    border: '1px solid #ccc',
  },
  ['outline-green']: {
    border: '1px solid #02B159',
  },
}));

export interface ChipProps extends Omit<_ChipProps, 'variant'> {
  variant?: 'clickable' | _ChipProps['variant'];
  outlineColor?: 'green' | 'gray';
  component?: string;
}

const Chip: React.FC<ChipProps> = ({
  variant,
  outlineColor = 'gray',
  className,
  ...props
}) => {
  const classes = useStyles();

  return (
    <_Chip
      className={classNames(className, classes.root, {
        [classes.clickable]: variant === 'clickable',
        [classes.outlined]: variant === 'outlined',
        [classes[`outline-${outlineColor}`]]: variant === 'outlined',
      })}
      {...props}
    />
  );
};

export default Chip;
