import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EnhancedSelect, { Item } from './EnhancedSelect2';

import timezones from 'src/assets/timezones/timezones';

const data = [
  {
    value: 'apple',
    label: 'Apple'
  },
  {
    value: 'pear',
    label: 'Pear'
  },
  {
    value: 'orange',
    label: 'Orange'
  }
]

const data2 = timezones.map((tz:any) => {
  return { value: tz.name, label: tz.label };
});

interface State {
  open: boolean;
  value: Item[];
}

interface Props {}

class Example extends React.Component<Props,State> {
  state:State = { 
    open: false,
    value: [],
  };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  handleChange = (value:Item[]) => {
    this.setState({
      value,
    });
  };

  createNew = (inputValue:string) => {
    const { value } = this.state;
    const newItem = {value:inputValue, label:inputValue};
    data2.push(newItem);
    value.push(newItem);
    this.setState({ value });
  }

  render() {
    return (
      <React.Fragment>
        <EnhancedSelect
          label="Example"
          value={this.state.value}
          placeholder="Choose a timezone"
          handleChange={this.handleChange}
          options={data2}
          createNew={this.createNew}
        />
      </React.Fragment>
    );
  }
}

storiesOf('Enhanced Select', module)
  .addDecorator(ThemeDecorator)
  .add('Example', () => (
    <Example />
  ));
