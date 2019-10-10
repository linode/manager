import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import { clamp, equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import TextField, { TextFieldProps } from 'src/components/core/TextField';
import HelpIcon from 'src/components/HelpIcon';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';

type ClassNames =
  | 'root'
  | 'helpWrapperContainer'
  | 'helpWrapper'
  | 'helpWrapperTextField'
  | 'expand'
  | 'errorText'
  | 'helperTextTop'
  | 'small'
  | 'noTransform'
  | 'selectSmall'
  | 'wrapper'
  | 'tiny';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      marginTop: theme.spacing(2)
    },
    noTransform: {
      transform: 'none'
    },
    root: {
      marginTop: 0
    },
    helpWrapperContainer: {
      display: 'flex',
      width: '100%'
    },
    helpWrapper: {
      display: 'flex',
      alignItems: 'flex-end',
      flexWrap: 'wrap'
    },
    helpWrapperTextField: {
      width: 415,
      [theme.breakpoints.down('xs')]: {
        width: '100%'
      }
    },
    expand: {
      maxWidth: '100%'
    },
    small: {
      minHeight: 32,
      marginTop: 0,
      '& input': {
        minHeight: 32,
        padding: theme.spacing(1)
      }
    },
    selectSmall: {
      padding: '8px 32px 0 8px',
      minHeight: 32,
      minWidth: 132,
      '& svg': {
        marginTop: 0,
        width: 24,
        height: 24
      }
    },
    tiny: {
      width: '3.6em'
    },
    errorText: {
      color: theme.color.red
    },
    helperTextTop: {
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(2)
    },
    noMarginTop: {
      marginTop: 0
    }
  });

interface BaseProps {
  errorText?: string;
  errorGroup?: string;
  affirmative?: Boolean;
  helperTextPosition?: 'top' | 'bottom';
  tooltipText?: string;
  className?: any;
  expand?: boolean;
  small?: boolean;
  // Currently only used for LKE node pool inputs
  tiny?: boolean;
  /**
   * number amounts allowed in textfield
   * "type" prop must also be set to "number"
   */
  min?: number;
  max?: number;
  dataAttrs?: Record<string, any>;
  noMarginTop?: boolean;
}

export type Props = BaseProps & TextFieldProps;

type CombinedProps = Props & WithTheme & WithStyles<ClassNames>;

interface State {
  value: string | number;
}

