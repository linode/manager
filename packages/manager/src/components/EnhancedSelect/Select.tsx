import { Theme, useTheme } from '@mui/material';
import classNames from 'classnames';
import * as React from 'react';
import ReactSelect, {
  ActionMeta,
  NamedProps as SelectProps,
  ValueType,
} from 'react-select';
import CreatableSelect, {
  CreatableProps as CreatableSelectProps,
} from 'react-select/creatable';

import { TextFieldProps } from 'src/components/TextField';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

import { reactSelectStyles, useStyles } from './Select.styles';
import { DropdownIndicator } from './components/DropdownIndicator';
import Input from './components/Input';
import { LoadingIndicator } from './components/LoadingIndicator';
import MenuList from './components/MenuList';
import MultiValueLabel from './components/MultiValueLabel';
import MultiValueRemove from './components/MultiValueRemove';
import NoOptionsMessage from './components/NoOptionsMessage';
import { Option } from './components/Option';
import Control from './components/SelectControl';
import { SelectPlaceholder as Placeholder } from './components/SelectPlaceholder';

export interface Item<T = number | string, L = string> {
  data?: any;
  label: L;
  value: T;
}

export interface GroupType<T = number | string> {
  label: string;
  options: Item<T>[];
}

export interface NoOptionsMessageProps {
  inputValue: string;
}

// Material-UI versions of several React-Select components.
// Will override the RS defaults.
const _components = {
  Control,
  DropdownIndicator,
  Input,
  LoadingIndicator,
  MenuList,
  MultiValueLabel,
  MultiValueRemove,
  NoOptionsMessage,
  Option,
  Placeholder,
};

// We extend TexFieldProps to still be able to pass
// the required label to Select and not duplicated it to TextFieldProps
interface ModifiedTextFieldProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
}

export interface BaseSelectProps<
  I extends Item,
  IsMulti extends boolean = false,
  Clearable extends boolean = false
> extends Omit<SelectProps<I, IsMulti>, 'onChange'>,
    CreatableSelectProps<I, IsMulti> {
  /**
   * Optional additional class names to apply to the root element.
   */
  classes?: any;
  /**
   * Allow options to be created while the isLoading prop is true.
   * @default false
   */
  creatable?: boolean;

  /** the rest are props we've added ourselves */
  /**
   * If true, the input will be blurred when a selection is made.
   * @default false
   */
  disabled?: boolean;
  /**
   * To facilitate error handling in forms.
   */
  errorGroup?: string;
  /**
   * errorText and label both passed to textFieldProps.
   * @todo consider just putting this under textFieldProps.
   */
  errorText?: string;
  /**
   * Returns helper text to display under the select popover.
   */
  guidance?: React.ReactNode | string;
  /**
   * If true, the label will be hidden.
   * @default false
   */
  hideLabel?: boolean;
  /**
   * If true, the label will be displayed inline.
   * @default false
   */
  inline?: boolean;
  /**
   * To specify a custom input ID
   * @default false
   */
  inputId?: any;
  /**
   * If true, the input will be clearable
   * @default false
   */
  isClearable?: Clearable;
  /**
   * We require label for accessibility purpose
   */
  label?: string;
  medium?: boolean;
  noMarginTop?: boolean;
  /** onChange is called when the user selectes a new value / new values */
  onChange: Clearable extends true // if the Select is NOT clearable, the value passed in the onChange function must be defined
    ? Exclude<SelectProps<I, IsMulti>['onChange'], undefined>
    : (
        value: Exclude<ValueType<I, IsMulti>, null | undefined>,
        action: ActionMeta<I>
      ) => void;
  // document body directly, so the overflow is visible over the edge of the modal.
  overflowPortal?: boolean;
  required?: boolean;
  small?: boolean;
  /*
   textFieldProps isn't native to react-select
   but we're using the MUI select element so any props that
   can be passed to the MUI TextField element can be passed here
  */
  textFieldProps?: ModifiedTextFieldProps;
  // Set this prop to `true` when using a <Select /> on a modal. It attaches the <Select /> to the
  variant?: 'creatable';
}

/**
 * Our legacy Select component, which wraps React-Select and provides a Material-UI based styling.<br />
 * ⚠️ **deprecated** This component is deprecated and should not be used in new code. Instead, use the <a href="/docs/components-selects-autocomplete--documentation" target="_self">Autocomplete</a> component.
 *
 * @deprecated
 */
const Select = <
  I extends Item,
  IsMulti extends boolean = false,
  Clearable extends boolean = false
