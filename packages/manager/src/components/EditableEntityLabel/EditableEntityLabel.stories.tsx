import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Grid from 'src/components/Grid';
import EditableEntityLabel from './EditableEntityLabel';

storiesOf('EditableEntityLabel', module)
  .add('default', () => {
    const [text, setText] = React.useState<string>('sample text');
    const [loading, setLoading] = React.useState<boolean>(false);

    const onEdit = (s: string) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          resolve(setText(s));
        }, 3000);
      });
    };

    return (
      <Grid container style={{ padding: '2em' }}>
        <EditableEntityLabel
          text={text}
          iconVariant="linode"
          subText="Waiting for data..."
          onEdit={onEdit}
          loading={loading}
        />
      </Grid>
    );
  })
  .add('with error', () => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const onEdit = (s: string) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          reject('An error occurred!');
        }, 3000);
      });
    };

    return (
      <Grid container style={{ padding: '2em' }}>
        <EditableEntityLabel
          text={'demo text'}
          iconVariant="linode"
          subText="Waiting for data..."
          onEdit={onEdit}
          loading={loading}
        />
      </Grid>
    );
  });
