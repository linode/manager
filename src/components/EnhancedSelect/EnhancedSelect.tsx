import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { compose } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

import './EnhancedSelect.css';

type ClassNames = 'root'
  | 'searchSuggestions';

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
    borderRadius: 0,
    border: '1px solid #999',
    maxHeight: 192,
    overflowY: 'auto',
    width: '100%',
    maxWidth: 415,
    zIndex: 2,
    marginTop: -2,
  },
})

interface Props {
  options: Item[];
  value: string;
  handleSelect: (selected:any) => void;
  onSubmit?: () => void;
  errorText?: string;
  label?: string;
  placeholder?: string;
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

  getIndex = (item:Item) => {
    return this.props.options.findIndex((element) => {
      return element === item;
    });
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
      selectedItem,
    } = downshift;

    const { classes, errorText, label, placeholder } = this.props;
    const selectedIndex = this.getIndex(selectedItem);
    const placeholderText = placeholder ? placeholder : "Enter a value"

    return (
      <div className={classes.root}>
        <TextField
          {...getInputProps({
            placeholder: placeholderText,
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
            {this.getSearchSuggestions(inputValue).map((suggestion:Item, index:number) => {
              return this.renderSuggestion(
                suggestion,
                index,
                highlightedIndex,
                selectedIndex,
                getItemProps({ item: suggestion }),
              );
            })}
          </Paper>
        }
      </div>
    )
  }

  renderSuggestion = (
    item:Item,
    index:number,
    highlightedIndex:number | null,
    selectedIndex: number | null,
    itemProps:any,
  ) => {
    const isHighlighted = highlightedIndex === index;
    const isSelected = selectedIndex === index;
    let classes = "enhancedSelect-menu-item"
    if ( isHighlighted ) { classes += " enhancedSelect-menu-item-highlighted"; }
    if ( isSelected )    { classes += " enhancedSelect-menu-item-selected"; }

    return (
      <div className={classes}
        key={index} 
        {...itemProps} 
      >
        {item.label}
      </div>
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