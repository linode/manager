import * as classNames from 'classnames';
import * as React from 'react';
import ReactSelect from 'react-select';
import CreatableSelect, {
  Props as CreatableSelectProps
} from 'react-select/lib/Creatable';
import { Props as SelectProps } from 'react-select/lib/Select';
import { StylesConfig } from 'react-select/lib/styles';
import { withStyles, WithStyles } from 'src/components/core/styles';
import { Props as TextFieldProps } from 'src/components/TextField';
/* TODO will be refactoring enhanced select to be an abstraction.
Styles added in this file and the below imports will be utilized for the abstraction. */
import DropdownIndicator from './components/DropdownIndicator';
import LoadingIndicator from './components/LoadingIndicator';
import MenuList from './components/MenuList';
import MultiValueLabel from './components/MultiValueLabel';
import MultiValueRemove from './components/MultiValueRemove';
import NoOptionsMessage from './components/NoOptionsMessage';
import Option from './components/Option';
import Control from './components/SelectControl';
import Placeholder from './components/SelectPlaceholder';
import { ClassNames, styles } from './Select.styles';

export interface Item<T = string | number> {
  value: T;
  label: string;
  data?: any;
}

export interface GroupType<T> {
  label: string;
  options: Item<T>[];
}

export interface SelectState {
  data: any;
  isDisabled: boolean;
  isFocused: boolean;
  isSelected: boolean;
}

interface ActionMeta {
  action: string;
}

interface ActionMeta {
  action: string;
}

export interface NoOptionsMessageProps {
  inputValue: string;
}

export interface EnhancedSelectProps {
  options?: Item[];
  className?: string;
  components?: any;
  disabled?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  isLoading?: boolean;
  variant?: 'creatable';
  value?: Item | Item[] | null;
  label?: string;
  placeholder?: string;
  errorText?: string;
  styleOverrides?: StylesConfig;
  onChange: (selected: Item | Item[] | null, actionMeta: ActionMeta) => void;
  createNew?: (inputValue: string) => void;
  onInputChange?: (inputValue: string, actionMeta: ActionMeta) => void;
  loadOptions?: (inputValue: string) => Promise<Item | Item[]> | undefined;
  filterOption?: (option: Item, inputValue: string) => boolean | null;
  medium?: boolean;
  small?: boolean;
  guidance?: string | React.ReactNode;
  noMarginTop?: boolean;
  inline?: boolean;
  hideLabel?: boolean;
  errorGroup?: string;
}

// Material-UI versions of several React-Select components.
// Will override the RS defaults.
const _components = {
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValueLabel,
  MultiValueRemove,
  MenuList,
  Option,
  DropdownIndicator,
  LoadingIndicator
};

type CombinedProps = EnhancedSelectProps &
  WithStyles<ClassNames> &
  BaseSelectProps &
  CreatableProps;

interface BaseSelectProps extends SelectProps<any> {
  classes: any;
  /* 
   textFieldProps isn't native to react-select 
   but we're using the MUI select element so any props that
   can be passed to the MUI TextField element can be passed here
  */
  textFieldProps?: TextFieldProps;
}

interface CreatableProps extends CreatableSelectProps<any> {}

class Select extends React.PureComponent<CombinedProps, {}> {
  render() {
    const {
      classes,
      className,
      components,
      createNew,
      disabled,
      errorText,
      filterOption,
      label,
      loadOptions,
      isClearable,
      isMulti,
      isLoading,
      placeholder,
      onChange,
      onInputChange,
      options,
      styleOverrides,
      value,
      variant,
      noOptionsMessage,
      onMenuClose,
      onBlur,
      blurInputOnSelect,
      medium,
      small,
      noMarginTop,
      textFieldProps,
      inline,
      hideLabel,
      errorGroup,
      ...restOfProps
    } = this.props;

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
    const combinedComponents = { ..._components, ...components };

    // If async, pass loadOptions instead of options. A Select can't be both Creatable and Async.
    // (AsyncCreatable exists, but we have not adapted it.)
    type PossibleProps = BaseSelectProps | CreatableProps;
    const BaseSelect: React.ComponentClass<PossibleProps> =
      variant === 'creatable' ? CreatableSelect : ReactSelect;

    return (
      <BaseSelect
        {...restOfProps}
        // If isClearable hasn't been supplied, default to true
        isClearable={isClearable === undefined ? true : isClearable}
        isSearchable
        blurInputOnSelect={blurInputOnSelect}
        isLoading={isLoading}
        filterOption={filterOption}
        isMulti={isMulti}
        isDisabled={disabled}
        classes={classes}
        className={classNames(className, {
          [classes.root]: true
        })}
        classNamePrefix="react-select"
        styles={styleOverrides}
        /* 
          textFieldProps isn't native to react-select 
          but we're using the MUI select element so any props that
          can be passed to the MUI TextField element can be passed here
         */
        textFieldProps={{
          ...textFieldProps,
          label,
          errorText,
          disabled,
          InputLabelProps: {
            shrink: true
          },
          className: classNames({
            [classes.medium]: medium,
            [classes.small]: small,
            [classes.noMarginTop]: noMarginTop,
            [classes.inline]: inline,
            [classes.hideLabel]: hideLabel
          })
        }}
        /** let us explicitly pass an empty string */
        value={value || undefined}
        onBlur={onBlur}
        options={options}
        components={combinedComponents}
        onChange={onChange}
        onInputChange={onInputChange}
        onCreateOption={createNew}
        placeholder={placeholder || 'Select a value...'}
        noOptionsMessage={this.props.noOptionsMessage || (() => 'No results')}
        menuPlacement={this.props.menuPlacement || 'auto'}
        onMenuClose={onMenuClose}
      />
    );
  }
}

const styled = withStyles(styles);

export default styled(Select);
