import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import { equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import TextField, { TextFieldProps } from 'src/components/core/TextField';
import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'root' | 'helpWrapper' | 'helpWrapperTextField' | 'expand';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  helpWrapper: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  helpWrapperTextField: {
    width: 415,
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  expand: {
    maxWidth: '100%'
  }
});

export type Props = TextFieldProps & {
  errorText?: string;
  errorGroup?: string;
  affirmative?: Boolean;
  tooltipText?: string;
  className?: any;
  [index: string]: any;
  expand?: boolean;
};

type CombinedProps = Props & WithTheme & WithStyles<ClassNames>;

class LinodeTextField extends React.Component<CombinedProps> {
  shouldComponentUpdate(nextProps: CombinedProps) {
    return (
      nextProps.value !== this.props.value ||
      nextProps.error !== this.props.error ||
      nextProps.errorText !== this.props.errorText ||
      nextProps.affirmative !== this.props.affirmative ||
      nextProps.select !== this.props.select ||
      nextProps.type !== this.props.type ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.helperText !== this.props.helperText ||
      Boolean(
        this.props.select && nextProps.children !== this.props.children
      ) ||
      !equals(nextProps.InputProps, this.props.InputProps) ||
      nextProps.theme.name !== this.props.theme.name
    );
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

    let errorScrollClassName = '';

    if (errorText) {
      finalProps.error = true;
      finalProps.helperText = errorText;
      errorScrollClassName = errorGroup
        ? `error-for-scroll-${errorGroup}`
        : `error-for-scroll`;
    }

    if (affirmative) {
      finalProps.InputProps = {
        className: 'affirmative'
      };
    }

    finalProps.fullWidth = fullWidth === false ? false : true;

    return (
      <div
        className={classNames({
          [classes.helpWrapper]: Boolean(tooltipText),
          [errorScrollClassName]: !!errorText
        })}
      >
        <TextField
          {...finalProps}
          InputLabelProps={{
            ...finalProps.InputLabelProps,
            shrink: true
          }}
          InputProps={{
            disableUnderline: true,
            className: classNames(
              'input',
              { [classes.expand]: expand },
              className
            ),
            ...finalProps.InputProps
          }}
          SelectProps={{
            IconComponent: KeyboardArrowDown,
            MenuProps: {
              getContentAnchorEl: undefined,
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              MenuListProps: { className: 'selectMenuList' },
              PaperProps: { className: 'selectMenuDropdown' }
            }
          }}
          className={classNames(
            {
              [classes.helpWrapperTextField]: Boolean(tooltipText)
            },
            className
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

export default compose<CombinedProps, Props>(styled)(LinodeTextField);
