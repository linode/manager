import * as moment from 'moment';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Radio from 'src/components/Radio';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TextField from 'src/components/TextField';
import { dateFormat } from 'src/time';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import {
  Permission,
  permTuplesToScopeString,
  scopeStringToPermTuples
} from './utils';

type Expiry = [string, string];

export const genExpiryTups = (): Expiry[] => {
  return [
    [
      'In 6 months',
      moment()
        .add(6, 'months')
        .startOf('day')
        .format(dateFormat)
    ],
    [
      'In 3 months',
      moment()
        .add(3, 'months')
        .startOf('day')
        .format(dateFormat)
    ],
    [
      'In 1 month',
      moment()
        .add(1, 'months')
        .startOf('day')
        .format(dateFormat)
    ],
    [
      'Never',
      moment()
        .add(200, 'years')
        .startOf('day')
        .format(dateFormat)
    ]
  ];
};

type ClassNames =
  | 'permsTable'
  | 'selectCell'
  | 'accessCell'
  | 'noneCell'
  | 'readOnlyCell'
  | 'readWritecell';

const styles = (theme: Theme) =>
  createStyles({
    permsTable: {
      marginTop: theme.spacing(3)
    },
    selectCell: {
      fontFamily: 'LatoWebBold', // we keep this bold at all times
      fontSize: '.9rem'
    },
    accessCell: {
      width: '31%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    noneCell: {
      width: '23%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    readOnlyCell: {
      width: '23%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    readWritecell: {
      width: '23%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    }
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
    selectAllSelectedScope: null
  };

  /* NB: Upon updating React, port this to getDerivedStateFromProps */
  componentWillReceiveProps(nextProps: CombinedProps) {
    if (
      /* If we are about to display a new token */
      this.props.id !== nextProps.id
    ) {
      /* Then update our current scopes state */
      this.setState({
        scopes: scopeStringToPermTuples(nextProps.scopes || '')
      });
    }
  }

  handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const scopeTups = this.state.scopes;
    const targetIndex = scopeTups.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name
    );
    if (targetIndex !== undefined) {
      scopeTups[targetIndex][1] = +e.currentTarget.value;
    }
    this.setState({ scopes: scopeTups });
  };

  handleSelectAllScopes = (e: React.SyntheticEvent<RadioButton>): void => {
    const { scopes } = this.state;
    const value = +e.currentTarget.value;

    this.setState({
      scopes: scopes.map((scope): Permission => [scope[0], value]),
      selectAllSelectedScope: value
    });
  };

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange('label', e.target.value);
  };

  handleExpiryChange = (e: Item<string>) => {
    this.props.onChange('expiry', e.value);
  };

  // return whether all scopes selected in the create token flow are the same
  allScopesIdentical = () => {
    const { scopes, selectAllSelectedScope } = this.state;
    const allScopesIdentical = scopes.every(
      scope => scope[1] === selectAllSelectedScope
    );
    return allScopesIdentical;
  };

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
    volumes: 'Volumes'
  };

  renderPermsTable() {
    const { classes, mode } = this.props;
    const { scopes, selectAllSelectedScope } = this.state;

    return (
      <Table
        aria-label="Personnal Acccess Token Permissions"
        className={classes.permsTable}
        spacingTop={24}
      >
        <TableHead>
          <TableRow>
            <TableCell data-qa-perm-access>Access</TableCell>
            <TableCell data-qa-perm-none>None</TableCell>
            <TableCell data-qa-perm-read>Read Only</TableCell>
            <TableCell data-qa-perm-rw>Read/Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mode === 'create' && (
            <TableRow data-qa-row="Select All">
              <TableCell
                parentColumn="Access"
                padding="checkbox"
                className={classes.selectCell}
              >
                Select All
              </TableCell>
              <TableCell
                parentColumn="None"
                padding="checkbox"
                className={classes.noneCell}
              >
                <Radio
                  name="Select All"
                  checked={
                    selectAllSelectedScope === 0 && this.allScopesIdentical()
                  }
                  value="0"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-none-radio
                  inputProps={{
                    'aria-label': 'Select none for all'
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read Only"
                padding="checkbox"
                className={classes.readOnlyCell}
              >
                <Radio
                  name="Select All"
                  checked={
                    selectAllSelectedScope === 1 && this.allScopesIdentical()
                  }
                  value="1"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-read-radio
                  inputProps={{
                    'aria-label': 'Select read-only for all'
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read/Write"
                padding="checkbox"
                className={classes.readWritecell}
              >
                <Radio
                  name="Select All"
                  checked={
                    selectAllSelectedScope === 2 && this.allScopesIdentical()
                  }
                  value="2"
                  onChange={this.handleSelectAllScopes}
                  data-qa-perm-rw-radio
                  inputProps={{
                    'aria-label': 'Select read/write for all'
                  }}
                />
              </TableCell>
            </TableRow>
          )}
          {scopes.map(scopeTup => {
            return (
              <TableRow
                key={scopeTup[0]}
                data-qa-row={this.permNameMap[scopeTup[0]]}
              >
                <TableCell
                  parentColumn="Access"
                  padding="checkbox"
                  className={classes.accessCell}
                >
                  {this.permNameMap[scopeTup[0]]}
                </TableCell>
                <TableCell
                  parentColumn="None"
                  padding="checkbox"
                  className={classes.noneCell}
                >
                  <Radio
                    name={scopeTup[0]}
                    disabled={mode !== 'create' && scopeTup[1] !== 0}
                    checked={scopeTup[1] === 0}
                    value="0"
                    onChange={this.handleScopeChange}
                    data-qa-perm-none-radio
                    inputProps={{
                      'aria-label': `no access for ${scopeTup[0]}`
                    }}
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
                    inputProps={{
                      'aria-label': `read-only for ${scopeTup[0]}`
                    }}
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
                    inputProps={{
                      'aria-label': `read/write for ${scopeTup[0]}`
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  errorResources = {
    label: 'label'
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
      onEdit
    } = this.props;
    const { expiryTups } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const expiryList = expiryTups.map((expiryTup: Expiry) => {
      return { label: expiryTup[0], value: expiryTup[1] };
    });

    const defaultExpiry = expiryList.find(eachOption => {
      return eachOption.value === expiry;
    });

    return (
      <Drawer
        title={
          (mode === 'view' && label) ||
          (mode === 'create' && 'Add Personal Access Token') ||
          (mode === 'edit' && 'Edit Personal Access Token') ||
          ''
        }
        open={open}
        onClose={closeDrawer}
      >
        {(mode === 'create' || mode === 'edit') && (
          <TextField
            errorText={errorFor('label')}
            value={label || ''}
            label="Label"
            onChange={this.handleLabelChange}
            data-qa-add-label
          />
        )}
        {mode === 'create' && (
          <FormControl>
            <Select
              options={expiryList}
              defaultValue={defaultExpiry || expiryTups[0][1]}
              onChange={this.handleExpiryChange}
              name="expiry"
              id="expiry"
              label="Expiry"
              isClearable={false}
            />
          </FormControl>
        )}
        {mode === 'view' && (
          <Typography>This application has access to your:</Typography>
        )}
        {(mode === 'view' || mode === 'create') && this.renderPermsTable()}
        {errorFor('scopes') && (
          <FormHelperText error>{errorFor('scopes')}</FormHelperText>
        )}
        {errorFor('none') && (
          <FormHelperText error>{errorFor('none')}</FormHelperText>
        )}
        <ActionsPanel>
          {mode === 'view' && (
            <Button
              buttonType="primary"
              onClick={closeDrawer}
              data-qa-close-drawer
            >
              Done
            </Button>
          )}
          {(mode === 'create' || mode === 'edit') && [
            <Button
              key="create"
              buttonType="primary"
              onClick={
                (mode as string) === 'create'
                  ? () => onCreate(permTuplesToScopeString(this.state.scopes))
                  : () => onEdit()
              }
              data-qa-submit
            >
              {(mode as string) === 'create' ? 'Submit' : 'Save'}
            </Button>,
            <Button
              buttonType="secondary"
              className="cancel"
              key="cancel"
              onClick={closeDrawer}
              data-qa-cancel
            >
              Cancel
            </Button>
          ]}
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default styled(APITokenDrawer);
