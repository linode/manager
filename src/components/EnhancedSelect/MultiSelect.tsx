import * as React from 'react';
import Select from 'react-select';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import MultiValue from 'src/components/EnhancedSelect/MultiValue';
import NoOptionsMessage from 'src/components/EnhancedSelect/NoOptionsMessage';
import Control from 'src/components/EnhancedSelect/SelectControl';
import Menu from 'src/components/EnhancedSelect/SelectMenu';
import Placeholder from 'src/components/EnhancedSelect/SelectPlaceholder';

export interface Item {
  value: string;
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

const components = {
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValue,
  Menu,
};

interface Props {
  options: Item[];
  value: Item[];
  label?: string;
  placeholder?: string;
  errorText?: string;
  onChange: (selected:Item[]) => void;
}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class MultiSelect extends React.PureComponent<CombinedProps,State> {
  render() {
    const { classes, errorText, label, placeholder, onChange, options, value } = this.props;
    return (
      <Select
        isClearable
        isSearchable
        isMulti
        classes={classes}
        textFieldProps={{
          label,
          errorText,
          InputLabelProps: {
            shrink: true,
          },
        }}
        value={value}
        options={options}
        components={components}
        onChange={onChange}
        placeholder={placeholder || 'Select a value...'}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(MultiSelect);

