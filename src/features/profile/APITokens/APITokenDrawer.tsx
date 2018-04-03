import * as React from 'react';
import * as moment from 'moment';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Drawer from 'src/components/Drawer';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import Button from 'material-ui/Button';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';

import Radio from 'src/components/Radio';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import { dateFormat } from 'src/events';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'permsTable';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  permsTable: {
    marginTop: theme.spacing.unit * 2,
  },
});

export type DrawerMode = 'view' | 'edit' | 'create';

type Permission = [string, number];
type Expiry = [string, string];

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
  scopes: string;
  expiryTups: Expiry[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {
    scopes: this.props.scopes || '',
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

  /* NB: Upon updating React, port this to getDerivedStateFromProps */
  componentWillReceiveProps(nextProps: CombinedProps) {
    if (
      /* If we are about to display a new token */
      this.props.id !== nextProps.id
      /* Or scopes have just become undefined */
      || nextProps.scopes === undefined
    ) {
      /* Then update our current scopes state */
      this.setState({ scopes: (nextProps.scopes || '') });
    }
  }

  static perms = [
    'account',
    'domains',
    'events',
    'images',
    'ips',
    'linodes',
    'longview',
    'nodebalancers',
    'stackscripts',
    'volumes',
  ];

  static levelMap = {
    none: 0,
    read_only: 1,
    read_write: 2,
    view: 1,
    modify: 2,
    create: 2,
    delete: 2,
  };

  static inverseLevelMap = [
    'none',
    'read_only',
    'read_write',
  ];

  /**
   * This function accepts scopes strings directly from the API, which have the following format:
   * "linodes:delete,domains:modify,nodebalancers:modify,images:create,events:view,clients:view"
   *
   * It returns an array of 2-tuples in alphabetical order by scope name.
   *
   * Each 2-tuple has the format [<scopename>, <number>], where <number> is the permission level
   * of the scope. These are the permission levels in order:
   *
   * None: 0
   * ReadOnly: 1
   * ReadWrite: 2
   *
   * These are old permission levels which must be mapped to the new levels
   * None: 0
   * View: 1
   * Create: 2
   * Modify: 2
   * Delete: 2
   *
   * Each permission level gives a user access to all lower permission levels.
   */
  scopesToPermTuples(scopes: string): Permission[] {
    if (scopes === '*') {
      return APITokenDrawer.perms.map(perm => [perm, 2] as Permission);
    }

    const scopeMap = scopes.split(',').reduce(
      (map, scopeStr) => {
        const scopeTuple = scopeStr.split(':');
        scopeTuple[1] = APITokenDrawer.levelMap[scopeTuple[1]];
        map[scopeTuple[0]] = scopeTuple[1];
        return map;
      },
      {},
    );

    const equivalentPerms = {
      account: [
        'tokens',
        'clients',
        'users',
        'tickets',
        'managed',
      ],
    };

    /* TODO: Remove this logic once the API starts doing the deprecation mapping for us */
    const combinedScopeMap = Object.keys(equivalentPerms).reduce(
      (map: { [perm: string]: number }, perm: string) => {
        const maxLevel = equivalentPerms[perm].reduce(
          (level: number, eqPerm: string) => {
            return Math.max(level, map[eqPerm] || APITokenDrawer.levelMap['none']);
          },
          map[perm] || APITokenDrawer.levelMap['none'],
        );
        map[perm] = maxLevel;
        return map;
      },
      scopeMap,
    );

    const permTuples = APITokenDrawer.perms.reduce(
      (tups: Permission[], permName: string): Permission[] => {
        const tup = [
          permName,
          combinedScopeMap[permName] || APITokenDrawer.levelMap['none'],
        ] as Permission;
        return [...tups, tup];
      },
      [],
    );

    return permTuples;
  }

  allMaxPerm = (scopeTups: Permission[]) : boolean => {
    if (scopeTups.length !== APITokenDrawer.perms.length) {
      return false;
    }
    return scopeTups.reduce(
      (acc: boolean, scopeTup: Permission) => {
        return (scopeTup[1] === APITokenDrawer.levelMap.read_write) && acc;
      },
      true,
    );
  }

  permTuplesToScopeString = (scopeTups: Permission[]): string => {
    if (this.allMaxPerm(scopeTups)) {
      return '*';
    }
    const joinedTups = scopeTups.reduce(
      (acc, tup) => {
        const level = APITokenDrawer.inverseLevelMap[tup[1]];
        if (level !== 'none') {
          return [...acc, [tup[0], level].join(':')];
        }
        return [...acc];
      },
      [],
    );
    return joinedTups.join(',');
  }

  handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const scopeTups = this.scopesToPermTuples(this.state.scopes);
    const targetIndex = scopeTups.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name);
    if (targetIndex !== undefined) {
      scopeTups[targetIndex][1] = +(e.currentTarget.value);
    }
    this.setState({ scopes: this.permTuplesToScopeString(scopeTups) });
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
            <TableCell>Access</TableCell>
            <TableCell>None</TableCell>
            <TableCell>Read Only</TableCell>
            <TableCell>Read/Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.scopesToPermTuples(scopes).map(
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
            <Button
              variant="raised"
              color="primary"
              onClick={mode as string === 'create'
                ? () => onCreate(this.state.scopes)
                : () => onEdit()
              }
            >
              {mode as string === 'create' ? 'Submit' : 'Save'}
            </Button>
          }
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
