import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Chip, ChipProps } from 'src/components/Chip';

interface BetaChipProps
  extends Omit<
    ChipProps,
    | 'avatar'
    | 'clickable'
    | 'deleteIcon'
    | 'disabled'
    | 'icon'
    | 'label'
    | 'onDelete'
    | 'outlineColor'
    | 'variant'
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
    marginLeft: theme.spacing(),
    textTransform: 'uppercase',
  },
}));

const BetaChip = (props: BetaChipProps) => {
  const { classes, cx } = useStyles();

  const { className, color } = props;

  return (
    <Chip
      {...props}
      className={cx(className, {
        [classes.root]: true,
      })}
      color={color}
      label="beta"
    />
  );
};

export { BetaChip };
