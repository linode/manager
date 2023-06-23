import { ChipProps as _ChipProps, default as _Chip } from '@mui/material/Chip';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  inTable: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    minHeight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  ['outline-gray']: {
    border: '1px solid #ccc',
  },
  ['outline-green']: {
    border: '1px solid #02B159',
  },
}));

export interface ChipProps extends _ChipProps {
  outlineColor?: 'green' | 'gray';
  component?: string;
  inTable?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  outlineColor = 'gray',
  className,
  inTable,
  ...props
}) => {
  const classes = useStyles();

  return (
    <_Chip
      className={classNames(className, {
        [classes.inTable]: inTable,
        [classes[`outline-${outlineColor}`]]: props.variant === 'outlined',
      })}
      {...props}
    />
  );
};

export default Chip;
