import { storiesOf } from '@storybook/react';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Select from './Select';

interface State {
  selected: number;
  error: boolean;
  success: boolean;
}

class Example extends React.Component<any, State> {
  state = {
    selected: this.props.selected || '',
    error: Boolean(this.props.error),
    success: Boolean(this.props.success)
  };

  handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    this.setState({
      selected: value,
      error: value === 9000,
      success: value > 9000
    });
  };

  render() {
    const { selected } = this.state;

    return (
      <div style={{ marginLeft: '50px', marginTop: '20px' }}>
        <FormControl fullWidth>
          <InputLabel
            htmlFor="awesomeness"
            disableAnimation
            shrink={true}
            error={this.state.error}
          >
            Awesomeness
          </InputLabel>
          <Select
            value={selected}
            onChange={this.handleChange}
            inputProps={{ name: 'awesomeness', id: 'awesomeness' }}
            error={this.state.error}
            success={this.state.success}
            {...this.props}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={1000}>Meh</MenuItem>
            <MenuItem value={2500}>Mediocre</MenuItem>
            <MenuItem value={9000}>9000</MenuItem>
            <MenuItem value={9001}>It's over 9000!</MenuItem>
          </Select>
          <FormHelperText error={this.state.error}>
            Here's some action text!
          </FormHelperText>
        </FormControl>
      </div>
    );
  }
}

storiesOf('Select', module).add('Example', () => (
  <Grid container style={{ padding: 16 }}>
    <Grid item xs={12}>
      <Example />
      <Example selected={1000} disabled />
      <Example small />
    </Grid>
  </Grid>
));
