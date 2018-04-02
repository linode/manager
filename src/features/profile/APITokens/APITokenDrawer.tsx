import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Drawer from 'src/components/Drawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  activeToken: Linode.Token | null;
  drawerOpen: boolean;
  closeDrawer: () => void;
}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

type Permission = [string, number];

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {};

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

    const scopeMap = scopes.split(',').reduce(
      (map, scopeStr) => {
        const scopeTuple = scopeStr.split(':');
        scopeTuple[1] = levelMap[scopeTuple[1]];
        map[scopeTuple[0]] = scopeTuple[1];
        return map;
      },
      {},
    );

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

    const permTuples = perms.reduce(
      (tups: Permission[], permName: string): Permission[] => {
        const tup = [permName, scopeMap[permName] || 0] as Permission;
        return [...tups, tup];
      },
      [],
    );

    return permTuples;
  }

  render() {
    const { activeToken, drawerOpen, closeDrawer } = this.props;

    return (
      <Drawer
        title={(activeToken && activeToken.label) || ''}
        open={drawerOpen}
        onClose={closeDrawer}
      >
        This application has access to your:
        {activeToken && this.scopesToPermTuples(activeToken.scopes).map(
          (scopeTup) => {
            return <div key={scopeTup[0]}>{scopeTup}</div>;
          },
        )}
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
