import * as React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import MultiValue from './MultiValue';
import NoOptionsMessage from './NoOptionsMessage';
import Control from './SelectControl';
import Menu from './SelectMenu';
import Placeholder from './SelectPlaceholder';

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
  label: string;
  placeholder?: string;
  errorText?: string;
  handleChange: (selected:Item[]) => void;
  createNew?: (inputValue:string) => void;
}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class IntegrationReactSelect extends React.Component<CombinedProps,State> {
  state = {
    value: null,
  };

  render() {
    const { classes, createNew, errorText, handleChange, label, placeholder, options, value } = this.props;

    return (
      <div className={classes.root}>
        <CreatableSelect
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
          onChange={handleChange}
          onCreateOption={createNew}
          placeholder={placeholder || 'Select a value...'}
        />
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(IntegrationReactSelect);

