import * as React from 'react';
import * as moment from 'moment';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Drawer from 'src/components/Drawer';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import Button from 'material-ui/Button';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';

import Table from 'src/components/Table';
import Radio from 'src/components/Radio';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import { dateFormat } from 'src/time';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import {
  Permission,
  scopeStringToPermTuples,
  permTuplesToScopeString,
} from './utils';

type Expiry = [string, string];

type ClassNames = 'permsTable';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  permsTable: {
    marginTop: theme.spacing.unit * 2,
  },
});

export type DrawerMode = 'view' | 'edit' | 'create';

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface Props {
  label?: string;
  scopes?: string;
  expiry?: string;
  errors?: Linode.ApiFieldError[];
  id?: number;
  open: boolean;
  mode: string;
  closeDrawer: () => void;
  onChange: (key: string, value: string) => void;
  /* Due to the amount of transformation that needs to be done here, scopes is
     an uncontrolled input that's sent back in the submit handler */
  onCreate: (scopes: string) => void;
  onEdit: () => void;
}

interface State {
  expiryTups: Expiry[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {
    expiryTups: APITokenDrawer.genExpiryTups(),
  };

  static genExpiryTups = (): Expiry[] => {
    return [
      ['In 6 months', moment().add(6, 'months').format(dateFormat)],
      ['In 3 months', moment().add(3, 'months').format(dateFormat)],
      ['In 1 month', moment().add(1, 'months').format(dateFormat)],
      ['Never', moment().add(200, 'years').format(dateFormat)],
    ];
  }

  handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const scopeTups = scopeStringToPermTuples(this.props.scopes || '');
    const targetIndex = scopeTups.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name);
    if (targetIndex !== undefined) {
      scopeTups[targetIndex][1] = +(e.currentTarget.value);
    }
    this.props.onChange('scopes', permTuplesToScopeString(scopeTups));
  }

  permNameMap = {
    account: 'Account',
    domains: 'Domains',
    events: 'Events',
    images: 'Images',
    ips: 'IPs',
    linodes: 'Linodes',
    longview: 'Longview',
    nodebalancers: 'NodeBalancers',
    stackscripts: 'StackScripts',
    volumes: 'Volumes',
  };

  renderPermsTable() {
    const { classes, mode, scopes } = this.props;

    return (
      <Table className={classes.permsTable}>
        <TableHead>
          <TableRow>
            <TableCell>Access</TableCell>
            <TableCell>None</TableCell>
            <TableCell>Read Only</TableCell>
            <TableCell>Read/Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scopeStringToPermTuples(scopes || '').map(
            (scopeTup) => {
              return (
                <TableRow key={scopeTup[0]}>
                  <TableCell>
                    {this.permNameMap[scopeTup[0]]}
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 0}
                      checked={scopeTup[1] === 0}
                      value="0"
                      onChange={this.handleScopeChange}
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 1}
                      checked={scopeTup[1] === 1}
                      value="1"
                      onChange={this.handleScopeChange}
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 2}
                      checked={scopeTup[1] === 2}
                      value="2"
                      onChange={this.handleScopeChange}
                    />
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    );
  }

  errorResources = {
    label: 'A label',
  };

  render() {
    const {
      label,
      expiry,
      errors,
      open,
      mode,
      closeDrawer,
      onChange,
      onCreate,
      onEdit,
    } = this.props;
    const { expiryTups } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    return (
      <Drawer
        title={
          mode === 'view' && label
          || mode === 'create' && 'Add a Personal Access Token'
          || mode === 'edit' && 'Edit this Personal Access Token'
          || ''
        }
        open={open}
        onClose={closeDrawer}
      >
        {(mode === 'create' || mode === 'edit') &&
          <TextField
            errorText={errorFor('label')}
            value={label || ''}
            label="Label"
            onChange={e => onChange('label', e.target.value)}
          />
        }
        {mode === 'create' &&
          <FormControl>
            <InputLabel htmlFor="expiry">
              Expiry
            </InputLabel>
            <Select
              value={expiry || expiryTups[0][1]}
              onChange={e => onChange('expiry', e.target.value)}
              inputProps={{ name: 'expiry', id: 'expiry' }}
            >
              {expiryTups.map((expiryTup: Expiry) => (
                <MenuItem key={expiryTup[0]} value={expiryTup[1]}>
                  {expiryTup[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
        {mode === 'view' &&
          'This application has access to your:'
        }
        {(mode === 'view' || mode === 'create') &&
          this.renderPermsTable()
        }
        {errorFor('scopes') &&
          <FormHelperText error>{errorFor('scopes')}</FormHelperText>
        }
        {errorFor('none') &&
          <FormHelperText error>{errorFor('none')}</FormHelperText>
        }
        <ActionsPanel>
          {mode === 'view' &&
            <Button
              variant="raised"
              color="primary"
              onClick={() => closeDrawer()}
            >
              Done
            </Button>
          }
          {(mode === 'create' || mode === 'edit') &&
            [
              <Button
                variant="raised"
                color="primary"
                onClick={mode as string === 'create'
                  ? () => onCreate(this.props.scopes || '')
                  : () => onEdit()
                }
              >
                {mode as string === 'create' ? 'Submit' : 'Save'}
              </Button>,
              <Button onClick={() => closeDrawer()}>Cancel</Button>,
            ]
          }
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
