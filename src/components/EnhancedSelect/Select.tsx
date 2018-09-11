import { merge } from 'ramda';
import * as React from 'react';
import SSelect from 'react-select';
import CreatableSelect, { Props as CCreatableProps } from 'react-select/lib/Creatable';
import { Props as SProps } from 'react-select/lib/Select';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import MultiValue from './components/MultiValue';
import NoOptionsMessage from './components/NoOptionsMessage';
import Control from './components/SelectControl';
import Placeholder from './components/SelectPlaceholder';

type ClassNames = 'root'
| 'input'
| 'noOptionsMessage'
| 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxWidth: 415,
    '& .react-select__value-container': {
      width: '100%',
      '& > div': {
        width: '100%',
      },
    },
    '& .react-select__input': {
      width: '100%',
      '& input': {
        width: '100% !important',
      },
    },
    '& .react-select__menu': {
      margin: 0,
      borderRadius: 0,
      boxShadow: 'none',
      border: '1px solid #999',
      borderTop: 0,
    },
    '& .react-select__menu-list': {
      padding: theme.spacing.unit / 2,
    },
    '& .react-select__option': {
      transition: theme.transitions.create(['background-color', 'color']),
      color: theme.palette.text.primary,
      backgroundColor: theme.bg.white,
      cursor: 'pointer',
      padding: '10px 8px',
    },
    '& .react-select__option--is-focused': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    '& .react-select__option--is-selected': {
      color: theme.palette.primary.main,
      '&.react-select__option--is-focused': {
        backgroundColor: theme.bg.white,
      },
    },
    '& .react-select__single-value': {
      color: theme.palette.text.primary,
    },
    '& .react-select__indicator-separator': {
      display: 'none',
    },
    '& .react-select__dropdown-indicator': {
      '& svg': {
        color: '#999',
      },
    },
  },
  input: {
    fontSize: '1rem',
    padding: 0,
    display: 'flex',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
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
          ? 'black'
          : 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',
    };
  },
}

const _components = {
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValue,
};

type CombinedProps = EnhancedSelectProps & WithStyles<ClassNames>;

interface BaseSelectProps extends SProps<any> {
  classes: any;
  textFieldProps: any;
}

interface CreatableProps extends CCreatableProps<any> {

}

interface State {
  internalError: string;
}

class Select extends React.PureComponent<CombinedProps,State> {
  state: State = {
    internalError: ''
  }

  handleInputChange = (inputValue:string) => {
    if (inputValue.length > 25) {
      this.setState({ internalError: 'Input must be less than 25 characters'});
      return inputValue.slice(0,25);
    } else {
      this.setState({ internalError: '' });
    return inputValue;
    }
  }

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

    const { internalError } = this.state;

    const combinedComponents = merge(_components, components);

    const BaseSelect: React.ComponentClass<BaseSelectProps|CreatableProps> = isCreatable ? CreatableSelect : SSelect;

    return (
      <BaseSelect
        isClearable
        isSearchable
        isMulti={isMulti}
        classes={classes}
        className={`${classes.root} ${className}`}
        classNamePrefix="react-select"
        textFieldProps={{
          label,
          errorText: internalError || errorText,
          disabled,
          InputLabelProps: {
            shrink: true,
          },
        }}
        value={value}
        options={options}
        components={combinedComponents}
        onChange={onChange}
        onInputChange={onInputChange || this.handleInputChange}
        onCreateOption={createNew}
        placeholder={placeholder || 'Select a value...'}
        styles={styleOverrides}
        menuPlacement="auto"
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Select);

