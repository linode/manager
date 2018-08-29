import * as React from 'react';
import Select from 'react-select';

import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import TextField from 'src/components/TextField';

interface Item {
  value: string;
  label: string;
  data?: any;
}

type ClassNames = 'root'
  | 'input'
  | 'valueContainer'
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
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
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

const NoOptionsMessage = (props:any) => {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

const inputComponent = ({ inputRef, ...props }) => {
  return <div ref={inputRef} {...props} />;
}

const Control = (props:any) => {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

const Option = (props:any) => {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

const Placeholder = (props:any) => {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

const ValueContainer = (props:any) => {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

const MultiValue = (props:any) => {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={props.selectProps.classes.chip}
      onDelete={event => {
        props.removeProps.onClick();
        props.removeProps.onMouseDown(event);
      }}
    />
  );
}

const Menu = (props:any) => {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Option,
  Control,
  NoOptionsMessage,
  Placeholder,
  MultiValue,
  ValueContainer,
  Menu,
};

interface Props {
  options: Item[];
  label: string;
  placeholder?: string;
  errorText: string;
  getNext?: (currentIndex:number, nextAmount:number) => void;
  resultLimit?: number;
}

interface State {
  value: Item | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class IntegrationReactSelect extends React.Component<CombinedProps,State> {
  state = {
    value: null,
  };

  handleChange = (value:Item) => {
    this.setState({
      value,
    });
  };

  render() {
    const { classes, errorText, label, placeholder, options, } = this.props;

    return (
      <div className={classes.root}>
          <Select
            classes={classes}
            textFieldProps={{
              label,
              errorText,
              InputLabelProps: {
                shrink: true,
              },
            }}
            options={options}
            components={components}
            value={this.state.value}
            onChange={this.handleChange}
            isClearable
            isSearchable
            placeholder={placeholder || 'Select a value...'}
            isMulti
          />
      </div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(IntegrationReactSelect);

