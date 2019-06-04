import { WithStyles, WithTheme } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';
import { COMPACT_SPACING_UNIT, NORMAL_SPACING_UNIT } from 'src/themeFactory';

type ClassNames = 'switchWrapper' | 'switchText' | 'toggle';

export const styles = (theme: Theme) =>
  createStyles({
    switchText: {
      color: '#777',
      fontSize: '.8rem',
      transition: theme.transitions.create(['color']),
      '&.active': {
        transition: theme.transitions.create(['color']),
        color: '#C9CACB'
      }
    },
    switchWrapper: {
      alignItems: 'center',
      marginTop: 'auto',
      justifyContent: 'center',
      display: 'flex'
    },
    toggle: {
      '& > span:last-child': {
        backgroundColor: '#f4f4f4 !important',
        opacity: `0.38 !important`
      },
      '&.dt .square': {
        fill: '#444 !important'
      }
    }
  });

interface Props {
  toggleSpacing: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithTheme;

export const SpacingToggle: React.StatelessComponent<CombinedProps> = props => {
  const { classes, toggleSpacing } = props;

  return (
    <div className={classes.switchWrapper}>
      <span
        className={classNames({
          [classes.switchText]: true,
          active: NORMAL_SPACING_UNIT
        })}
      >
        Normal
      </span>
      <Toggle
        onChange={toggleSpacing}
        checked={!NORMAL_SPACING_UNIT}
        className={classNames({
          [classes.toggle]: true,
          dt: COMPACT_SPACING_UNIT
        })}
        aria-label="Switch Spacing"
      />
      <span
        className={classNames({
          [classes.switchText]: true,
          active: COMPACT_SPACING_UNIT
        })}
        style={{ marginLeft: 4 }}
      >
        Compact
      </span>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(SpacingToggle);
