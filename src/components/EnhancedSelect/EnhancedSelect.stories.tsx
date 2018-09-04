import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import CreatableSelect, { Item } from './CreatableSelect';
import Select from './Select';

import timezones from 'src/assets/timezones/timezones';

const tz = timezones.map((tz:any) => {
  return { value: tz.name, label: tz.label };
});

const fruit = [
  {
    label: 'Apple',
    value: 'apple'
  },
  {
    label: 'Pear',
    value: 'pear'
  },
  {
    label: 'Mango',
    value: 'mango'
  },
  {
    label: 'Durian',
    value: 'durian'
  },
  {
    label: 'Strawberry',
    value: 'strawberry'
  },
]

interface State {
  open: boolean;
  valueCreatable: Item[];
  valueMulti: Item[];
  valueSingle: Item | null;
}

interface Props {}

class Example extends React.Component<Props,State> {
  state:State = { 
    open: false,
    valueCreatable: [],
    valueMulti: [],
    valueSingle: null,
  };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  handleChangeSingle = (valueSingle:Item) => {
    this.setState({ 
      valueSingle,
    })
  }

  handleChangeCreatable = (valueCreatable:Item[]) => {
    this.setState({
      valueCreatable,
    });
  };

  handleChangeMulti = (valueMulti:Item[]) => {
    this.setState({
      valueMulti,
    })
  }

  createNew = (inputValue:string) => {
    const { valueCreatable } = this.state;
    const newItem = {value:inputValue, label:inputValue};
    tz.push(newItem);
    valueCreatable.push(newItem);
    this.setState({ valueCreatable });
  }

  render() {
    const { valueCreatable, valueMulti, valueSingle } = this.state;
    return (
      <React.Fragment>
        <Select
          label="Basic Select"
          value={valueSingle}
          placeholder="Choose one fruit"
          onChange={this.handleChangeSingle}
          options={fruit}
        />
        <Select
          label="Basic Select with Error"
          errorText="You didn't choose the correct fruit."
          value={valueSingle}
          placeholder="Choose one fruit"
          onChange={this.handleChangeSingle}
          options={fruit}
        />
        <Select
          label="Multi Select"
          isMulti={true}
          value={valueMulti}
          placeholder="Choose some fruit"
          onChange={this.handleChangeMulti}
          options={fruit}
        />
        <CreatableSelect
          label="Creatable Select"
          value={valueCreatable}
          placeholder="Choose some timezones"
          onChange={this.handleChangeCreatable}
          options={tz}
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
