import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { compose } from 'ramda';
import * as React from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root'
  | 'searchSuggestions'
  | 'selected'
  | 'suggestion';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    position: 'relative',
  },
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    padding: 0,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    maxHeight: 150,
    overflowY: 'auto',
    width: '100%',
    maxWidth: 415,
    zIndex: 2,
  },
  suggestion: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover, &:focus, &.selected': {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: `${theme.color.white} !important`,
    },
    '&:last-item': {
      border: 0,
    },
  },
})

interface Props {
  options: Item[];
  value: string;
  handleSelect: (selected:any) => void;
  onSubmit?: () => void;
  errorText?: string;
  label?: string;
}

interface State {}

export interface Item {
  value: string;
  label: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EnhancedSelect extends React.Component<CombinedProps, State> {
  optionsIdx: any = {};

  componentDidMount() {
    this.props.options.forEach((tz:Item) => {
      this.optionsIdx[tz.value] = tz;
    })
  }

  itemToString = (item:Item) => {
    return (item && item.label) ? item.label : '';
  }

  getSearchSuggestions = (inputText:string) => {
    const { options } = this.props;
    const text = inputText.toLowerCase();
    return options.filter((item:Item) => {
      return item.label.toLowerCase().includes(text);
    })
  }

  onSubmit = () => {
    const { onSubmit } = this.props;
    if (onSubmit) { onSubmit() }
  }

  stateReducer = (state:DownshiftState, change:StateChangeOptions ) => {
    return change;
  }

  renderDownshift = (downshift:any) => {
    const {
      clearSelection,
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      highlightedIndex,
      openMenu,
    } = downshift;

    const { classes, errorText, label } = this.props;

    return (
      <div className={classes.root}>
        <TextField
          {...getInputProps({
            placeholder: "Enter a value",
            errorText,
            label,
            onKeyPress: (e:React.KeyboardEvent<KeyboardEvent>) => {
              if (e.key === 'Enter') {
                this.onSubmit();
                e.preventDefault();
              }
            },
            onFocus: (e:React.ChangeEvent<HTMLInputElement>) => {
              clearSelection();
              openMenu();
            }
          })}
        />
        {isOpen &&
          <Paper className={classes.searchSuggestions}>
            <MenuList>
              {this.getSearchSuggestions(inputValue).map((suggestion:Item, index:number) => {
                return this.renderSuggestion(
                  suggestion,
                  index,
                  highlightedIndex,
                  getItemProps({ item: suggestion }),
                );
              })}
            </MenuList>
          </Paper>
        }
      </div>
    )
  }

  renderSuggestion = (
    item:Item,
    index:number,
    highlightedIndex:number | null,
    itemProps:any,
  ) => {
    const { classes } = this.props;
    const isHighlighted = highlightedIndex === index;

    return (
      <MenuItem 
        key={index} 
        className={isHighlighted ? `${classes.suggestion} ${'selected'}` : classes.suggestion} 
        {...itemProps} 
      >
        {item.label}
      </MenuItem>
    )
  }
  
  render() {
    const { value, handleSelect } = this.props;
    return (
      <Downshift
        selectedItem={this.optionsIdx[value]}
        onSelect={handleSelect}
        itemToString={this.itemToString}
        render={this.renderDownshift}
        stateReducer={this.stateReducer}
      />
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard)(EnhancedSelect);