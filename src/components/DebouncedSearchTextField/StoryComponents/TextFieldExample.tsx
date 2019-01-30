import * as React from 'react';

import { action } from '@storybook/addon-actions';

import DebouncedSearchTextField from '../DebouncedSearchTextField';

interface Props {
  list: string[];
}

interface State {
  list: string[];
  isSearching: boolean;
}

class Example extends React.Component<Props, State> {
  state: State = {
    list: this.props.list,
    isSearching: false
  };

  handleSearch = (value: string) => {
    this.setState({ isSearching: true });
    action('searching')(value);
    setTimeout(() => {
      const filteredList = this.props.list.filter(eachVal =>
        eachVal.includes(value.toLowerCase())
      );
      action('result')(filteredList);
      this.setState({
        list: filteredList,
        isSearching: false
      });
    }, 800);
  };

  render() {
    return (
      <React.Fragment>
        <DebouncedSearchTextField
          placeholderText="Search for something"
          onSearch={this.handleSearch}
          isSearching={this.state.isSearching}
        />
        <ul>
          {this.state.list.map((eachThing: string) => {
            return (
              <li key={eachThing} data-qa-list-item>
                {eachThing}
              </li>
            );
          })}
        </ul>
      </React.Fragment>
    );
  }
}

export default Example;
