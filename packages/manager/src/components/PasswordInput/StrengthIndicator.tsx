import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

type StrengthValues = 0 | 1 | 2 | 3 | 4 | null;

interface Props {
  hideStrengthLabel?: boolean;
  strength: StrengthValues;
}

const useStyles = makeStyles()((theme: Theme) => ({
  block: {
    '&[class*="strength-"]': {
      backgroundColor: theme.palette.primary.main,
    },
    backgroundColor: theme.tokens.color.Neutrals[40],
    height: '4px',
    transition: 'background-color .5s ease-in-out',
  },
  blockOuter: {
    padding: '4px !important' as '4px',
  },
  root: {
    maxWidth: `calc(415px + ${theme.spacing(1)})`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: `calc(100% + ${theme.spacing(1)})`,
    },
  },
  strengthLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  strengthText: {
    position: 'relative',
    textAlign: 'right',
    textTransform: 'none',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
}));

export const StrengthIndicator = (props: Props) => {
  const { classes, cx } = useStyles();

  const { hideStrengthLabel, strength } = props;

  return (
    <Grid
      className={classes.root}
      container
      data-qa-strength={strength}
      sx={{
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      {Array.from(Array(3), (v, idx) => idx + 1).map((idx) => (
        <Grid className={classes.blockOuter} key={idx} size={3}>
          <div
            className={cx({
              [`strength-${strength}`]:
                strength !== undefined &&
                strength !== null &&
                idx <= scaledStrength(strength),
              [classes.block]: true,
            })}
          />
        </Grid>
      ))}
      <Grid paddingLeft={1} size={3}>
        <Typography
          className={classes.strengthText}
          data-qa-password-strength
          variant="caption"
        >
          {!hideStrengthLabel && (
            <span className={classes.strengthLabel}>Strength:</span>
          )}
          {convertStrengthScore(strength)}
        </Typography>
      </Grid>
    </Grid>
  );
};

const scaledStrength = (strength: number) => {
  if ([0, 1].includes(strength)) {
    return 1;
  }

  if ([2, 3].includes(strength)) {
    return 2;
  }

  if (strength === 4) {
    return 3;
  }

  return 0;
};

export const convertStrengthScore = (strength: StrengthValues) => {
  switch (strength) {
    case 0:
    case 1:
    case null:
      return ' Weak';
    case 2:
    case 3:
      return ' Fair';
    case 4:
      return ' Good';
    default:
      return ' Weak';
  }
};
