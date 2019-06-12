import { WithStyles, WithTheme } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

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
      display: 'flex',
      marginLeft: -10
    },
    toggle: {
      '& > span:last-child': {
        backgroundColor: '#f4f4f4 !important' as '#f4f4f4',
        opacity: '0.38 !important' as any
      },
      '&.darkTheme .square': {
        fill: '#444 !important'
      }
    }
  });

interface Props {
  toggleTheme: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithTheme;

export class ThemeToggle extends React.Component<CombinedProps> {
  render() {
    const { classes, toggleTheme, theme } = this.props;
    const { name: themeName } = theme;

    return (
      <div className={classes.switchWrapper}>
        <span
          className={classNames({
            [classes.switchText]: true,
            active: themeName === 'lightTheme'
          })}
        >
          Light
        </span>
        <Toggle
          onChange={toggleTheme}
          checked={themeName !== 'lightTheme'}
          className={classNames({
            [classes.toggle]: true,
            [themeName]: true
          })}
          aria-label="Switch Theme"
        />
        <span
          className={classNames({
            [classes.switchText]: true,
            active: themeName === 'darkTheme'
          })}
          style={{ marginLeft: 4 }}
        >
          Dark
        </span>
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(ThemeToggle);
