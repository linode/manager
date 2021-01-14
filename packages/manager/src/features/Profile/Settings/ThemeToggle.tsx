import * as classNames from 'classnames';
import * as React from 'react';
import { Theme, useTheme } from 'src/components/core/styles';
import Toggle from 'src/components/Toggle';

interface Props {
  toggleTheme: () => void;
}

const onClickHandler = () => {
  document.body.classList.add('no-transition');
};

type CombinedProps = Props;

export const ThemeToggle: React.FC<CombinedProps> = props => {
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
          [themeName]: true
        })}
        aria-label="Switch Theme"
      />
    </div>
  );
};

export default ThemeToggle;
