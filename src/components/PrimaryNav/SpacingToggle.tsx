import { WithStyles, WithTheme } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';
import { spacing as spacingStorage } from 'src/utilities/storage';

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
        backgroundColor: '#f4f4f4 !important' as '#f4f4f4',
        opacity: '0.38 !important' as any
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
  const spacingMode = spacingStorage.get();

  return (
    <div className={classes.switchWrapper}>
      <span
        className={classNames({
          [classes.switchText]: true,
          active: spacingMode === 'normal'
        })}
      >
        Normal
      </span>
      <Toggle
        onChange={toggleSpacing}
        checked={spacingMode === 'compact'}
        className={classNames({
          [classes.toggle]: true,
          dt: spacingMode === 'compact'
        })}
        aria-label="Switch Spacing"
      />
      <span
        className={classNames({
          [classes.switchText]: true,
          active: spacingMode === 'compact'
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
