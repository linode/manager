import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ActionsPanel from '../ActionsPanel';
import ThemeDecorator from '../../utilities/storybookDecorators';
import TextField from '../TextField';

import {
  InputLabel,
  FormControl,
  FormGroup,
  FormLabel,
  Typography,
  FormControlLabel,
  MenuItem,
  FormHelperText,
} from 'material-ui';
import FormDivider from './FormDivider';

import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import Grid from 'src/components/Grid';
import PasswordInput from 'src/components/PasswordInput';
import Select from 'src/components/Select';

const HelperItemStyles = {
  with: '100%',
  height: '100%',
  padding: '8px 24px 0 24px',
  backgroundColor: '#f4f4f4',
};

interface State {
  selected: number;
}

class Form extends React.Component<State> {
  state = {
    checkedA: true,
    checkedB: false,
    checkedC: false,
    checkedD: true,
    checkedE: false,
    checkedF: false,
    selected: this.props.selected || '',
  };

  checkBoxClick = (type: string) => {
    this.setState({ [type]: !this.state[type] });
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    this.setState({
      selected: value,
    });
  }

  render() {
    const { selected } = this.state;

    return (
      <React.Fragment>
        <div style={{ padding: 24 }}>
          <form>
            <FormLabel>
              A form with multiple input types
            </FormLabel>
            <Typography variant="title" style={{ margin: '20px 0' }}>
              Helpers:
            </Typography>
            <Grid container style={{ marginBottom: 20 }}>
              <Grid item xs={12} sm={6}>
                <div style={HelperItemStyles}>
                  <Typography variant="caption">
                    <pre>FormControl</pre>
                    Provides context such as filled/focused/error/required for form inputs.
                    Relying on the context provides high flexibilty and ensures that the state
                    always stay consitent across the children of the FormControl.
                    This context is used by the following components:
                    <ul>
                      <li>FormLabel</li>
                      <li>FormHelperText</li>
                      <li>Input</li>
                      <li>InputLabel</li>
                    </ul>
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div style={HelperItemStyles}>
                  <Typography variant="caption">
                    <pre>FormGroup</pre>
                    FormGroup wraps controls such as Checkbox and Switch.
                    It provides compact row layout. For the Radio,
                    you should be using the RadioGroup component instead of this one
                  </Typography>
                </div>
              </Grid>
            </Grid>
            <TextField
              label="Input Some Text"
              placeholder="This is a placeholder"
            />
            <PasswordInput />

            <FormDivider spacing={24} />

            <FormControl fullWidth>
              <InputLabel
                htmlFor="select"
                disableAnimation
                shrink={true}>
                Select
              </InputLabel>
              <Select
                value={selected}
                onChange={this.handleChange}
                inputProps={{ name: 'select', id: 'select' }}
                {...this.props}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value={1000}>Meh</MenuItem>
                <MenuItem value={2500}>Mediocre</MenuItem>
                <MenuItem value={9000}>9000</MenuItem>
                <MenuItem value={9001}>It's over 9000!</MenuItem>
              </Select>
              <FormHelperText>Here's some helper text</FormHelperText>
          </FormControl>

            <FormDivider spacing={24} />

            <FormGroup>
              <FormLabel>
                Checkboxes with FormGroup
              </FormLabel>
              <FormControlLabel
                control={
                  <CheckBox
                    checked={this.state.checkedA}
                    onChange={() => this.checkBoxClick('checkedA')}
                  />
                }
                label="Option 1"
              />
              <FormControlLabel
                control={
                  <CheckBox
                    checked={this.state.checkedB}
                    onChange={() => this.checkBoxClick('checkedB')}
                  />
                }
                label="Option 1"
              />
              <FormControlLabel
                control={
                  <CheckBox
                  checked={this.state.checkedC}
                  onChange={() => this.checkBoxClick('checkedC')}
                  />
                }
                label="Option 1"
              />
            </FormGroup>

            <FormDivider spacing={24} />

            <FormGroup row>
              <FormLabel>
                Checkboxes with FormGroup row
              </FormLabel>
              <FormControlLabel
                control={
                  <CheckBox
                    checked={this.state.checkedD}
                    onChange={() => this.checkBoxClick('checkedD')}
                  />
                }
                label="Option 1"
              />
              <FormControlLabel
                control={
                  <CheckBox
                    checked={this.state.checkedE}
                    onChange={() => this.checkBoxClick('checkedE')}
                  />
                }
                label="Option 1"
              />
              <FormControlLabel
                control={
                  <CheckBox
                  checked={this.state.checkedF}
                  onChange={() => this.checkBoxClick('checkedF')}
                  />
                }
                label="Option 1"
              />
            </FormGroup>

            <FormDivider spacing={24} />

            <ActionsPanel>
              <Button type="primary">
                Save
              </Button>
            </ActionsPanel>
          </form>
        </div>
      </React.Fragment>
    );
  }
}

storiesOf('Form', module)
  .addDecorator(ThemeDecorator)
  .add('Form', () => (
    <Form />
  ));
