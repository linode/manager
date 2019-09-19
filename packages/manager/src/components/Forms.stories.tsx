import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CheckBox from './CheckBox';
import MenuItem from './MenuItem';
import Radio from './Radio';
import Select from './Select';
import TextField from './TextField';

import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import RadioGroup from 'src/components/core/RadioGroup';

const fields = [
  {
    label: 'Default'
  },
  {
    label: 'Email',
    type: 'email'
  },
  {
    label: 'Number',
    type: 'number'
  },
  {
    label: 'Telephone',
    type: 'tel'
  },
  {
    label: 'Textarea',
    type: 'textarea'
  }
];

class ExampleSelect extends React.Component {
  state = {
    selected: '',
    error: false,
    success: false
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
      <FormControl fullWidth style={{ marginBottom: '12px' }}>
        <InputLabel
          htmlFor="awesomeness"
          disableAnimation
          shrink={true}
          error={this.state.error}
        >
          Select an option
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
          <MenuItem value={1000}>1000</MenuItem>
          <MenuItem value={2500}>2500</MenuItem>
          <MenuItem value={9000}>9000</MenuItem>
          <MenuItem value={9001}>9000+</MenuItem>
        </Select>
        <FormHelperText error={this.state.error}>
          Here's some action text!
        </FormHelperText>
      </FormControl>
    );
  }
}

class ExampleCheckboxes extends React.Component {
  state = {
    checkedDefault: false,
    checkedWarning: false,
    checkedError: false
  };

  handleDefaultClick = () => {
    this.setState({ checkedDefault: !this.state.checkedDefault });
  };

  handleWarningClick = () => {
    this.setState({ checkedWarning: !this.state.checkedWarning });
  };

  handleErrorClick = () => {
    this.setState({ checkedError: !this.state.checkedError });
  };

  render() {
    return (
      <React.Fragment>
        <InputLabel style={{ display: 'block', marginBottom: '12px' }}>
          Checkbox Examples
        </InputLabel>
        <CheckBox disabled checked={false} onChange={this.handleDefaultClick} />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox disabled checked={true} onChange={this.handleDefaultClick} />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          checked={this.state.checkedDefault}
          onChange={this.handleDefaultClick}
        />
        <br />
        <br />
        <CheckBox
          variant="warning"
          disabled
          checked={false}
          onChange={this.handleWarningClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="warning"
          checked={true}
          onChange={this.handleDefaultClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="warning"
          checked={this.state.checkedWarning}
          onChange={this.handleWarningClick}
        />
        <br />
        <br />
        <CheckBox
          variant="error"
          disabled
          checked={false}
          onChange={this.handleErrorClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          disabled
          variant="error"
          checked={true}
          onChange={this.handleDefaultClick}
        />
        <span style={{ marginLeft: '8px' }} />
        <CheckBox
          variant="error"
          checked={this.state.checkedError}
          onChange={this.handleErrorClick}
        />
      </React.Fragment>
    );
  }
}

class ExampleRadios extends React.Component {
  state = { value: undefined };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    this.setState(() => ({ value }));
  };

  render() {
    return (
      <React.Fragment>
        <InputLabel style={{ display: 'block' }}>Radio Examples</InputLabel>
        <RadioGroup
          aria-label="gender"
          name="gender"
          value={this.state.value}
          onChange={this.handleChange}
        >
          <FormControlLabel
            value="Disabled"
            label="Disabled"
            control={<Radio disabled />}
          />
          <FormControlLabel value="D" label="Default" control={<Radio />} />
          <FormControlLabel
            value="B"
            label="Warning"
            control={<Radio variant="warning" />}
          />
          <FormControlLabel
            value="A"
            label="Error"
            control={<Radio variant="error" />}
          />
        </RadioGroup>
      </React.Fragment>
    );
  }
}

storiesOf('Forms', module).add('Form Examples', () => (
  <React.Fragment>
    {fields.map(eachField =>
      eachField.type === 'textarea' ? (
        <TextField
          key={eachField.label}
          label={eachField.label}
          placeholder={eachField.label}
          type={eachField.type}
          multiline={true}
          rows={3}
        />
      ) : (
        <TextField
          key={eachField.label}
          label={eachField.label}
          placeholder={eachField.label}
          type={eachField.type}
        />
      )
    )}
    <ExampleSelect />
    <ExampleCheckboxes />
    <ExampleRadios />
  </React.Fragment>
));
