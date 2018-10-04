import * as moment from 'moment';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Radio from 'src/components/Radio';
import Select from 'src/components/Select';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TextField from 'src/components/TextField';
import { dateFormat } from 'src/time';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import { Permission, permTuplesToScopeString, scopeStringToPermTuples } from './utils';

type Expiry = [string, string];

export const genExpiryTups = (): Expiry[] => {
  return [
    ['In 6 months', moment().add(6, 'months').startOf('day').format(dateFormat)],
    ['In 3 months', moment().add(3, 'months').startOf('day').format(dateFormat)],
    ['In 1 month', moment().add(1, 'months').startOf('day').format(dateFormat)],
    ['Never', moment().add(200, 'years').startOf('day').format(dateFormat)],
  ];
};

type ClassNames = 'permsTable'
  | 'selectCell'
  | 'accessCell'
  | 'noneCell'
  | 'readOnlyCell'
  | 'readWritecell';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  permsTable: {
    marginTop: theme.spacing.unit * 3,
  },
  selectCell: {
    fontWeight: 900,
    fontSize: '.9rem',
  },
  accessCell: {
    width: '31%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  noneCell: {
    width: '23%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  readOnlyCell: {
    width: '23%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  readWritecell: {
    width: '23%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
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
  selectAllSelectedScope: number | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {
    scopes: scopeStringToPermTuples(this.props.scopes || ''),
    expiryTups: genExpiryTups(),
    selectAllSelectedScope: null,
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

  handleSelectAllScopes = (e: React.SyntheticEvent<RadioButton>): void => {
    const { scopes } = this.state;
    const value = +e.currentTarget.value;

    this.setState({
      scopes: scopes.map((scope): Permission => ([scope[0], value])),
      selectAllSelectedScope: value,
    });
  }

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange('label', e.target.value);
  }

  handleExpiryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChange('expiry', e.target.value);
  }

  // return whether all scopes selected in the create token flow are the same
  allScopesIdentical = () => {
    const { scopes, selectAllSelectedScope } = this.state;
    const allScopesIdentical = scopes.every(scope => scope[1] === selectAllSelectedScope);
    return allScopesIdentical;
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
    const { scopes, selectAllSelectedScope } = this.state;

    return (
      <Table
        aria-label="Personnal Acccess Token Permissions"
        className={classes.permsTable}
      >
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" data-qa-perm-access>Access</TableCell>
            <TableCell padding="checkbox" data-qa-perm-none>None</TableCell>
            <TableCell padding="checkbox" data-qa-perm-read>Read Only</TableCell>
            <TableCell padding="checkbox" data-qa-perm-rw>Read/Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mode === 'create' &&
            <TableRow data-qa-row="Select All">
              <TableCell parentColumn="Access" padding="checkbox" className={classes.selectCell}>
                Select All
              </TableCell>
              <TableCell parentColumn="None" padding="checkbox" className={classes.noneCell}>
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 0 && this.allScopesIdentical()}
                  value="0"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-none-radio
                />
              </TableCell>
            <TableCell
              parentColumn="Read Only"
              padding="checkbox"
              className={classes.readOnlyCell}
            >
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 1 && this.allScopesIdentical()}
                  value="1"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-read-radio
                />
              </TableCell>
            <TableCell
              parentColumn="Read/Write"
              padding="checkbox"
              className={classes.readWritecell}
            >
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 2 && this.allScopesIdentical()}
                  value="2"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-rw-radio
                />
              </TableCell>
            </TableRow>
          }
          {scopes.map(
            (scopeTup) => {
              return (
                <TableRow key={scopeTup[0]} data-qa-row={this.permNameMap[scopeTup[0]]}>
                  <TableCell parentColumn="Access" padding="checkbox" className={classes.accessCell}>
                    {this.permNameMap[scopeTup[0]]}
                  </TableCell>
                  <TableCell parentColumn="None" padding="checkbox" className={classes.noneCell}>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 0}
                      checked={scopeTup[1] === 0}
                      value="0"
                      onChange={this.handleScopeChange}
                      data-qa-perm-none-radio
                    />
                  </TableCell>
                  <TableCell
                    parentColumn="Read Only"
                    padding="checkbox"
                    className={classes.readOnlyCell}
                  >
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode !== 'create' && scopeTup[1] !== 1}
                      checked={scopeTup[1] === 1}
                      value="1"
                      onChange={this.handleScopeChange}
                      data-qa-perm-read-radio
                    />
                  </TableCell>
                  <TableCell
                    parentColumn="Read/Write"
                    padding="checkbox"
                    className={classes.readWritecell}
                  >
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
    label: 'label',
  };

  render() {
    const {
      label,
      expiry,
      errors,
      open,
      mode,
      closeDrawer,
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
            onChange={this.handleLabelChange}
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
              onChange={this.handleExpiryChange}
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
          <Typography>This application has access to your:</Typography>
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
              onClick={closeDrawer}
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
              <Button
                variant="raised"
                color="secondary"
                className="cancel"
                key="cancel"
                onClick={closeDrawer} data-qa-cancel
              >
                Cancel
              </Button>,
            ]
          }
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
