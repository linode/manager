import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as classNames from 'classnames';
import { clamp, equals } from 'ramda';
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
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

type ClassNames =
  | 'root'
  | 'helpWrapper'
  | 'helpWrapperTextField'
  | 'expand'
  | 'small'
  | 'selectSmall'
  | 'tiny';

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
    width: '3em'
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
  small?: boolean;
  tiny?: boolean;
  /**
   * number amounts allowed in textfield
   * "type" prop must also be set to "number"
   */
  min?: number;
  max?: number;
};

type CombinedProps = Props & WithTheme & WithStyles<ClassNames>;

interface State {
  value: string | number;
}

class LinodeTextField extends React.Component<CombinedProps> {
  state: State = {
    value: ''
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

    /** invoke the onChange prop if one is provided */
    if (onChange) {
      onChange(e);
    }
  };

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
      onChange,
      expand,
      small,
      tiny,
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
          /* props value should always override state */
          value={this.props.value || this.state.value}
          onChange={this.handleChange}
          InputLabelProps={{
            ...finalProps.InputLabelProps,
            shrink: true
          }}
          InputProps={{
            disableUnderline: true,
            className: classNames(
              'input',
              {
                [classes.expand]: expand,
                [classes.small]: small,
                [classes.tiny]: tiny
              },
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
            },
            inputProps: {
              className: classNames({
                [classes.selectSmall]: small
              })
            }
          }}
          className={classNames(
            {
              [classes.helpWrapperTextField]: Boolean(tooltipText),
              [classes.small]: small
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
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, Props>(styled)(LinodeTextField);
