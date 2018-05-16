import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

import TabbedPanel from './TabbedPanel';
import ThemeDecorator from '../../utilities/storybookDecorators';
import Grid from 'src/components/Grid';

storiesOf('TabbedPanel', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(checkA11y)
  .add('default', () => {

    return (
      <Grid container justify="center" style={{ backgroundColor: '#F4F4F4', height: '100%' }}>
        <Grid item xs={10}>
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
          />
        </Grid>
      </Grid>
    );
  });
