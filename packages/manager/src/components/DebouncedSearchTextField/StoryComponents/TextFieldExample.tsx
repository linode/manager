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
    const { list } = this.state;
    action('searching')(value);
    return new Promise(resolve => {
      setTimeout(() => {
        if (!value.trim()) {
          return resolve(this.props.list);
        }
        const filteredList = list.filter(eachVal =>
          eachVal.includes(value.toLowerCase())
        );
        return resolve(filteredList);
      }, 800);
    }).then((res: string[]) => {
      action('result')(res);
      this.setState({
        list: res,
        isSearching: false
      });
    });
  };

  render() {
    return (
      <React.Fragment>
        <DebouncedSearchTextField
          placeholder="Search for something"
          debounceTime={400}
          onSearch={this.handleSearch}
          isSearching={this.state.isSearching}
          label="Search for something"
          hideLabel
        />
        <ul data-qa-listOfItems>
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
