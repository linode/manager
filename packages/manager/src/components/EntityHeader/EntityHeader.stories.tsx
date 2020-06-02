import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ActionMenu from 'src/components/ActionMenu';
import Chip from 'src/components/core/Chip';
import Grid from 'src/components/Grid';
import LandingHeader from 'src/components/LandingHeader';
import EntityHeader from './EntityHeader';

storiesOf('EntityHeader', module)
  .add('landing', () => (
    <div style={{ padding: '12px' }}>
      <LandingHeader
        title="Linode"
        onAddNew={() => null}
        iconType="linode"
        docsLink="https://linode.com/docs"
      >
        <Grid item>
          <Chip
            style={{
              backgroundColor: '#00b159',
              color: 'white',
              fontSize: '1.1 rem',
              padding: '10px'
            }}
            label={'2447 RUNNING'}
            component="span"
            clickable={false}
          />
          <Chip
            style={{
              backgroundColor: '#ffb31a',
              fontSize: '1.1 rem',
              color: 'white',
              padding: '10px'
            }}
            label={'46 PENDING'}
            component="span"
            clickable={false}
          />
          <Chip
            style={{
              backgroundColor: '#9ea4ae',
              color: 'white',
              fontSize: '1.1 rem',
              padding: '10px'
            }}
            label={'7 OFFLINE'}
            component="span"
            clickable={false}
          />
        </Grid>
      </LandingHeader>
    </div>
  ))
  .add('detail', () => (
    <div style={{ padding: '12px' }}>
      <EntityHeader
        title="My-linode-12345"
        parentLink="/linodes"
        parentText="Linodes"
        iconType="linode"
        actions={
          <ActionMenu ariaLabel="linode-detail" createActions={() => []} />
        }
      >
        <Chip
          style={{
            backgroundColor: '#00b159',
            color: 'white',
            fontSize: '1.1 rem',
            padding: '10px'
          }}
          label={'RUNNING'}
          component="span"
          clickable={false}
        />{' '}
      </EntityHeader>
    </div>
  ));
