import { compose, flatten, lensPath, omit, pathOr, set } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import Select from 'src/components/Select';
import SelectionCard from 'src/components/SelectionCard';
import Table from 'src/components/Table';
import Toggle from 'src/components/Toggle';
import { getGrants, updateGrants, updateUser } from 'src/services/account';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames =
  'titleWrapper'
  | 'toggle'
  | 'topGrid'
  | 'unrestrictedRoot'
  | 'globalSection'
  | 'globalRow'
  | 'section'
  | 'grantTable'
  | 'selectAll'
  | 'tableSubheading';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  topGrid: {
    marginTop: theme.spacing.unit,
  },
  titleWrapper: {
    marginTop: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  toggle: {
    marginRight: 3,
  },
  unrestrictedRoot: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
  },
  globalSection: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
  },
  globalRow: {
    padding: `${theme.spacing.unit}px 0`,
  },
  section: {
    marginTop: theme.spacing.unit * 2,
    paddingBottom: 0,
  },
  grantTable: {
    '& th': {
      width: '25%',
      minWidth: 150,
    },
  },
  tableSubheading: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2,
  },
  selectAll: {
    cursor: 'pointer',
  },
});

interface Props {
  username?: string;
  clearNewUser: () => void;
}

interface State {
  loading: boolean;
  /* need this separated so we can show just the restricted toggle when it's in use */
  loadingGrants: boolean;
  saving: {
    [key: string]: boolean;
  },
  grants?: Linode.Grants;
  originalGrants?: Linode.Grants; /* used to implement cancel functionality */
  restricted?: boolean;
  errors?: Linode.ApiFieldError[];
  success?: {
    global: string,
    specific: string,
  }
  /* null needs to be a string here because it's a Select value */
  setAllPerm: 'null' | 'read_only' | 'read_write';
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserPermissions extends React.Component<CombinedProps, State> {
  state: State = {
    loadingGrants: false,
    loading: true,
    setAllPerm: 'null',
    saving: {
      global: false,
      entity: false,
    }
  };
  
  globalBooleanPerms = [
    'add_linodes',
    'add_nodebalancers',
    'add_longview',
    'longview_subscription',
    'add_domains',
    'add_stackscripts',
    'add_images',
    'add_volumes',
    'cancel_account'
  ];

  entityPerms = [
    'linode',
    'stackscript',
    'image',
    'volume',
    'nodebalancer',
    'domain',
    'longview',
  ]

  getUserGrants = () => {
    const { username } = this.props;
    if (username) {
      getGrants(username)
        .then((grants) => {
          if (grants.global) {
            this.setState({
              grants,
              originalGrants: grants,
              loading: false,
              loadingGrants: false,
              restricted: true,
            })
          } else {
            this.setState({
              grants,
              loading: false,
              loadingGrants: false,
              restricted: false,
            })
          }
        })
        .catch((errResponse) => {
          this.setState({
            errors: [{ reason: 
              'Unknown error occured while fetching user permissions. Try again later.'}]
          });
          scrollErrorIntoView();
        });
    }
  }

  componentDidMount() {
    this.getUserGrants();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.username !== this.props.username) {
      this.getUserGrants();
    }
  }
  
  savePermsType = (type: string) => () => {
    const { username, clearNewUser } = this.props;
    const { grants } = this.state;
    if (!username || !(grants && grants[type])) {
      return this.setState({
        errors: [
          { reason: `Can\'t set ${type} grants at this time. Please try again later`}]
      })
    }

    clearNewUser();

    if (type === 'global') {
      this.setState(compose(
        set(lensPath(['success', 'global']), ''),
        set(lensPath(['saving', 'global']), true),
      ));
      updateGrants(username, { global: grants.global } as Partial<Linode.Grants>)
        .then((grantsResponse) => {
          this.setState(compose(
            set(lensPath(['grants', 'global']), grantsResponse.global),
            set(lensPath(['originalGrants', 'global']), grantsResponse.global),
            set(lensPath(['success', 'global']),
              'Successfully updated global permissions'),
            set(lensPath(['saving', 'global']), false),
          ));
        })
        .catch((errResponse) => {
          this.setState({
            errors: pathOr(
              [{ reason: 
                'Error while updating global permissions for this user. Try again later'}],
              ['response', 'data', 'errors'],
              errResponse,
            ),
          })
          this.setState(set(lensPath(['saving', 'global']), false))
          scrollErrorIntoView();
        });
      return;
    }

    /* This is where individual entity saving could be implemented */
  }

