import * as classNames from 'classnames';
import * as React from 'react';
import { withStyles, WithTheme } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

interface Props {
  toggleTheme: () => void;
}

const onClickHandler = () => {
  document.body.classList.add('no-transition');
};

type CombinedProps = Props & WithTheme;

export const ThemeToggle: React.FC<CombinedProps> = props => {
  const { toggleTheme, theme } = props;
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
};

const styled = withStyles({}, { withTheme: true });

export default styled(ThemeToggle);
