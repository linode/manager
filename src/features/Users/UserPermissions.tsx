import { compose, flatten, lensPath, omit, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import SelectionCard from 'src/components/SelectionCard';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import Toggle from 'src/components/Toggle';
import { getGrants, updateGrants, updateUser } from 'src/services/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames =
  | 'titleWrapper'
  | 'toggle'
  | 'topGrid'
  | 'unrestrictedRoot'
  | 'globalSection'
  | 'globalRow'
  | 'section'
  | 'grantTable'
  | 'selectAll'
  | 'tableSubheading'
  | 'permSelect'
  | 'setAll';

const styles = (theme: Theme) =>
  createStyles({
  topGrid: {
    marginTop: theme.spacing(1)
  },
  titleWrapper: {
    marginTop: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center'
  },
  toggle: {
    marginRight: 3
  },
  permSelect: {
    width: 'auto',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end'
    }
  },
  unrestrictedRoot: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3)
  },
  globalSection: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3)
  },
  globalRow: {
    padding: `${theme.spacing(1)}px 0`
  },
  section: {
    marginTop: theme.spacing(2),
    paddingBottom: 0
  },
  grantTable: {
    '& th': {
      width: '25%',
      minWidth: 150
    }
  },
  tableSubheading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  selectAll: {
    cursor: 'pointer'
  },
  setAll: {
    width: 300,
    marginTop: theme.spacing(1) / 2,
    '& .react-select__menu': {
      maxWidth: 153,
      right: 0
    }
  }
});

interface Props {
  username?: string;
  currentUser?: string;
  clearNewUser: () => void;
}

