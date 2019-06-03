import { WithStyles } from '@material-ui/core/styles';
import Search from '@material-ui/icons/Search';
import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import InputAdornment from 'src/components/core/InputAdornment';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import './EnhancedSelect.css';

type ClassNames = 'root' | 'searchSuggestions' | 'searchIcon';

const styles: StyleRulesCallback = theme => ({
  root: {
    position: 'relative',
    width: '100%'
  },
  searchIcon: {
    color: `${theme.color.grey1} !important`
  },
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    padding: 0,
    borderRadius: 0,
    border: '1px solid #999',
    overflowY: 'auto',
    maxWidth: '100%',
    zIndex: 2,
    marginTop: -2,
    '& .enhancedSelect-menu-item': {
      color: theme.palette.text.primary
    }
  }
});

interface Props {
  options: Item[];
  value: string;
  handleSelect: (selected: Item) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  placeholder?: string;
  inputValue: string;
  onInputValueChange: (input: string) => void;
  renderItems?: (
    items: Item,
    index: number,
    highlighted: boolean,
    inputProps: any,
    classes: string
  ) => React.ReactElement<any>[];
  noFilter?: boolean;
  search?: boolean;
  maxHeight?: number;
  className?: string;
}

export interface Item<T = string | number> {
  value: T;
  label: string;
  data?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EnhancedSelect extends React.Component<CombinedProps, {}> {
  optionsIdx: any = {};

  componentDidMount() {
    this.createItemIndex();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: {}) {
    if (this.props.options !== prevProps.options) {
      this.createItemIndex();
    }
  }

  createItemIndex = () => {
    this.props.options.forEach((item: Item) => {
      this.optionsIdx[item.value] = item;
    });
  };

  itemToString = (item: Item) => {
    return item && item.label ? item.label : '';
  };

  getIndex = (item: Item) => {
    return this.props.options.findIndex(element => {
      return element === item;
    });
  };

  getSearchSuggestions = (inputText: string) => {
    const { options, noFilter } = this.props;
    if (noFilter) {
      return options;
    }
    const text = inputText.toLowerCase();
    return options.filter((item: Item) => {
      return item.label ? item.label.toLowerCase().includes(text) : false;
    });
  };

  onSubmit = () => {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit();
    }
  };

  downshiftStateReducer = (
    state: DownshiftState,
    changes: StateChangeOptions
  ) => {
    const { value } = this.props;
    switch (changes.type) {
      // Don't clear the field value when we leave the field
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.mouseUp:
        return {
          ...changes,
          inputValue: pathOr('', ['label'], this.optionsIdx[value]),
          isOpen: false
        };
      default:
        return changes;
    }
  };

  renderDownshift = (downshift: any) => {
    const {
      clearSelection,
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      highlightedIndex,
      openMenu,
      selectHighlightedItem,
      selectedItem
    } = downshift;

    const {
      classes,
      className,
      maxHeight,
      disabled,
      errorText,
      helperText,
      label,
      placeholder,
      search
    } = this.props;
    const selectedIndex = this.getIndex(selectedItem);
    const placeholderText = placeholder ? placeholder : 'Enter a value';

    return (
      <div className={`${classes.root} ${className}`}>
        <TextField
          data-qa-enhanced-select-input
          InputProps={
            search && {
              startAdornment: (
                <InputAdornment position="end">
                  <Search className={classes.searchIcon} />
                </InputAdornment>
              )
            }
          }
          {...getInputProps({
            placeholder: placeholderText,
            errorText,
            disabled,
            helperText,
            label,
            onKeyDown: (e: React.KeyboardEvent<KeyboardEvent>) => {
              if (e.key === 'Enter') {
                if (highlightedIndex !== null) {
                  selectHighlightedItem();
                } else {
                  this.onSubmit();
                }
              }
            },
            onFocus: (e: React.ChangeEvent<HTMLInputElement>) => {
              clearSelection();
              openMenu();
            }
          })}
        />
        {isOpen && (
          <Paper
            className={classes.searchSuggestions}
            style={{ maxHeight: maxHeight || 192 }}
          >
            {this.getSearchSuggestions(inputValue).map(
              (suggestion: Item, index: number) => {
                return this.renderSuggestion(
                  suggestion,
                  index,
                  highlightedIndex,
                  selectedIndex,
                  getItemProps({ item: suggestion })
                );
              }
            )}
          </Paper>
        )}
      </div>
    );
  };

  renderSuggestion = (
    item: Item,
    index: number,
    highlightedIndex: number | null,
    selectedIndex: number | null,
    itemProps: any
  ) => {
    const isHighlighted = highlightedIndex === index;
    const isSelected = selectedIndex === index;
    let classes = 'enhancedSelect-menu-item';
    if (isHighlighted) {
      classes += ' enhancedSelect-menu-item-highlighted';
    }
    if (isSelected) {
      classes += ' enhancedSelect-menu-item-selected';
    }

    return this.props.renderItems ? (
      this.props.renderItems(item, index, isHighlighted, itemProps, classes)
    ) : (
      <div
        className={classes}
        key={index}
        {...itemProps}
        data-qa-select-menu-item={item.label}
      >
        {item.label}
      </div>
    );
  };

  render() {
    const { value, handleSelect, inputValue, onInputValueChange } = this.props;
    return (
      <Downshift
        selectedItem={this.optionsIdx[value]}
        onSelect={handleSelect}
        itemToString={this.itemToString}
        render={this.renderDownshift}
        inputValue={inputValue}
        onInputValueChange={onInputValueChange}
        stateReducer={this.downshiftStateReducer}
      />
    );
  }
}

const styled = withStyles(styles);

export default compose<any, any, any>(
  styled,
  RenderGuard
)(EnhancedSelect);
