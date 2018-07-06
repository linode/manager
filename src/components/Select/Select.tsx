import * as classNames from 'classnames';
import * as React from 'react';

import Input, { InputProps } from '@material-ui/core/Input';
import { MenuProps } from '@material-ui/core/Menu';
import Select, { SelectProps } from '@material-ui/core/Select';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'inputSucess'
  | 'inputError';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
  open?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SSelect: React.StatelessComponent<CombinedProps> = ({
  children,
  classes,
  success,
  error,
  helpText,
  ...props
}) => {

  const menuProps: Partial<MenuProps> = {
    getContentAnchorEl: undefined,
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
    MenuListProps: { className: 'selectMenuList' },
    PaperProps: { className: 'selectMenuDropdown' },
    /** @todo Had to disable transition. */
    // transition: Fade,
  };

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true,
  };

  const c = classNames({
    [classes.inputSucess]: success === true,
    [classes.inputError]: error === true,
  });

  return (
    <React.Fragment>
      <Select
        open={props.open}
        className={c}
        MenuProps={menuProps}
        input={<Input {...inputProps} />}
        {...props}
        data-qa-select
      >
        {children}
      </Select>
      {helpText && <HelpIcon text={helpText} />}
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(SSelect);
