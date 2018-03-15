import * as React from 'react';
import { storiesOf } from '@storybook/react';

import TabbedPanel from './TabbedPanel';

storiesOf('TabbedPanel', module)
  .add('default', () => {

    return (
    <TabbedPanel
      someOtherProp={42}
      header="Tabbed Panel"
      copy="This is an example of a tabbed panel."
      tabs={[
        {
          title: 'One',
          render: (renderProps: { someOtherProp: number }) =>
            <div>Panel 1 {renderProps.someOtherProp}</div>,
        },
        {
          title: 'Two',
          render: (renderProps: any) => <div>Panel 2</div>,
        },
        {
          title: 'Three',
          render: (renderProps: any) => <div>Panel 3</div>,
        },
      ]}
    />);
  });
