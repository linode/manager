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
  RadioGroup,
} from 'material-ui';
import FormDivider from './FormDivider';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import Radio from 'src/components//Radio';
import Grid from 'src/components/Grid';
import PasswordInput from 'src/components/PasswordInput';
import Select from 'src/components/Select';
import SelectionCard from 'src/components/SelectionCard';
import Table from 'src/components/Table';
import Toggle from 'src/components/Toggle';

import InsertPhoto from 'material-ui-icons/InsertPhoto';
import Alarm from 'material-ui-icons/Alarm';

const HelperItemStyles = {
  with: '100%',
  height: '100%',
  padding: '8px 24px 0 24px',
  backgroundColor: '#f4f4f4',
};

interface State {
  selected?: number;
}

interface Props {
  nomargins?: boolean;
}

class Form extends React.Component<State & Props> {
  state = {
    checkedA: true,
    checkedB: false,
    checkedC: false,
    checkedD: true,
    checkedE: false,
    checkedF: false,
    selected: this.props.selected || 'none',
    RadioValue: undefined,
    TableRadioValue: '0',
    TableRadioValue2: '0',
  };

  checkBoxClick = (type: string) => {
    this.setState({ [type]: !this.state[type] });
  }

  selectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    this.setState({
      selected: value,
    });
  }

  radioChange = (e: React.ChangeEvent<HTMLFormElement>, RadioValue: string) => {
    this.setState(() => ({ RadioValue }));
  }

  TableRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ TableRadioValue: e.target.value });
  }

  TableRadioChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ TableRadioValue2: e.target.value });
  }

  render() {
    const { selected } = this.state;
    const { nomargins } = this.props;

    return (
      <React.Fragment>
        <div style={{ padding: !nomargins && 20 }}>
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
            <PasswordInput label="Password" />
            <TextField
              label="Comments"
              value=""
              multiline={true}
              rows={3}
            />

            <FormDivider spacing={3} />

            <FormControl fullWidth>
              <InputLabel
                htmlFor="select"
                disableAnimation
                shrink={true}
              >
                Select Example
              </InputLabel>
              <Select
                value={selected}
                onChange={this.selectChange}
                inputProps={{ name: 'select', id: 'select' }}
                {...this.props}
              >
                <MenuItem value="none" disabled>Select an option</MenuItem>
                <MenuItem value={1}>First Option</MenuItem>
                <MenuItem value={2}>Second Option</MenuItem>
                <MenuItem value={3}>Third Option</MenuItem>
                <MenuItem value={4}>Last Option</MenuItem>
              </Select>
              <FormHelperText>Here's some helper text</FormHelperText>
            </FormControl>

            <FormDivider spacing={3} />

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

            <FormDivider spacing={3} />

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

            <FormDivider spacing={3} />

            <RadioGroup
              aria-label="gender"
              name="gender"
              value={this.state.RadioValue}
              onChange={this.radioChange}
            >
              <FormControlLabel
                value="1"
                label="First Option"
                control={<Radio />}
              />
              <FormControlLabel
                value="2"
                label="Second Option"
                control={<Radio />}
              />
              <FormControlLabel
                value="3"
                label="Second Option"
                control={<Radio />}
              />
              <FormControlLabel
                value="4"
                label="Last Option"
                control={<Radio />}
              />
            </RadioGroup>

            <FormDivider spacing={3} />

            <FormGroup>
              <FormLabel>
                Toggle Switches
              </FormLabel>
              <Toggle label="First Label" />
              <Toggle label="Second Label" />
              <Toggle label="Label Label" />
            </FormGroup>

            <FormDivider spacing={3} />

            <FormGroup>
              <FormLabel>
                A group of cards
              </FormLabel>
              <Grid container wrap="wrap" style={{ marginTop: 16 }}>
                <SelectionCard
                  renderIcon={() => {
                    return <InsertPhoto />;
                  }}
                  heading="Photos"
                  subheadings={[
                    'Use a photo',
                    'Select up to 3',
                  ]}
                />
                <SelectionCard
                  renderIcon={() => {
                    return <Alarm />;
                  }}
                  heading="Alarm"
                  subheadings={[
                    'Set an alarm',
                    'Choose the time and alarm sound',
                  ]}
                />
              </Grid>
            </FormGroup>

            <FormDivider spacing={3} />
            <FormLabel>
              A Table of radio buttons
            </FormLabel>
            <FormGroup>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" data-qa-perm-access>Legend</TableCell>
                    <TableCell padding="checkbox" data-qa-perm-none>Col 1</TableCell>
                    <TableCell padding="checkbox" data-qa-perm-read>Col 2</TableCell>
                    <TableCell padding="checkbox" data-qa-perm-rw>Col 3</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell padding="checkbox">
                      Row 1
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="0"
                        checked={this.state.TableRadioValue === '0'}
                        onChange={this.TableRadioChange}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="1"
                        checked={this.state.TableRadioValue === '1'}
                        onChange={this.TableRadioChange}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="2"
                        checked={this.state.TableRadioValue === '2'}
                        onChange={this.TableRadioChange}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding="checkbox">
                      Row 2
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="0"
                        checked={this.state.TableRadioValue2 === '0'}
                        onChange={this.TableRadioChange2}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="1"
                        checked={this.state.TableRadioValue2 === '1'}
                        onChange={this.TableRadioChange2}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Radio
                        value="2"
                        checked={this.state.TableRadioValue2 === '2'}
                        onChange={this.TableRadioChange2}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </FormGroup>

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

export default Form;

storiesOf('Form', module)
  .addDecorator(ThemeDecorator)
  .add('Form', () => (
    <Form />
  ));
