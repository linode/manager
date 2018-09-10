import { merge } from 'ramda';
import * as React from 'react';
import SSelect from 'react-select';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import MultiValue from 'src/components/EnhancedSelect/MultiValue';
import NoOptionsMessage from 'src/components/EnhancedSelect/NoOptionsMessage';
import Control from 'src/components/EnhancedSelect/SelectControl';
import Menu from 'src/components/EnhancedSelect/SelectMenu';
import Placeholder from 'src/components/EnhancedSelect/SelectPlaceholder';

export interface Item {
  value: string | number;
  label: string;
  data?: any;
}

type ClassNames = 'root'
  | 'input'
  | 'chip'
  | 'chipFocused'
  | 'noOptionsMessage'
  | 'placeholder'
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
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: 'blue',
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
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

const _components = {
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValue,
  Menu,
};

export interface EnhancedSelectProps {
  options: Item[];
  className?: string;
  components?: any;
  disabled?: boolean;
  isMulti?: boolean;
  value?: Item | Item[] | null;
  label?: string;
  placeholder?: string;
  errorText?: string;
  onChange: (selected:Item | Item[]) => void;
  onInputChange?: (inputValue:string) => void;
}

interface State {}

type CombinedProps = EnhancedSelectProps & WithStyles<ClassNames>;

class Select extends React.PureComponent<CombinedProps,State> {
  render() {
    const {
      classes,
      className,
      components,
      disabled,
      errorText,
      label,
      isMulti,
      placeholder,
      onChange,
      onInputChange,
      options,
      value
    } = this.props;

    const combinedComponents = merge(_components, components);

    return (
      <SSelect
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
        placeholder={placeholder || 'Select a value...'}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Select);