>(
  props: BaseSelectProps<I, IsMulti, Clearable>
) => {
  const theme = useTheme<Theme>();
  const { classes } = useStyles();
  const {
    blurInputOnSelect,
    className,
    components,
    creatable,
    errorGroup,
    errorText,
    filterOption,
    hideLabel,
    inline,
    inputId,
    isClearable,
    isLoading,
    isMulti,
    label,
    medium,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    onChange,
    onFocus,
    onInputChange,
    onMenuClose,
    options,
    overflowPortal,
    placeholder,
    required,
    small,
    textFieldProps,
    value,
    ...restOfProps
  } = props;

  // React-Select changed the behavior of clearing isMulti Selects in v3.
  // Previously, once the Select was empty, the value was `[]`. Now, it is `null`.
  // This breaks many of our components, which rely on e.g. mapping through the value (which is
  // always assumed in be an array.)
  //
  // This essentially reverts the behavior of the v3 React-Select update. Long term, we should
  // probably re-write our component handlers to expect EITHER an array OR `null`.
  const _onChange = (
    selected: ValueType<I, IsMulti>,
    actionMeta: ActionMeta<I>
  ) => {
    if (isMulti && !selected) {
      // @ts-expect-error I'm sorry, but trust me I made this component much better
      onChange([], actionMeta);
    } else {
      // @ts-expect-error I'm sorry, but trust me I made this component much better
      onChange(selected, actionMeta);
    }
  };

  /*
   * By default, we use the built-in Option component from React-Select, along with several Material-UI based
   * components (listed in the _components variable above). To customize the select in a particular instance
   * (for example, to render more complicated options for search bars), provide the component to use in a prop
   * Object. Specify the name of the component to override as the object key, with the component to use in its
   * place as the value. Full list of available components to override is available at
   * http://react-select.com/components#replaceable-components. As an example, to provide a custom option component, use:
   * <Select components={{ Option: MyCustomOptionComponent }}.
   *
   * The components passed in as props will be merged with the overrides we are already using, with the passed components
   * taking precedence.
   */
  const combinedComponents: any = { ..._components, ...components };

  // If async, pass loadOptions instead of options. A Select can't be both Creatable and Async.
  // (AsyncCreatable exists, but we have not adapted it.)

  const BaseSelect = creatable
    ? (CreatableSelect as React.ComponentClass<BaseSelectProps<I, any, any>>)
    : (ReactSelect as React.ComponentClass<BaseSelectProps<I, any, any>>);

  if (creatable) {
    restOfProps.variant = 'creatable';
  }

  if (overflowPortal) {
    restOfProps.menuPortalTarget = document.body;
    // Since we're attaching the <Select /> to the document body directly, none of our CSS
    // targeting will work, so we have to supply the styles as a prop.
    restOfProps.styles = reactSelectStyles(theme);
  }

  return (
    <BaseSelect
      {...restOfProps}
      inputId={
        inputId
          ? inputId
          : typeof label === 'string'
          ? convertToKebabCase(label)
          : null
      }
      /*
        textFieldProps isn't native to react-select
        but we're using the MUI select element so any props that
        can be passed to the MUI TextField element can be passed here
      */
      textFieldProps={{
        ...textFieldProps,
        InputLabelProps: {
          shrink: true,
        },
        className: classNames(
          {
            [classes.inline]: inline,
            [classes.medium]: medium,
            [classes.small]: small,
          },
          className
        ),
        disabled: props.isDisabled || props.disabled,
        errorGroup,
        errorText,
        hideLabel,
        label,
        noMarginTop,
        required,
      }}
      blurInputOnSelect={blurInputOnSelect}
      className={classNames(classes.root, className)}
      classNamePrefix="react-select"
      classes={classes}
      components={combinedComponents}
      filterOption={filterOption}
      // If isClearable hasn't been supplied, default to true
      isClearable={isClearable ?? true}
      isDisabled={props.disabled || props.isDisabled}
      isLoading={isLoading}
      isMulti={isMulti}
      isSearchable
      label={props.label}
      menuPlacement={props.menuPlacement || 'auto'}
      noOptionsMessage={noOptionsMessage || (() => 'No results')}
      onBlur={onBlur}
      onChange={_onChange}
      onFocus={onFocus}
      onInputChange={onInputChange}
      onMenuClose={onMenuClose}
      options={options}
      placeholder={placeholder || 'Select a value...'}
      value={value}
    />
  );
};

export default Select;
