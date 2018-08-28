import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EnhancedSelect from './EnhancedSelect2';

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

class Example extends React.Component {
  state = { open: false };

  toggleDrawer = (v: boolean) => (e: React.MouseEvent<any>) => {
    this.setState({ open: v });
  }

  handleSelect = (selected:any) => {
    /* tslint:disable-next-line */
    console.log(`${selected} has been selected`);
  }

  render() {
    return (
      <React.Fragment>
        <EnhancedSelect 
          options={data}
          errorText="this is an error"
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
