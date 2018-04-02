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

import LinodeTheme from '../../../src/theme';

type ClassNames = 'root'
| 'menu'
| 'dropDown'
| 'inputSucess'
| 'inputError';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    '&[class*="focused"]': {
      borderColor: '#bbb',
    },
  },
  menu: {
    border: '1px solid #bbb',
  },
  dropDown: {
    boxShadow: 'none',
    position: 'absolute',
    width: '100%',
    maxWidth: 417,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: LinodeTheme.bg.offWhite,
    left: '16px !important',
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 30px)',
    },
  },
  inputError: {
    borderColor: LinodeTheme.color.red,
    '&[class*="focused"]': {
      borderColor: LinodeTheme.color.red,
    },
  },
  inputSucess: {
    borderColor: LinodeTheme.color.green,
    '&[class*="focused"]': {
      borderColor: LinodeTheme.color.green,
    },
    '& + p': {
      color: LinodeTheme.color.green,
    },
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
  error,
  ...props,
}) => {

  const menuProps: Partial<MenuProps> = {
    getContentAnchorEl: undefined,
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
    MenuListProps: { className: classes.menu },
    PaperProps: { className: classes.dropDown },
  };

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true,
  };

  const c = classNames({
    [classes.root]: true,
    [classes.inputSucess]: success === true,
    [classes.inputError]: error === true,
  });

  return (
    <Select
      autoWidth
      className={c}
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

