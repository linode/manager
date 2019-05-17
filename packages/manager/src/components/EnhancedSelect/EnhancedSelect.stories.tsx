import { storiesOf } from '@storybook/react';
import * as React from 'react';
import timezones from 'src/assets/timezones/timezones';
import Select, { Item } from './Select';

const tz = timezones.map((timezone: any) => {
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
  }
];

interface State {
  open: boolean;
  valueCreatable: Item[];
  valueMulti: Item[];
  valueSingle: Item | null;
  valueAsync: Item | null;
  valueError: Item | null;
  valueLoading: Item | null;
}

class Example extends React.Component<{}, State> {
  state: State = {
    open: false,
    valueCreatable: [],
    valueError: null,
    valueMulti: [],
    valueSingle: null,
    valueAsync: null,
    valueLoading: null
  };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  };

  handleChangeSingle = (valueSingle: Item) => {
    this.setState({
      valueSingle
    });
  };

  handleChangeCreatable = (valueCreatable: Item[]) => {
    this.setState({
      valueCreatable
    });
  };

  handleChangeMulti = (valueMulti: Item[]) => {
    this.setState({
      valueMulti
    });
  };

  handleChangeAsync = (valueAsync: Item) => {
    this.setState({
      valueAsync
    });
  };

  handleChangeError = (valueError: Item) => {
    this.setState({
      valueError
    });
  };

  handleChangeLoading = (valueLoading: Item) => {
    this.setState({
      valueLoading
    });
  };

  filterFruit = (value: string) => {
    return fruit.filter(f =>
      f.label.toLowerCase().includes(value.toLowerCase())
    );
  };

  loadOptions = (inputValue?: string): Promise<Item[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.filterFruit(inputValue || '')), 2000);
    });
  };

  createNew = (inputValue: string) => {
    const { valueCreatable } = this.state;
    const newItem = { value: inputValue, label: inputValue };
    tz.push(newItem);
    valueCreatable.push(newItem);
    this.setState({ valueCreatable });
  };

  render() {
    const {
      valueAsync,
      valueCreatable,
      valueMulti,
      valueSingle,
      valueError,
      valueLoading
    } = this.state;

    return (
      <React.Fragment>
        <Select
          label="Basic Select"
          value={valueSingle}
          placeholder="Choose one fruit"
          onChange={this.handleChangeSingle}
          options={fruit}
          guidance={'some text'}
        />
        <Select
          label="Always Loading"
          isLoading
          value={valueLoading}
          placeholder="Please wait while we load the fruit."
          onChange={this.handleChangeLoading}
          options={fruit}
        />
        <Select
          label="Basic Select with Error"
          errorText="You didn't choose the correct fruit."
          value={valueError}
          placeholder="Choose one fruit"
          onChange={this.handleChangeError}
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
          loadOptions={this.loadOptions}
          label="Small Select"
          value={valueAsync}
          onChange={this.handleChangeAsync}
          small
        />
      </React.Fragment>
    );
  }
}

storiesOf('Enhanced Select', module).add('Example', () => <Example />);
