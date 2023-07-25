import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { DebouncedSearchTextField } from '../DebouncedSearchTextField';

interface Props {
  list: string[];
}

interface State {
  isSearching: boolean;
  list: string[];
}

class Example extends React.Component<Props, State> {
  render() {
    return (
      <React.Fragment>
        <DebouncedSearchTextField
          debounceTime={400}
          hideLabel
          isSearching={this.state.isSearching}
          label="Search for something"
          onSearch={this.handleSearch}
          placeholder="Search for something"
        />
        <ul data-qa-listOfItems>
          {this.state.list.map((eachThing: string) => {
            return (
              <li data-qa-list-item key={eachThing}>
                {eachThing}
              </li>
            );
          })}
        </ul>
      </React.Fragment>
    );
  }

  handleSearch = (value: string) => {
    this.setState({ isSearching: true });
    const { list } = this.state;
    action('searching')(value);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!value.trim()) {
          return resolve(this.props.list);
        }
        const filteredList = list.filter((eachVal) =>
          eachVal.includes(value.toLowerCase())
        );
        return resolve(filteredList);
      }, 800);
    }).then((res: string[]) => {
      action('result')(res);
      this.setState({
        isSearching: false,
        list: res,
      });
    });
  };

  state: State = {
    isSearching: false,
    list: this.props.list,
  };
}

export default Example;
