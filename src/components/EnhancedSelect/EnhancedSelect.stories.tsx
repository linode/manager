import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EnhancedSelect from './EnhancedSelect2';

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
  return { value: tz.value, label: tz.name };
});

class Example extends React.Component {
  state = { 
    open: false,
    options: data2.slice(0,15),
  };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  handleSelect = (selected:any) => {
    /* tslint:disable-next-line */
    console.log(`${selected} has been selected`);
  }

  getNext = (inputValue:string, page:number) => {
    const increment = 25;
    return data2.slice(0, increment * page + 1);
  }

  render() {
    return (
      <React.Fragment>
        <EnhancedSelect
          label="Example"
          placeholder="Choose a timezone"
          errorText="this is an error"
          options={data2}
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
