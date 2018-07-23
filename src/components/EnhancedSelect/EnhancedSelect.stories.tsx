import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EnhancedSelect from './EnhancedSelect';

const data = [
  {
    value: 'newyork',
    label: 'New York'
  },
  {
    value: 'beijing',
    label: 'China Standard Time'
  },
  {
    value: 'LA',
    label: 'Los Angeles'
  }
]

class Example extends React.Component {
  state = { open: false };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  handleSelect = (selected:any) => {
    console.log(`${selected} has been selected`);
  }

  render() {
    return (
      <React.Fragment>
        <EnhancedSelect 
          options={data}
          value={data[0].value}
          handleSelect={this.handleSelect}
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
