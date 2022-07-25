import classNames from 'classnames';
import * as React from 'react';
import { Theme, useTheme } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

interface Props {
  toggleTheme: () => void;
}

const onClickHandler = () => {
  document.body.classList.add('no-transition');
};

export const ThemeToggle = (props: Props) => {
  const { toggleTheme } = props;
  const theme = useTheme<Theme>();
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
          [themeName]: true,
        })}
        aria-label="Switch Theme"
      />
    </div>
  );
};

export default ThemeToggle;
