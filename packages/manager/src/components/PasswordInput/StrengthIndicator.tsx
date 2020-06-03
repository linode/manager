import * as classNames from 'classnames';
import { isNil } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Props {
  strength: null | 0 | 1 | 2 | 3;
  hideStrengthLabel?: boolean;
}
type ClassNames =
  | 'root'
  | 'block'
  | 'strengthText'
  | 'strengthLabel'
  | 'blockOuter';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: `calc(415px + ${theme.spacing(1)}px)`,
      [theme.breakpoints.down('xs')]: {
        maxWidth: `calc(100% + ${theme.spacing(1)}px)`
      }
    },
    block: {
      backgroundColor: '#C9CACB',
      height: '4px',
      transition: 'background-color .5s ease-in-out',
      '&[class*="strength-"]': {
        backgroundColor: theme.palette.primary.main
      }
    },
    strengthText: {
      position: 'relative',
      fontSize: '.85rem',
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center'
      }
    },
    strengthLabel: {
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    },
    blockOuter: {
      padding: '4px !important' as '4px'
    }
  });

const styled = withStyles(styles);

type CombinedProps = Props & WithStyles<ClassNames>;

const StrengthIndicator: React.FC<CombinedProps> = props => {
  const { classes, strength, hideStrengthLabel } = props;

  return (
    <Grid
      container
      alignItems="flex-end"
      spacing={1}
      className={classes.root}
      data-qa-strength={strength}
    >
      {Array.from(Array(3), (v, idx) => idx + 1).map(idx => (
        <Grid item key={idx} xs={3} className={classes.blockOuter}>
          <div
            className={classNames({
              [classes.block]: true,
              [`strength-${strength}`]: !isNil(strength) && idx <= strength
            })}
          />
        </Grid>
      ))}
      <Grid item xs={3} className="py0">
        <Typography
          variant="caption"
          className={classes.strengthText}
          data-qa-password-strength
        >
          {!hideStrengthLabel && (
            <span className={classes.strengthLabel}>Strength:</span>
          )}
          {strength
            ? (strength === 1 && ' Weak') ||
              (strength === 2 && ' Fair') ||
              (strength === 3 && ' Good')
            : ' Weak'}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default styled(StrengthIndicator);
