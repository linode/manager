import * as React from 'react';
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

import Radio from 'src/components/Radio';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';

type ClassNames = 'permsTable';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  permsTable: {
    marginTop: theme.spacing.unit * 2,
  },
});

export type DrawerMode = 'view' | 'edit' | 'create';

interface Props {
  label?: string;
  scopes?: string;
  expiry?: string;
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
}

type CombinedProps = Props & WithStyles<ClassNames>;

type Permission = [string, number];

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {
    scopes: this.props.scopes || '',
  };

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
    const levelMap = {
      read_only: 1,
      read_write: 2,
      view: 1,
      modify: 2,
      create: 2,
      delete: 2,
    };

    const perms = [
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

    if (scopes === '*') {
      return perms.map(perm => [perm, 2] as Permission);
    }

    const scopeMap = scopes.split(',').reduce(
      (map, scopeStr) => {
        const scopeTuple = scopeStr.split(':');
        scopeTuple[1] = levelMap[scopeTuple[1]];
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
            return Math.max(level, map[eqPerm] || 0);
          },
          map[perm] || 0,
        );
        map[perm] = maxLevel;
        return map;
      },
      scopeMap,
    );

    const permTuples = perms.reduce(
      (tups: Permission[], permName: string): Permission[] => {
        const tup = [permName, combinedScopeMap[permName] || 0] as Permission;
        return [...tups, tup];
      },
      [],
    );

    return permTuples;
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
          {scopes && this.scopesToPermTuples(scopes).map(
            (scopeTup) => {
              return (
                <TableRow>
                  <TableCell>
                    {this.permNameMap[scopeTup[0]]}
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode === 'view' && scopeTup[1] !== 0}
                      checked={scopeTup[1] === 0}
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode === 'view' && scopeTup[1] !== 1}
                      checked={scopeTup[1] === 1}
                    />
                  </TableCell>
                  <TableCell>
                    <Radio
                      name={scopeTup[0]}
                      disabled={mode === 'view' && scopeTup[1] !== 2}
                      checked={scopeTup[1] === 2}
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

  render() {
    const {
      label,
      expiry,
      open,
      mode,
      closeDrawer,
      onChange,
      onCreate,
      onEdit,
    } = this.props;

    return (
      <Drawer
        title={
          mode === 'view' && label
          || mode === 'create' && 'Add a Personal Access Token'
          || ''
        }
        open={open}
        onClose={closeDrawer}
      >
        {(mode === 'create' || mode === 'edit') &&
          <TextField
            value={label || ''}
            label="Label"
            onChange={e => onChange('label', e.target.value)}
          />
        }
        {(mode === 'create' || mode === 'edit') &&
          <TextField
            value={expiry || ''}
            label="Expiry"
            onChange={e => onChange('expiry', e.target.value)}
          />
        }
        {mode === 'view' &&
          'This application has access to your:'
        }
        {this.renderPermsTable()}
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
