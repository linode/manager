import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Grid from 'src/components/Grid';
import TabbedPanel from './TabbedPanel';

storiesOf('TabbedPanel', module).add('default', () => {
  return (
    <Grid
      container
      justify="center"
      style={{ backgroundColor: '#F4F4F4', height: '100%' }}
    >
      <Grid item xs={10}>
        <TabbedPanel
          someOtherProp={'This is some other prop'}
          header="Tabbed Panel"
          copy="This is an example of a tabbed panel."
          tabs={[
            {
              title: 'Tab One',
              render: (renderProps: { someOtherProp: number }) => (
                <div>Panel 1 {renderProps.someOtherProp}</div>
              )
            },
            {
              title: 'Tab Two',
              render: (renderProps: any) => <div>Panel 2</div>
            },
            {
              title: 'Tab Three',
              render: (renderProps: any) => <div>Panel 3</div>
            },
            {
              title: 'Tab Four',
              render: (renderProps: any) => <div>Panel 4</div>
            },
            {
              title: 'Tab Five',
              render: (renderProps: any) => <div>Panel 5</div>
            }
          ]}
        />
      </Grid>
    </Grid>
  );
});
