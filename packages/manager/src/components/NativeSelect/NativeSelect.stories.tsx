import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from 'src/components/Grid';
import NativeSelect from './NativeSelect';

interface State {
  value: number;
  error: boolean;
}

interface Props {
  label: string;
  disabled?: boolean;
  small?: boolean;
}

class Example extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: 0,
      error: false,
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fieldValue = Number(e.target.value);
    this.setState({
      value: fieldValue,
      error: fieldValue === 4,
    });
  };

  render() {
    const { label, disabled, small } = this.props;
    const { error, value } = this.state;

    const options = [
      { label: 'Select a band' },
      { label: 'U2' },
      { label: 'Nickelback' },
      { label: 'Limp Bizkit' },
      { label: "They're all crappy" },
    ];

    return (
      <>
        <NativeSelect
          label={label}
          value={value}
          onChange={this.handleChange}
          disabled={disabled}
          small={small}
          error={error}
          options={options}
        />
        {error && (
          <FormHelperText error={this.state.error}>
            That's true, but you still gotta choose one.
          </FormHelperText>
        )}
      </>
    );
  }
}

export default {
  title: 'Native Select',
};

export const _Example = () => (
  <Grid container style={{ padding: 16 }}>
    <Grid item xs={12}>
      <h2>What is the worst band in recent history?</h2>
    </Grid>
    <Grid item xs={12}>
      <Example label="Select Example" />
      <Example label="Disabled Select" disabled />
      <Example label="Small Select" small />
    </Grid>
  </Grid>
);
