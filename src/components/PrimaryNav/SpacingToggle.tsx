import * as classNames from 'classnames';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

type ClassNames = 'switchWrapper' | 'switchText' | 'toggle';

export const styles: StyleRulesCallback<ClassNames> = theme => ({
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
    padding: '16px 40px 0 34px',
    alignItems: 'center',
    marginTop: 'auto',
    width: 'calc(100% - 20px)',
    justifyContent: 'center',
    display: 'flex'
  },
  toggle: {
    '& > span:last-child': {
      backgroundColor: '#f4f4f4 !important',
      opacity: `0.38 !important`
    },
    '&.darkTheme .square': {
      fill: '#444 !important'
    }
  }
});

interface Props {
  toggleSpacing: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithTheme;

export const SpacingToggle: React.StatelessComponent<CombinedProps> = props => {
  const { classes, toggleSpacing, theme } = props;
  const { spacing: spacingUnit } = theme;

  return (
    <div className={classes.switchWrapper}>
      <span
        className={classNames({
          [classes.switchText]: true,
          active: spacingUnit.unit === 8
        })}
      >
        Normal
      </span>
      <Toggle
        onChange={toggleSpacing}
        checked={spacingUnit.unit !== 8}
        className={classNames({
          [classes.toggle]: true,
          [spacingUnit.unit]: true
        })}
        aria-label="Switch Spacing"
      />
      <span
        className={classNames({
          [classes.switchText]: true,
          active: spacingUnit.unit === 4
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
