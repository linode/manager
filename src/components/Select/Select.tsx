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
import HelpIcon from 'src/components/HelpIcon';

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
    maxHeight: 250,
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'content-box',
    [theme.breakpoints.down('xs')]: {
      minWidth: 200,
    },
    '& .selectPlaceholder': {
      height: 0,
      padding: 0,
    },
  },
  dropDown: {
    boxShadow: 'none',
    position: 'absolute',
    boxSizing: 'content-box',
    border: '1px solid #bbb',
    margin: '0 0 0 -1px',
    outline: 0,
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
  helpText?: string;
  success?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SSelect: React.StatelessComponent<CombinedProps> = ({
  children,
  classes,
  success,
  error,
  helpText,
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
    <React.Fragment>
      <Select
        className={c}
        MenuProps={menuProps}
        input={<Input {...inputProps} />}
        {...props}
      >
        {children}
      </Select>
      {helpText && <HelpIcon text={helpText} />}
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SSelect);

