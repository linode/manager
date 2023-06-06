import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';

type StrengthValues = null | 0 | 1 | 2 | 3 | 4;

interface Props {
  strength: StrengthValues;
  hideStrengthLabel?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    maxWidth: `calc(415px + ${theme.spacing(1)})`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: `calc(100% + ${theme.spacing(1)})`,
    },
  },
  block: {
    backgroundColor: '#C9CACB',
    height: '4px',
    transition: 'background-color .5s ease-in-out',
    '&[class*="strength-"]': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  strengthText: {
    position: 'relative',
    fontSize: '.85rem',
    textAlign: 'right',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  strengthLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  blockOuter: {
    padding: '4px !important' as '4px',
  },
}));

export const StrengthIndicator = (props: Props) => {
  const { classes, cx } = useStyles();

  const { strength, hideStrengthLabel } = props;

  return (
    <Grid
      container
      alignItems="flex-end"
      spacing={1}
      className={classes.root}
      data-qa-strength={strength}
      sx={{ paddingLeft: 0, paddingRight: 0 }}
    >
      {Array.from(Array(3), (v, idx) => idx + 1).map((idx) => (
        <Grid key={idx} xs={3} className={classes.blockOuter}>
          <div
            className={cx({
              [classes.block]: true,
              [`strength-${strength}`]:
                strength !== undefined &&
                strength !== null &&
                idx <= scaledStrength(strength),
            })}
          />
        </Grid>
      ))}
      <Grid xs={3} className="py0">
        <Typography
          variant="caption"
          className={classes.strengthText}
          data-qa-password-strength
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
    case null:
    case 0:
    case 1:
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
