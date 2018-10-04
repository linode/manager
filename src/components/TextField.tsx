import * as React from 'react';

import { equals } from 'ramda';

import * as classNames from 'classnames';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'root'
  | 'helpWrapper'
  | 'helpWrapperTextField'
  | 'expand';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  helpWrapperTextField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  expand: {
    maxWidth: '100%',
  },
});

export interface Props extends TextFieldProps {
  errorText?: string;
  errorGroup?: string;
  affirmative?: Boolean;
  tooltipText?: string;
  className?: any;
  [index: string]: any;
  expand?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeTextField extends React.Component<CombinedProps> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.value !== this.props.value
      || nextProps.error !== this.props.error
      || nextProps.errorText !== this.props.errorText
      || nextProps.affirmative !== this.props.affirmative
      || nextProps.select !== this.props.select
      || nextProps.type !== this.props.type
      || nextProps.disabled !== this.props.disabled
      || nextProps.helperText !== this.props.helperText
      || Boolean(this.props.select && nextProps.children !== this.props.children)
      || !equals(nextProps.InputProps, this.props.InputProps);
  }

  render() {
    const {
      errorText,
      errorGroup,
      affirmative,
      classes,
      fullWidth,
      children,
      tooltipText,
      theme,
      className,
      expand,
      ...textFieldProps
    } = this.props;

    const finalProps: TextFieldProps = { ...textFieldProps };

    if (errorText) {
      finalProps.error = true;
      finalProps.helperText = errorText;
      const errorScrollClassName = errorGroup
        ? `error-for-scroll-${errorGroup}`
        : `error-for-scroll`;
      finalProps.InputProps = {
        className: errorScrollClassName,
        ...finalProps.InputProps
      };
    }

    if (affirmative) {
      finalProps.InputProps = {
        className: 'affirmative',
      };
    }

    finalProps.fullWidth = fullWidth === false
      ? false
      : true;

    return (
      <div className={classNames({
        [classes.helpWrapper]: Boolean(tooltipText),
      })}
      >
        <TextField
          {...finalProps}
          InputLabelProps={{
            ...finalProps.InputLabelProps,
            shrink: true,
          }}
          InputProps={{
            ...finalProps.InputProps,
            disableUnderline: true,
            className: classNames({
              [classes.expand]: expand,
            })}
          }
          SelectProps={{
            IconComponent: KeyboardArrowDown,
            MenuProps: {
              getContentAnchorEl: undefined,
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              MenuListProps: { className: 'selectMenuList' },
              PaperProps: { className: 'selectMenuDropdown' },
            },
          }}
          className={classNames({
            [classes.helpWrapperTextField]: Boolean(tooltipText),
          },
          className,
          )}
        >
          {this.props.children}
        </TextField>
        {tooltipText && <HelpIcon text={tooltipText} />}
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(LinodeTextField);
