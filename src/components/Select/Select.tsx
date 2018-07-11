import * as classNames from 'classnames';
import * as React from 'react';

import Input, { InputProps } from '@material-ui/core/Input';
import { MenuProps } from '@material-ui/core/Menu';
import Select, { SelectProps } from '@material-ui/core/Select';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'inputSucess'
  | 'inputError'
  | 'textError'
  | 'helpWrapper'
  | 'helpWrapperSelectField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  inputError: {
    borderColor: theme.color.red,
    '&[class*="focused"]': {
      borderColor: theme.color.red,
    },
  },
  textError: {
    marginTop: theme.spacing.unit,
    color: theme.color.red,
    fontSize: '0.8571428571428571rem',
    minHeight: '1em',
    lineHeight: '1em',
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
  helpWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  helpWrapperSelectField: {
    width: 380,
    [theme.breakpoints.down('xs')]: {
      width: 240,
    },
  },
});

interface Props extends SelectProps {
  helpText?: string;
  success?: boolean;
  open?: boolean;
  errorText?: string;
  errorGroup?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SSelect: React.StatelessComponent<CombinedProps> = ({
  children,
  classes,
  success,
  error,
  helpText,
  errorText,
  errorGroup,
  ...props
}) => {

  const errorScrollClassName = errorGroup
    ? `error-for-scroll-${errorGroup}`
    : `error-for-scroll`;

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
    [errorScrollClassName]: !!errorScrollClassName,
    [classes.helpWrapperSelectField]: Boolean(helpText),
  });

  return (
    <div className={classNames({
      [classes.helpWrapper]: Boolean(helpText),
    })}>
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
      {errorText && <p className={classes.textError}>{errorText}</p>}
      {helpText && <HelpIcon text={helpText} />}
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(SSelect);
