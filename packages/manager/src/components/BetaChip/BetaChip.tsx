import { Theme } from '@mui/material/styles';
import * as React from 'react';
import Chip, { ChipProps } from 'src/components/core/Chip';
import { makeStyles } from 'tss-react/mui';

interface Props
  extends Omit<
    ChipProps,
    | 'label'
    | 'deleteIcon'
    | 'onDelete'
    | 'avatar'
    | 'disabled'
    | 'clickable'
    | 'variant'
    | 'outlineColor'
    | 'icon'
  > {
  className?: string;
  color?: 'default' | 'primary';
}

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    fontFamily: theme.font.bold,
    fontSize: '0.625rem',
    height: 16,
    letterSpacing: '.25px',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(),
  },
}));

const BetaChip = (props: Props) => {
  const { classes, cx } = useStyles();

  const { className, color } = props;

  return (
    <Chip
      {...props}
      label="beta"
      color={color}
      className={cx(className, {
        [classes.root]: true,
      })}
    />
  );
};

export { BetaChip };
