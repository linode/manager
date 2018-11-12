import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles, WithTheme } from '@material-ui/core/styles';

import Toggle from 'src/components/Toggle';

type ClassNames = 'switchWrapper' | 'switchText' | 'toggle';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  switchText: {
    color: '#777',
    fontSize: '.8rem',
    transition: theme.transitions.create(['color']),
    '&.active': {
      transition: theme.transitions.create(['color']),
      color: '#C9CACB',
    },
  },
  switchWrapper: {
    padding: '16px 40px 0 34px',
    alignItems: 'center',
    marginTop: 'auto',
    width: 'calc(100% - 20px)',
    justifyContent: 'center',
    display: 'flex',
  },
  toggle: {
    '& > span:last-child': {
      backgroundColor: '#f4f4f4 !important',
      opacity: 0.38,
    },
    '&.darkTheme .square': {
      fill: '#444 !important',
    },
  },
});

interface Props {
  toggleTheme: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithTheme;

const ThemeToggle: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, toggleTheme } = props;

  const themeName = props.theme.name;

  return (
    <div className={classes.switchWrapper}>
      <span
        className={classNames({
          [classes.switchText]: true,
          active: themeName === 'lightTheme',
        })}
      >
        Light
      </span>
      <Toggle
        onChange={toggleTheme}
        checked={themeName !== 'lightTheme'}
        className={classNames({
          [classes.toggle]: true,
          [themeName]: true,
        })}
      />
      <span
        className={classNames({
          [classes.switchText]: true,
          darkTheme: themeName === 'darkTheme',
        })}
        style={{ marginLeft: 4 }}
      >
        Dark
      </span>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ThemeToggle);