  saveSpecificGrants = () => {
    const { username } = this.props;
    const { grants } = this.state;
    if (!username || !(grants)) {
      return this.setState({
        errors: [
          { reason: `Can\'t set Entity-Specific Grants at this time. Please try again later` }
        ]
      })
    }

    this.setState(compose(
      set(lensPath(['success', 'specific']), ''),
      set(lensPath(['saving', 'entity']), true),
    ));
    const requestPayload = omit(['global'], grants);
    updateGrants(username, requestPayload as Partial<Linode.Grants>)
      .then((grantsResponse) => {
        /* build array of update fns */
        let updateFns = this.entityPerms.map((entity) => {
          const lens = lensPath(['grants', entity]);
          const lensOrig = lensPath(['originalGrants', entity]);
          return [
            set(lens, grantsResponse[entity]),
            set(lensOrig, grantsResponse[entity]),
          ];
        })
        updateFns = flatten(updateFns);
        /* apply all of them at once */
        if (updateFns.length) {
          this.setState((compose as any)(...updateFns));
        }
        this.setState(compose(
          set(lensPath(['success', 'specific']),
            'Successfully updated Entity-Specific Grants'),
          set(lensPath(['saving', 'entity']), false),
        ));
      })
      .catch((errResponse) => {
        this.setState({
          errors: pathOr(
            [{ reason: 
              'Error while updating Entity-Specific Grants for this user. Try again later'}],
            ['response', 'data', 'errors'],
            errResponse,
          ),
        })
        this.setState(set(lensPath(['saving', 'entity']), false));
        scrollErrorIntoView();
      });
  }

  cancelPermsType = (type: string) => () => {
    const { grants, originalGrants } = this.state;
    if (!grants || !originalGrants) { return; }

    if (type === 'global') {
      this.setState(set(lensPath(['grants', 'global']), originalGrants.global));
      return;
    }

    if (type === 'entity') {
      /* build array of update fns */
      const updateFns = this.entityPerms.map((entity) => {
        const lens = lensPath(['grants', entity]);
        return set(lens, originalGrants[entity]);
      })
      /* apply all of them at once */
      if (updateFns.length) {
        this.setState((compose as any)(...updateFns));
      }
      return;
    }
  }

  onChangeRestricted = () => {
    const { username } = this.props;
    this.setState({
      errors: [],
      loadingGrants: true,
    })
    if (username) {
      updateUser(username, { restricted: !this.state.restricted })
        .then((user) => {
          this.setState({
            restricted: user.restricted,
            success: undefined,
          })
        })
        .then(() => {
          /* unconditionally sets this.state.loadingGrants to false */
          this.getUserGrants()
        })
        .catch((errResponse) => {
          this.setState({
            errors: [{
              reason: 'Error when updating user restricted status. Please try again later.'
            }],
          })
        })
    }
  }

  globalPermOnChange = (perm: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const lp = lensPath(['grants', 'global', perm]);
    this.setState(set(lp, e.target.checked));
  }

  renderGlobalPerm = (perm: string, checked: boolean) => {
    const { classes } = this.props;
    const permDescriptionMap = {
      add_linodes: 'Can add Linodes to this Account ($)',
      add_nodebalancers: 'Can add NodeBalancers to this Account ($)',
      add_longview: 'Can add Longview clients to this Account',
      longview_subscription: 'Can modify this account\'s Longview subscription ($)',
      add_domains: 'Can add Domains using the DNS Manager',
      add_stackscripts: 'Can create StackScripts under this account',
      add_images: 'Can create frozen Images under this account',
      add_volumes: 'Can add Block Storage Volumes to this account ($)',
      cancel_account: 'Can cancel the entire account',
    }
    return (
      <React.Fragment key={perm}>
        <FormControlLabel
          className={classes.globalRow}
          label={permDescriptionMap[perm]}
          control={
            <Toggle
              checked={checked}
              onChange={this.globalPermOnChange(perm)}
            />
          }
        />
        <Divider />
      </React.Fragment>
    );
  }

  billingPermOnClick = (value: string | null) => () => {
    const lp = lensPath(['grants', 'global', 'account_access']);
    this.setState(set(lp, value));
  }

