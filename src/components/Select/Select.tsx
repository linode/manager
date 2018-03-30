import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Select, { SelectProps } from 'material-ui/Select';
import Input, { InputProps } from 'material-ui/Input';
import { MenuProps } from 'material-ui/Menu';

type ClassNames = 'root' | 'menu' | 'inputSucess';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  menu: {},
  inputSucess: {
    borderColor: 'green',
  },
});

interface Props extends SelectProps {
  success?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SSelect: React.StatelessComponent<CombinedProps> = ({
  children,
  classes,
  success,
  ...props,
}) => {

  const menuProps: Partial<MenuProps> = {
    getContentAnchorEl: undefined,
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
    MenuListProps: { className: classes.menu },
  };

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true,
  };

  const c = classNames({
    [classes.root]: true,
    [classes.inputSucess]: success === true,
  });

  return (
    <Select
      autoWidth
      className={`${c} cSelect`}
      MenuProps={menuProps}
      input={<Input {...inputProps} />}
      {...props}
    >
      {children}
    </Select>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SSelect);

