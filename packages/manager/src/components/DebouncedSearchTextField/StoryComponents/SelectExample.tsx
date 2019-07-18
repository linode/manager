import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { action } from '@storybook/addon-actions';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';

interface Props {
  list: string[];
}

interface State {
  list: Item[];
  isSearching: boolean;
  selectedItem: string;
}

class Example extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      list: [],
      isSearching: false,
      selectedItem: ''
    };
  }

  handleSearch = (value: string, actionMeta: { action: string }) => {
    /* Don't want to make a request unless we're typing something */
    if (actionMeta.action !== 'input-change') {
      return;
    }
    this.setState({ isSearching: true });
    action('searching')(value);
    setTimeout(() => {
      const filteredList = this.props.list
        .filter(eachVal => eachVal.includes(value.toLowerCase()))
        .map(eachItem => {
          return {
            value: eachItem,
            label: eachItem
          };
        });

      action('result')(filteredList);

      this.setState({
        list: filteredList,
        isSearching: false
      });
    }, 800);
  };

  handleChooseOption = (value: Item) => {
    if (value) {
      return this.setState({ selectedItem: value.label });
    }
  };

  debouncedSearch = debounce(400, false, this.handleSearch);

  render() {
    return (
      <React.Fragment>
        <EnhancedSelect
          label="Search Bar"
          placeholder='Search for something (i.e "er")'
          isLoading={this.state.isSearching}
          options={this.state.list}
          onChange={this.handleChooseOption}
          onInputChange={this.handleSearch}
          data-qa-select-linode
        />
        <p>
          <i>
            Note: The field is intentionally not pre-populated with data to
            better demonstrate the async functionality
          </i>
        </p>
        <p>
          <i>
            This component utilizes React-Select which has the added
            functionality of filtering as you type and is not debounced
          </i>
        </p>
        <div
          style={{ marginTop: '2em' }}
          data-qa-selected-result={this.state.selectedItem}
        >
          You selected: {this.state.selectedItem}
        </div>
      </React.Fragment>
    );
  }
}

export default Example;
