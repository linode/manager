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


import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'root'
  | 'inputSucess'
  | 'inputError';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    '&[class*="focused"]': {
      borderColor: '#666',
    },
  },
  inputError: {
    borderColor: theme.color.red,
    '&[class*="focused"]': {
      borderColor: theme.color.red,
    },
  },
  inputSucess: {
    borderColor: theme.color.green,
    '&[class*="focused"]': {
      borderColor: theme.color.green,
    },
    '& + p': {
      color: theme.color.green,
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
    MenuListProps: { className: 'selectMenuList' },
    PaperProps: { className: 'selectMenuDropdown' },
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

