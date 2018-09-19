import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import Select, { Item } from './Select';

import timezones from 'src/assets/timezones/timezones';

const tz = timezones.map((timezone:any) => {
  return { value: timezone.name, label: timezone.label };
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
  valueAsync: Item | null;
}

class Example extends React.Component<{},State> {
  state:State = { 
    open: false,
    valueCreatable: [],
    valueMulti: [],
    valueSingle: null,
    valueAsync: null,
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

  handleChangeAsync = (valueAsync:Item) => {
    this.setState({
      valueAsync,
    })
  }

  filterFruit = (value:string) => {
    return fruit.filter((f) => f.label.toLowerCase().includes(value.toLowerCase()));
  }

  loadOptions = (inputValue:string) : Promise<Item[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.filterFruit(inputValue)), 2000);
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
    const { valueAsync, valueCreatable, valueMulti, valueSingle } = this.state;
    return (
      <React.Fragment>
        <Select
          label="Basic Select"
          isLoading
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
        <Select
          label="Creatable Select"
          variant="creatable"
          isMulti={true}
          value={valueCreatable}
          placeholder="Choose some timezones"
          onChange={this.handleChangeCreatable}
          options={tz}
          createNew={this.createNew}
        />
        <Select
          variant="async"
          loadOptions={this.loadOptions}
          label="Async Select"
          value={valueAsync}
          onChange={this.handleChangeAsync}
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
