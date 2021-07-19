import * as React from 'react';
import Grid from 'src/components/Grid';
import TabbedPanel from './TabbedPanel';

export default {
  title: 'UI Elements/TabbedPanel',
};

export const Default = () => {
  return (
    <Grid
      container
      justify="center"
      style={{ backgroundColor: '#F4F4F4', height: '100%' }}
    >
      <Grid item xs={10}>
        <TabbedPanel
          header="Tabbed Panel"
          copy="This is an example of a tabbed panel."
          tabs={[
            {
              title: 'Tab One',
              render: (renderProps: any) => <div>Panel 1</div>,
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
        />
      </Grid>
    </Grid>
  );
};

Default.story = {
  name: 'default',
};
