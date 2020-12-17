import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
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
    }
  });

interface Props {
  toggleTheme: () => void;
}

const onClickHandler = () => {
  document.body.classList.add('no-transition');
};

type CombinedProps = Props & WithStyles<ClassNames> & WithTheme;

export class ThemeToggle extends React.Component<CombinedProps> {
  render() {
    const { classes, toggleTheme, theme } = this.props;
    const { name: themeName } = theme;

    const toggle = () => {
      toggleTheme();
      onClickHandler();
    };

    return (
      <div className={classes.switchWrapper}>
        <Toggle
          onChange={toggle}
          checked={themeName !== 'lightTheme'}
          className={classNames({
            [themeName]: true
          })}
          aria-label="Switch Theme"
        />
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(ThemeToggle);