interface State {
  loading: boolean;
  /* need this separated so we can show just the restricted toggle when it's in use */
  loadingGrants: boolean;
  saving: {
    [key: string]: boolean;
  };
  grants?: Linode.Grants;
  originalGrants?: Linode.Grants /* used to implement cancel functionality */;
  restricted?: boolean;
  errors?: Linode.ApiFieldError[];
  success?: {
    global: string;
    specific: string;
  };
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
      entity: false
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
    'longview'
  ];

  getUserGrants = () => {
    const { username } = this.props;
    if (username) {
      getGrants(username)
        .then(grants => {
          if (grants.global) {
            this.setState({
              grants,
              originalGrants: grants,
              loading: false,
              loadingGrants: false,
              restricted: true
            });
          } else {
            this.setState({
              grants,
              loading: false,
              loadingGrants: false,
              restricted: false
            });
          }
        })
        .catch(errResponse => {
          this.setState({
            errors: [
              {
                reason:
                  'Unknown error occured while fetching user permissions. Try again later.'
              }
            ]
          });
          scrollErrorIntoView();
        });
    }
  };

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
          {
            reason: `Can\'t set ${type} permissions at this time. Please try again later`
          }
        ]
      });
    }

    clearNewUser();

    if (type === 'global') {
      this.setState(
        compose(
          set(lensPath(['success', 'global']), ''),
          set(lensPath(['saving', 'global']), true)
        )
      );
      updateGrants(username, { global: grants.global } as Partial<
        Linode.Grants
      >)
        .then(grantsResponse => {
          this.setState(
            compose(
              set(lensPath(['grants', 'global']), grantsResponse.global),
              set(
                lensPath(['originalGrants', 'global']),
                grantsResponse.global
              ),
              set(
                lensPath(['success', 'global']),
                'Successfully updated global permissions'
              ),
              set(lensPath(['saving', 'global']), false)
            )
          );
        })
        .catch(errResponse => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            )
          });
          this.setState(set(lensPath(['saving', 'global']), false));
          scrollErrorIntoView();
        });
      return;
    }

    /* This is where individual entity saving could be implemented */
  };

  saveSpecificGrants = () => {
    const { username } = this.props;
    const { grants } = this.state;
    if (!username || !grants) {
      return this.setState({
        errors: [
          {
            reason: `Can\'t set entity-specific permissions at this time. Please try again later`
          }
        ]
      });
    }

    this.setState(
      compose(
        set(lensPath(['success', 'specific']), ''),
        set(lensPath(['saving', 'entity']), true)
      )
    );
    const requestPayload = omit(['global'], grants);
    updateGrants(username, requestPayload as Partial<Linode.Grants>)
      .then(grantsResponse => {
        /* build array of update fns */
        let updateFns = this.entityPerms.map(entity => {
          const lens = lensPath(['grants', entity]);
          const lensOrig = lensPath(['originalGrants', entity]);
          return [
            set(lens, grantsResponse[entity]),
            set(lensOrig, grantsResponse[entity])
          ];
        });
        updateFns = flatten(updateFns);
        /* apply all of them at once */
        if (updateFns.length) {
          this.setState((compose as any)(...updateFns));
        }
        this.setState(
          compose(
            set(
              lensPath(['success', 'specific']),
              'Successfully updated entity-specific permissions'
            ),
            set(lensPath(['saving', 'entity']), false)
          )
        );
      })
      .catch(errResponse => {
        this.setState({
          errors: getAPIErrorOrDefault(
            errResponse,
            'Error while updating entity-specific permissions for this user. Please try again later'
          )
        });
        this.setState(set(lensPath(['saving', 'entity']), false));
        scrollErrorIntoView();
      });
  };

  cancelPermsType = (type: string) => () => {
    const { grants, originalGrants } = this.state;
    if (!grants || !originalGrants) {
      return;
    }

    if (type === 'global') {
      this.setState(set(lensPath(['grants', 'global']), originalGrants.global));
      return;
    }

    if (type === 'entity') {
      /* build array of update fns */
      const updateFns = this.entityPerms.map(entity => {
        const lens = lensPath(['grants', entity]);
        return set(lens, originalGrants[entity]);
      });
      /* apply all of them at once */
      if (updateFns.length) {
        this.setState((compose as any)(...updateFns));
      }
      return;
    }
  };

  onChangeRestricted = () => {
    const { username } = this.props;
    this.setState({
      errors: [],
      loadingGrants: true
    });
    if (username) {
      updateUser(username, { restricted: !this.state.restricted })
        .then(user => {
          this.setState({
            restricted: user.restricted,
            success: undefined
          });
        })
        .then(() => {
          /* unconditionally sets this.state.loadingGrants to false */
          this.getUserGrants();
        })
        .catch(errResponse => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error when updating user restricted status. Please try again later.'
            ),
            loadingGrants: false
          });
        });
    }
  };

  globalPermOnChange = (perm: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const lp = lensPath(['grants', 'global', perm]);
    this.setState(set(lp, e.target.checked));
  };

  renderGlobalPerm = (perm: string, checked: boolean) => {
    const { classes } = this.props;
    const permDescriptionMap = {
      add_linodes: 'Can add Linodes to this account ($)',
      add_nodebalancers: 'Can add NodeBalancers to this account ($)',
      add_longview: 'Can add Longview clients to this account',
      longview_subscription:
        "Can modify this account's Longview subscription ($)",
      add_domains: 'Can add Domains using the DNS Manager',
      add_stackscripts: 'Can create StackScripts under this account',
      add_images: 'Can create frozen Images under this account',
      add_volumes: 'Can add Block Storage Volumes to this account ($)',
      cancel_account: 'Can cancel the entire account'
    };
    return (
      <React.Fragment key={perm}>
        <FormControlLabel
          className={classes.globalRow}
          label={permDescriptionMap[perm]}
          control={
            <Toggle
              checked={checked}
              onChange={this.globalPermOnChange(perm)}
              data-qa-global-permission={perm}
            />
          }
        />
        <Divider />
      </React.Fragment>
    );
  };

  billingPermOnClick = (value: string | null) => () => {
    const lp = lensPath(['grants', 'global', 'account_access']);
    this.setState(set(lp, value));
  };

  renderBillingPerm = () => {
    const { classes } = this.props;
    const { grants } = this.state;
    if (!(grants && grants.global)) {
      return null;
    }
    return (
      <div className={classes.section}>
        <Grid container className={classes.section} data-qa-billing-section>
          <Grid item>
            <Typography variant="h3" data-qa-permissions-header="billing">
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
            data-qa-billing-access="None"
          />
          <SelectionCard
            heading="Read Only"
            subheadings={[
              'Can view invoices, view billing info, and will receive copies of all invoices and payment emails.'
            ]}
            checked={grants.global.account_access === 'read_only'}
            onClick={this.billingPermOnClick('read_only')}
            data-qa-billing-access="Read Only"
          />
          <SelectionCard
            heading="Read-Write"
            subheadings={[
              'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails'
            ]}
            checked={grants.global.account_access === 'read_write'}
            onClick={this.billingPermOnClick('read_write')}
            data-qa-billing-access="Read-Write"
          />
        </Grid>
      </div>
    );
  };

  renderActions = (
    onConfirm: () => void,
    onCancel: () => void,
    loading: boolean
  ) => {
    const { classes } = this.props;
    return (
      <ActionsPanel className={classes.section}>
        <Button
          type="primary"
          loading={loading}
          onClick={onConfirm}
          data-qa-submit
        >
          Save
        </Button>
        <Button type="cancel" onClick={onCancel} data-qa-cancel>
          Cancel
        </Button>
      </ActionsPanel>
    );
  };

  renderGlobalPerms = () => {
    const { classes } = this.props;
    const { grants, success, saving } = this.state;
    return (
      <Paper className={classes.globalSection} data-qa-global-section>
        <Typography
          variant="h2"
          data-qa-permissions-header="Global Permissions"
        >
          Global Permissions
        </Typography>
        {success && success.global && (
          <Notice
            success
            text={success.global}
            className={classes.section}
            spacingTop={8}
          />
        )}
        <div className={classes.section}>
          {grants &&
            grants.global &&
            this.globalBooleanPerms.map(perm =>
              this.renderGlobalPerm(perm, grants.global[perm] as boolean)
            )}
        </div>
        {this.renderBillingPerm()}
        {this.renderActions(
          this.savePermsType('global'),
          this.cancelPermsType('global'),
          saving.global
        )}
      </Paper>
    );
  };

  entityIsAll = (entity: string, value: Linode.GrantLevel): boolean => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return false;
    }
    return grants[entity].reduce((acc: boolean, grant: Linode.Grant) => {
      return acc && grant.permissions === value;
    }, true);
  };

  entitySetAllTo = (
    entity: Linode.GrantType,
    value: Linode.GrantLevel
  ) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    /* map entities to an array of state update functions */
    const updateFns = grants[entity].map((grant, idx) => {
      const lens = lensPath(['grants', entity, idx, 'permissions']);
      return set(lens, value);
    });
    /* compose all of the update functions and setState */
    if (updateFns.length) {
      this.setState((compose as any)(...updateFns));
    }
  };

  setGrantTo = (
    entity: string,
    idx: number,
    value: Linode.GrantLevel
  ) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    this.setState(set(lensPath(['grants', entity, idx, 'permissions']), value));
  };

  renderEntitySection = (entity: Linode.GrantType) => {
    const { classes } = this.props;
    const { grants } = this.state;
    if (!(grants && grants[entity] && grants[entity].length)) {
      return null;
    }
    const entityGrants = grants[entity];

    const entityNameMap = {
      linode: 'Linodes',
      stackscript: 'StackScripts',
      image: 'Images',
      volume: 'Volumes',
      nodebalancer: 'NodeBalancers',
      domain: 'Domains',
      longview: 'Longview Clients'
    };

    return (
      <div key={entity} className={classes.section}>
        <Typography
          variant="h3"
          className={classes.tableSubheading}
          data-qa-permissions-header={entityNameMap[entity]}
        >
          {entityNameMap[entity]}
        </Typography>
        <Table aria-label="User Permissions" className={classes.grantTable}>
          <TableHead data-qa-table-head>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell padding="checkbox">
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -35 }}
                >
                  None
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, null)}
                    value="null"
                    onChange={this.entitySetAllTo(entity, null)}
                    data-qa-permission-header="None"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -65 }}
                >
                  Read Only
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_only')}
                    value="read_only"
                    onChange={this.entitySetAllTo(entity, 'read_only')}
                    data-qa-permission-header="Read Only"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -73 }}
                >
                  Read-Write
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_write')}
                    value="read_write"
                    onChange={this.entitySetAllTo(entity, 'read_write')}
                    data-qa-permission-header="Read-Write"
                  />
                </label>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entityGrants.map((grant, idx) => {
              return (
                <TableRow key={grant.id} data-qa-specific-grant={grant.label}>
                  <TableCell parentColumn="Label">{grant.label}</TableCell>
                  <TableCell parentColumn="None" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === null}
                      value="null"
                      onChange={this.setGrantTo(entity, idx, null)}
                      data-qa-permission="None"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read Only" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_only'}
                      value="read_only"
                      onChange={this.setGrantTo(entity, idx, 'read_only')}
                      data-qa-permission="Read Only"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read-Write" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_write'}
                      value="read_write"
                      onChange={this.setGrantTo(entity, idx, 'read_write')}
                      data-qa-permission="Read-Write"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  setAllEntitiesTo = (e: Item) => {
    const value = e.value === 'null' ? null : e.value;
    this.entityPerms.map((entity: Linode.GrantType) =>
      this.entitySetAllTo(entity, value as Linode.GrantLevel)()
    );
    this.setState({
      setAllPerm: e.value as 'null' | 'read_only' | 'read_write'
    });
  };

  renderSpecificPerms = () => {
    const { classes } = this.props;
    const { grants, success, setAllPerm, saving } = this.state;

    const permOptions = [
      { label: 'None', value: 'null' },
      { label: 'Read Only', value: 'read_only' },
      { label: 'Read Write', value: 'read_write' }
    ];

    const defaultPerm = permOptions.find(eachPerm => {
      return eachPerm.value === setAllPerm;
    });

    return (
      <Paper className={classes.globalSection} data-qa-entity-section>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography
              variant="h2"
              data-qa-permissions-header="Specific Permissions"
            >
              Specific Permissions
            </Typography>
          </Grid>

          <Grid item>
            <Select
              options={permOptions}
              defaultValue={defaultPerm}
              onChange={this.setAllEntitiesTo}
              name="setall"
              id="setall"
              label="Set all permissions to:"
              isClearable={false}
              inline
              className={classes.setAll}
              noMarginTop
            />
          </Grid>
        </Grid>
        <div className={classes.section}>
          {grants &&
            this.entityPerms.map((entity: Linode.GrantType) => {
              return this.renderEntitySection(entity);
            })}
        </div>
        {success && success.specific && (
          <Notice
            success
            text={success.specific}
            className={classes.section}
            spacingTop={8}
          />
        )}
        {this.renderActions(
          this.saveSpecificGrants,
          this.cancelPermsType('entity'),
          saving.entity
        )}
      </Paper>
    );
  };

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
      );
    }
  };

  renderUnrestricted = () => {
    const { classes } = this.props;
    /* TODO: render all permissions disabled with this message above */
    return (
      <Paper className={classes.unrestrictedRoot}>
        <Typography data-qa-unrestricted-msg>
          This user has unrestricted access to the account.
        </Typography>
      </Paper>
    );
  };

  renderBody = () => {
    const { classes, currentUser, username } = this.props;
    const { restricted, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError && <Notice error text={generalError} spacingTop={8} />}
        <Grid container alignItems="center" style={{ width: 'auto' }}>
          <Grid item>
            <Typography variant="h2" data-qa-restrict-access={restricted}>
              Full Account Access:
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h2">{!restricted ? 'On' : 'Off'}</Typography>
          </Grid>
          <Grid item>
            <Toggle
              tooltipText={
                username === currentUser
                  ? 'You cannot restrict the current active user.'
                  : ''
              }
              disabled={username === currentUser}
              checked={!restricted}
              onChange={this.onChangeRestricted}
              className={classes.toggle}
            />
          </Grid>
        </Grid>
        {restricted ? this.renderPermissions() : this.renderUnrestricted()}
      </React.Fragment>
    );
  };

  render() {
    const { loading } = this.state;
    const { username } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${username} - Permissions`} />
        {loading ? <CircleProgress /> : this.renderBody()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(UserPermissions);
