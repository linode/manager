import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  withStyles,
  WithTheme
} from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

export const styles = () => createStyles({});

interface Props {
  toggleTheme: () => void;
}

const onClickHandler = () => {
  document.body.classList.add('no-transition');
};

type CombinedProps = Props & WithTheme;

export class ThemeToggle extends React.Component<CombinedProps> {
  render() {
    const { toggleTheme, theme } = this.props;
    const { name: themeName } = theme;

    const toggle = () => {
      toggleTheme();
      onClickHandler();
    };

    return (
      <div>
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