class LinodeTextField extends React.Component<CombinedProps> {
  state: State = {
    /** initialize the state with our passed value if we have one */
    value:
      typeof this.props.value === 'string' ||
      typeof this.props.value === 'number'
        ? this.props.value
        : ''
  };
  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return (
      nextProps.value !== this.props.value ||
      nextState.value !== this.state.value ||
      nextProps.error !== this.props.error ||
      nextProps.errorText !== this.props.errorText ||
      nextProps.affirmative !== this.props.affirmative ||
      nextProps.select !== this.props.select ||
      nextProps.type !== this.props.type ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.helperText !== this.props.helperText ||
      nextProps.classes !== this.props.classes ||
      Boolean(
        this.props.select && nextProps.children !== this.props.children
      ) ||
      !equals(nextProps.InputProps, this.props.InputProps) ||
      nextProps.theme.name !== this.props.theme.name
    );
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type, min, max, onChange } = this.props;

    const numberTypes = ['tel', 'number'];

    /** because !!0 is falsy :( */
    const minAndMaxExist = typeof min === 'number' && typeof max === 'number';

    /**
     * if we've provided a mix and max value, make sure the user
     * input doesn't go outside of those bounds ONLY if the input
     * type matches a number type
     */
    const cleanedValue =
      minAndMaxExist && numberTypes.some(eachType => eachType === type)
        ? clamp(min, max, +e.target.value)
        : e.target.value;

    this.setState({
      value: cleanedValue
    });

    /**
     * invoke the onChange prop if one is provided with the cleaned value.
     */
    if (onChange) {
      /**
       * create clone of event node only if our cleanedValue
       * is different from the e.target.value
       *
       * This solves for a specific scenario where the e.target on
       * the MUI TextField select variants were actually a plain object
       * rather than a DOM node.
       *
       * So e.target on a text field === <input />
       *
       * while e.target on the select variant === { value: 10, name: undefined }
       *
       * See GitHub issue: https://github.com/mui-org/material-ui/issues/16470
       */
      if (e.target.value !== cleanedValue) {
        const clonedEvent = {
          ...e,
          target: e.target.cloneNode()
        } as React.ChangeEvent<HTMLInputElement>;

        clonedEvent.target.value = `${cleanedValue}`;
        onChange(clonedEvent);
      } else {
        onChange(e);
      }
    }
  };

  render() {
    const {
      errorText,
      errorGroup,
      affirmative,
      classes,
      fullWidth,
      onChange,
      children,
      tooltipText,
      theme,
      className,
      expand,
      small,
      tiny,
      inputProps,
      helperText,
      helperTextPosition,
      InputProps,
      InputLabelProps,
      SelectProps,
      value,
      dataAttrs,
      error,
      noMarginTop,
      label,
      ...textFieldProps
    } = this.props;

    let errorScrollClassName = '';

    if (errorText) {
      errorScrollClassName = errorGroup
        ? `error-for-scroll-${errorGroup}`
        : `error-for-scroll`;
    }

    const maybeRequiredLabel = !!this.props.required
      ? `${label} (required)`
      : label;

    return (
      <div
        className={classNames({
          [classes.helpWrapper]: Boolean(tooltipText),
          [errorScrollClassName]: !!errorText
        })}
      >
        {maybeRequiredLabel && (
          <InputLabel
            data-qa-textfield-label={label}
            className={classNames({
              [classes.wrapper]: noMarginTop ? false : true,
              [classes.noTransform]: true
            })}
          >
            {maybeRequiredLabel || ''}
          </InputLabel>
        )}
        {helperText && helperTextPosition === 'top' && (
          <FormHelperText
            data-qa-textfield-helper-text
            className={classes.helperTextTop}
          >
            {helperText}
          </FormHelperText>
        )}
        <div
          className={classNames({
            [classes.helpWrapperContainer]: Boolean(tooltipText)
          })}
        >
          <TextField
            {...textFieldProps}
            {...dataAttrs}
            error={!!error || !!errorText}
            /**
             * set _helperText_ and _label_ to no value because we want to
             * have the ability to put the helper text under the label at the top
             */
            label={''}
            helperText={''}
            fullWidth
            /*
            let us explicitly pass an empty string to the input

            see UserDefinedFieldsPanel.tsx for a verbose explanation why.
          */
            value={value}
            onChange={this.handleChange}
            InputLabelProps={{
              ...InputLabelProps,
              required: false,
              shrink: true
            }}
            inputProps={{
              'data-testid': 'textfield-input',
              ...inputProps
            }}
            InputProps={{
              disableUnderline: true,
              className: classNames(
                'input',
                {
                  [classes.expand]: expand,
                  [classes.small]: small,
                  [classes.tiny]: tiny,
                  affirmative: !!affirmative
                },
                className
              ),
              ...InputProps
            }}
            SelectProps={{
              disableUnderline: true,
              IconComponent: KeyboardArrowDown,
              MenuProps: {
                getContentAnchorEl: undefined,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                MenuListProps: { className: 'selectMenuList' },
                PaperProps: { className: 'selectMenuDropdown' }
              },
              inputProps: {
                className: classNames({
                  [classes.selectSmall]: small
                })
              },
              ...SelectProps
            }}
            className={classNames(
              {
                [classes.helpWrapperTextField]: Boolean(tooltipText),
                [classes.small]: small,
                [classes.root]: true
              },
              className
            )}
            id={
              this.props.label
                ? convertToKebabCase(`${this.props.label}`)
                : undefined
            }
          >
            {this.props.children}
          </TextField>
          {tooltipText && <HelpIcon text={tooltipText} />}
          {errorText && (
            <FormHelperText
              className={classes.errorText}
              data-qa-textfield-error-text
            >
              {errorText}
            </FormHelperText>
          )}
        </div>
        {helperText &&
          (helperTextPosition === 'bottom' || !helperTextPosition) && (
            <FormHelperText data-qa-textfield-helper-text>
              {helperText}
            </FormHelperText>
          )}
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, Props>(styled)(
  LinodeTextField
) as React.ComponentType<Props>;
