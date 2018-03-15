import * as React from 'react';
import { storiesOf } from '@storybook/react';

import TabbedPanel from './TabbedPanel';
import ThemeDecorator from '../../utilities/storybookDecorators';

storiesOf('TabbedPanel', module)
  .addDecorator(ThemeDecorator)
  .add('default', () => {

    return (
    <TabbedPanel
      someOtherProp={42}
      header="Tabbed Panel"
      copy="This is an example of a tabbed panel."
      tabs={[
        {
          title: 'Tab One',
          render: (renderProps: { someOtherProp: number }) =>
            <div>Panel 1 {renderProps.someOtherProp}</div>,
        },
        {
          title: 'Tab Two',
          render: (renderProps: any) => <div>Panel 2</div>,
        },
        {
          title: 'Tab Three',
          render: (renderProps: any) => <div>Panel 3</div>,
        },
        {
          title: 'Tab Four',
          render: (renderProps: any) => <div>Panel 4</div>,
        },
        {
          title: 'Tab Five',
          render: (renderProps: any) => <div>Panel 5</div>,
        },
      ]}
    />);
  });
