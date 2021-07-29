import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import EnhancedNumberInput from './EnhancedNumberInput';

export default {
  title: 'UI Elements/Enhanced Number Input',
};

export const Default = () => {
  const [value, setValue] = React.useState<number>(0);

  return (
    <Grid container style={{ padding: '2em' }}>
      <EnhancedNumberInput value={value} setValue={setValue} />
    </Grid>
  );
};

export const SmallVariant = () => {
  const [value, setValue] = React.useState<number>(0);

  return (
    <Grid container style={{ padding: '2em' }}>
      <EnhancedNumberInput value={value} setValue={setValue} small />
    </Grid>
  );
};

export const Disabled = () => {
  const [value, setValue] = React.useState<number>(0);

  return (
    <Grid container style={{ padding: '2em' }}>
      <EnhancedNumberInput value={value} setValue={setValue} disabled />
    </Grid>
  );
};

export const MaxMin = () => {
  const [value, setValue] = React.useState<number>(0);

  return (
    <Grid container style={{ padding: '2em' }}>
      <Grid item xs={12} style={{ marginBottom: 24 }}>
        <Typography variant="h2" style={{ marginBottom: 12 }}>
          Defaults (0, 100)
        </Typography>
        <EnhancedNumberInput value={value} setValue={setValue} />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h2" style={{ marginBottom: 12 }}>
          Custom (1, 5)
        </Typography>
        <EnhancedNumberInput
          value={value}
          setValue={setValue}
          min={1}
          max={5}
        />
      </Grid>
    </Grid>
  );
};

MaxMin.story = {
  name: 'Max/Min',
};