  renderBillingPerm = () => {
    const { classes } = this.props;
    const { grants } = this.state;
    if (!(grants && grants.global)) { return null; }
    return (
      <div className={classes.section}>
        <Grid container className={classes.section}>
          <Grid item>
            <Typography variant="subheading">
              Billing Access
            </Typography>
          </Grid>
        </Grid>
        <Grid container className={classes.section}>
          <SelectionCard
            heading="None"
            subheadings={['The user cannot view any billing information.']}
            checked={grants.global.account_access === null}
            onClick={this.billingPermOnClick(null)}
          />
          <SelectionCard
            heading="Read Only"
            subheadings={['Can view invoices, view billing info, and will receive copies of all invoices and payment emails.']}
            checked={grants.global.account_access === 'read_only'}
            onClick={this.billingPermOnClick('read_only')}
          />
          <SelectionCard
            heading="Read-Write"
            subheadings={['Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails']}
            checked={grants.global.account_access === 'read_write'}
            onClick={this.billingPermOnClick('read_write')}
          />
        </Grid>
      </div>
    );
  }
  
  renderActions = (
    onConfirm: () => void,
    onCancel: () => void,
    loading: boolean,
  ) => {
    const { classes } = this.props;
    return (
      <ActionsPanel className={classes.section}>
        <Button
          type="primary"
          loading={loading}
          onClick={onConfirm}
        >
          Save
        </Button>
        <Button
          type="cancel"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
  }

  renderGlobalPerms = () => {
    const { classes } = this.props;
    const { grants, success, saving } = this.state;
    return (
      <Paper className={classes.globalSection}>
        <Typography variant="title">
          Global Permissions
        </Typography>
        {success && success.global &&
          <Notice success text={success.global} className={classes.section}/>
        }
        <div className={classes.section}>
          {grants && grants.global &&
            this.globalBooleanPerms
              .map((perm) => this.renderGlobalPerm(perm, grants.global[perm] as boolean))
          }
        </div>
        {this.renderBillingPerm()}
        {this.renderActions(
          this.savePermsType('global'),
          this.cancelPermsType('global'),
          saving.global
        )}
      </Paper>
    )
  }

  entityIsAll = (entity: string, value: Linode.GrantLevel): boolean => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) { return false; }
    return grants[entity].reduce((acc: boolean, grant: Linode.Grant) => {
      return acc && grant.permissions === value;
    }, true);
  }

  entitySetAllTo = (entity: string, value: Linode.GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) { return; }
    /* map entities to an array of state update functions */
    const updateFns = grants[entity].map((grant, idx) => {
      const lens = lensPath(['grants', entity, idx, 'permissions'])
      return set(lens, value);
    });
    /* compose all of the update functions and setState */
    if (updateFns.length) {
      this.setState((compose as any)(...updateFns));
    }
  }

  setGrantTo = (entity: string, idx: number, value: Linode.GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) { return; }
    this.setState(set(
      lensPath(['grants', entity, idx, 'permissions']),
      value
    ));
  }

  renderEntitySection = (entity: string) => {
    const { classes } = this.props;
    const { grants } = this.state;
    if (!(grants && grants[entity] && grants[entity].length)) { return null; }
    const entityGrants = grants[entity];

    const entityNameMap = {
      linode: 'Linodes',
      stackscript: 'StackScripts',
      image: 'Images',
      volume: 'Volumes',
      nodebalancer: 'NodeBalancers',
      domain: 'Domains',
      longview: 'Longview Clients',
    };

    return (
      <div key={entity} className={classes.section}>
        <Typography variant="subheading" className={classes.tableSubheading}>
          {entityNameMap[entity]}
        </Typography>
        <Table className={classes.grantTable}>
          <TableHead data-qa-table-head>
            <TableRow>
              <TableCell>
                Label
              </TableCell>
              <TableCell
                padding="checkbox"
              >
                <label className={classes.selectAll} style={{ marginLeft: -35 }}>
                  None
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, null)}
                    value="null"
                    onChange={this.entitySetAllTo(entity, null)}
                  />
                </label>
              </TableCell>
              <TableCell
                padding="checkbox"
              >
                <label className={classes.selectAll} style={{ marginLeft: -65 }}>
                  Read Only
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_only')}
                    value="read_only"
                    onChange={this.entitySetAllTo(entity, 'read_only')}
                  />
                </label>
              </TableCell>
              <TableCell
                padding="checkbox"
              >
                <label className={classes.selectAll} style={{ marginLeft: -73 }}>
                  Read-Write
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_write')}
                    value="read_write"
                    onChange={this.entitySetAllTo(entity, 'read_write')}
                  />
                </label>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entityGrants.map((grant, idx) => {
              return (
                <TableRow key={grant.id}>
                  <TableCell>
                    {grant.label}
                  </TableCell>
                  <TableCell
                    padding="checkbox"
                  >
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === null}
                      value="null"
                      onChange={this.setGrantTo(entity, idx, null)}
                    />
                  </TableCell>
                  <TableCell
                    padding="checkbox"
                  >
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_only'}
                      value="read_only"
                      onChange={this.setGrantTo(entity, idx, 'read_only')}
                    />
                  </TableCell>
                  <TableCell
                    padding="checkbox"
                  >
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_write'}
                      value="read_write"
                      onChange={this.setGrantTo(entity, idx, 'read_write')}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  setAllEntitiesTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'null' ? null : e.target.value;
    this.entityPerms.map(entity =>
      this.entitySetAllTo(entity, value as Linode.GrantLevel)());
    this.setState({
      setAllPerm: e.target.value as 'null' | 'read_only' | 'read_write',
    })
  }
  
  renderSpecificPerms = () => {
    const { classes } = this.props;
    const { grants, success, setAllPerm, saving } = this.state;
    return (
      <Paper className={classes.globalSection}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="title">
              Specific Grants
            </Typography>
          </Grid>
          <Grid item>
            <Grid container justify="flex-end" alignItems="center">
              <Grid item>
                Set all Grants to:
              </Grid>
              <Grid item>
                <Select
                  value={setAllPerm}
                  onChange={this.setAllEntitiesTo}
                  inputProps={{ name: 'setall', id: 'setall' }}
                >
                  <MenuItem value="null">
                    None
                  </MenuItem>
                  <MenuItem value="read_only">
                    Read Only
                  </MenuItem>
                  <MenuItem value="read_write">
                    Read Write
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div className={classes.section}>
          {grants &&
            this.entityPerms.map((entity) => {
              return this.renderEntitySection(entity);
            })
          }
        </div>
        {success && success.specific &&
          <Notice success text={success.specific} className={classes.section}/>
        }
        {this.renderActions(
          this.saveSpecificGrants,
          this.cancelPermsType('entity'),
          saving.entity
        )}
      </Paper>
    )
  }

  renderPermissions = () => {
    const { loadingGrants } = this.state;
    if (loadingGrants) {
      return <CircleProgress />;
    } else {
      return (
        <React.Fragment>
          {this.renderGlobalPerms()}
          {this.renderSpecificPerms()}
        </React.Fragment>
      )
    }
  }

  renderUnrestricted = () => {
    const { classes } = this.props;
    /* TODO: render all permissions disabled with this message above */
    return (
      <Paper className={classes.unrestrictedRoot}>
        <Typography>
          This user has unrestricted access to the account.
        </Typography>
      </Paper>
    );
  }

  renderBody = () => {
    const { classes } = this.props;
    const { restricted, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor({ restricted: "Restricted" }, errors,)
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError &&
          <Notice error text={generalError} />
        }
        <Grid container className={`${classes.topGrid} ${'py0'}`} justify="space-between" alignItems="center">
          <Grid item className={classes.titleWrapper}>
            <Typography variant="title">
              Update User Permissions
            </Typography>
          </Grid>
          <Grid item className="p0">
            <Grid container alignItems="center">
              <Grid item>
                <Typography variant="title">
                  Restrict Access:
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="title">
                  {restricted
                    ? 'On'
                    : 'Off'
                  }
                </Typography>
              </Grid>
              <Grid item>
                <Toggle
                  checked={restricted}
                  onChange={this.onChangeRestricted}
                  className={classes.toggle}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {restricted
          ? this.renderPermissions()
          : this.renderUnrestricted()
        }
      </React.Fragment>
    );
  }

  render() {
    const { loading } = this.state;
    return (
      <React.Fragment>
        {loading
          ? <CircleProgress />
          : this.renderBody()
        }
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserPermissions);
