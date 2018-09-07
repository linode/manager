import { merge } from 'ramda';
import * as React from 'react';
import SSelect from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
// import { Props as reactSelectProps } from 'react-select/lib/Select';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import MultiValue from './MultiValue';
import NoOptionsMessage from './NoOptionsMessage';
import Control from './SelectControl';
import Menu from './SelectMenu';
import Placeholder from './SelectPlaceholder';


type ClassNames = 'root'
| 'input'
| 'noOptionsMessage'
| 'paper'
| 'divider'

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    height: 250,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

export interface Item {
  value: string | number;
  label: string;
  data?: any;
}

export interface SelectState {
  data: any,
  isDisabled: boolean,
  isFocused: boolean;
  isSelected: boolean;
}

export interface EnhancedSelectProps {
  options: Item[];
  className?: string;
  components?: any;
  disabled?: boolean;
  isMulti?: boolean;
  isCreatable?: boolean;
  value?: Item | Item[] | null;
  label?: string;
  placeholder?: string;
  errorText?: string;
  onChange: (selected:Item | Item[]) => void;
  createNew?: (inputValue:string) => void;
  onInputChange?: (inputValue:string) => void;
}

const styleOverrides = {
  option: (base:any, { data, isDisabled, isFocused, isSelected }:SelectState) => {
    return {
      ...base,
      backgroundColor: isDisabled
        ? null
        : isSelected ? data.color : isFocused ? 'blue' : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
          ? 'blue'
          : 'green',
      cursor: isDisabled ? 'not-allowed' : 'default',
    };
  },
}

const _components = {
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValue,
  Menu,
};

type CombinedProps = EnhancedSelectProps & WithStyles<ClassNames>;

class Select extends React.PureComponent<CombinedProps,{}> {
  render() {
    const {
      classes,
      className,
      components,
      createNew,
      disabled,
      errorText,
      label,
      isCreatable,
      isMulti,
      placeholder,
      onChange,
      onInputChange,
      options,
      value
    } = this.props;

    const combinedComponents = merge(_components, components);

    const BaseSelect = isCreatable ? CreatableSelect : SSelect;

    return (
      <BaseSelect
        isClearable
        isSearchable
        isMulti={isMulti}
        classes={classes}
        className={className}
        textFieldProps={{
          label,
          errorText,
          disabled,
          InputLabelProps: {
            shrink: true,
          },
        }}
        value={value}
        options={options}
        components={combinedComponents}
        onChange={onChange}
        onInputChange={onInputChange}
        onCreateOption={createNew}
        placeholder={placeholder || 'Select a value...'}
        styles={styleOverrides}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Select);

