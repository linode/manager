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

export const genExpiryTups = (): Expiry[] => {
  return [
    ['In 6 months', moment().add(6, 'months').startOf('day').format(dateFormat)],
    ['In 3 months', moment().add(3, 'months').startOf('day').format(dateFormat)],
    ['In 1 month', moment().add(1, 'months').startOf('day').format(dateFormat)],
    ['Never', moment().add(200, 'years').startOf('day').format(dateFormat)],
  ];
};

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
  scopes: Permission[];
  expiryTups: Expiry[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {
    scopes: scopeStringToPermTuples(this.props.scopes || ''),
    expiryTups: genExpiryTups(),
  };

  /* NB: Upon updating React, port this to getDerivedStateFromProps */
  componentWillReceiveProps(nextProps: CombinedProps) {
    if (
      /* If we are about to display a new token */
      this.props.id !== nextProps.id
    ) {
      /* Then update our current scopes state */
      this.setState({ scopes: scopeStringToPermTuples(nextProps.scopes || '') });
    }
  }


  handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const scopeTups = this.state.scopes;
    const targetIndex = scopeTups.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name);
    if (targetIndex !== undefined) {
      scopeTups[targetIndex][1] = +(e.currentTarget.value);
    }
    this.setState({ scopes: scopeTups });
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
    const { classes, mode } = this.props;
    const { scopes } = this.state;

    return (
      <Table className={classes.permsTable}>
        <TableHead>
          <TableRow>
            <TableCell data-qa-perm-access>Access</TableCell>
            <TableCell data-qa-perm-none>None</TableCell>
            <TableCell data-qa-perm-read>Read Only</TableCell>
            <TableCell data-qa-perm-rw>Read/Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scopes.map(
            (scopeTup) => {
              return (
                <TableRow key={scopeTup[0]} data-qa-row={this.permNameMap[scopeTup[0]]}>
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
                      data-qa-perm-none-radio
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 1}
                      checked={scopeTup[1] === 1}
                      value="1"
                      onChange={this.handleScopeChange}
                      data-qa-perm-read-radio
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 2}
                      checked={scopeTup[1] === 2}
                      value="2"
                      onChange={this.handleScopeChange}
                      data-qa-perm-rw-radio
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
            data-qa-add-label
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
              data-qa-close-drawer
            >
              Done
            </Button>
          }
          {(mode === 'create' || mode === 'edit') &&
            [
              <Button
                key="create"
                variant="raised"
                color="primary"
                onClick={mode as string === 'create'
                  ? () => onCreate(permTuplesToScopeString(this.state.scopes))
                  : () => onEdit()
                }
                data-qa-submit
              >
                {mode as string === 'create' ? 'Submit' : 'Save'}
              </Button>,
              <Button key="cancel" onClick={() => closeDrawer()} data-qa-cancel>Cancel</Button>,
            ]
          }
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
