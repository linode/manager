import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import * as React from 'react';
import Fade from 'src/components/core/Fade';
import FormHelperText from 'src/components/core/FormHelperText';
import Input, { InputProps } from 'src/components/core/Input';
import { MenuProps } from 'src/components/core/Menu';
import Select, { SelectProps } from 'src/components/core/Select';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'inputSucess'
  | 'inputError'
  | 'textError'
  | 'helpWrapper'
  | 'helpWrapperSelectField'
  | 'pagination';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  inputError: {
    borderColor: `${theme.color.red} !important`,
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
    borderColor: `${theme.color.green} !important`,
    '&[class*="focused"]': {
      borderColor: theme.color.green,
    },
    '& + p': {
      color: theme.color.green,
    },
  },
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  helpWrapperSelectField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  pagination: {
    minHeight: 40,
    '& [role="button"]': {
      padding: '3px 32px 3px 16px',
      minHeight: 40,
    },
  },
});

interface Props extends SelectProps {
  tooltipText?: string;
  success?: boolean;
  open?: boolean;
  errorText?: string;
  errorGroup?: string;
  pagination?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SSelect: React.StatelessComponent<CombinedProps> = ({
  children,
  classes,
  success,
  error,
  tooltipText,
  errorText,
  errorGroup,
  pagination,
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
    PaperProps: {
      className: classNames(
        'selectMenuDropdown',
        {
          [classes.inputSucess]: success === true,
          [classes.inputError]: error === true,
        })
    },
    TransitionComponent: Fade,
  };

  const inputProps: InputProps = {
    disableUnderline: true,
    fullWidth: true,
  };

  const c = classNames({
    [classes.inputSucess]: success === true,
    [classes.inputError]: error === true,
    [errorScrollClassName]: !!errorText && !!errorScrollClassName,
    [classes.helpWrapperSelectField]: Boolean(tooltipText),
    [classes.pagination]: Boolean(pagination),
  });

  return (
    <React.Fragment>
      <div className={classNames({
        [classes.helpWrapper]: Boolean(tooltipText),
      })}>
        <Select
          open={props.open}
          className={c}
          MenuProps={menuProps}
          input={<Input {...inputProps} />}
          {...props}
          IconComponent={KeyboardArrowDown}
          data-qa-select
        >
          {children}
        </Select>
        {tooltipText && <HelpIcon text={tooltipText} />}
      </div>
      {errorText && <FormHelperText className={classes.textError}>{errorText}</FormHelperText>}
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(SSelect);
