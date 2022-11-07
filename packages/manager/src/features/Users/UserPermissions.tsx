import {
  getGrants,
  Grant,
  GrantLevel,
  Grants,
  GrantType,
  updateGrants,
  updateUser,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { compose, flatten, lensPath, omit, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';
import Toggle from 'src/components/Toggle';
import { queryClient } from 'src/queries/base';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  entityNameMap,
  UserPermissionsEntitySection,
} from './UserPermissionsEntitySection';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Tab from 'src/components/core/ReachTab';
import SafeTabPanel from 'src/components/SafeTabPanel/SafeTabPanel';
import TabList from 'src/components/core/ReachTabList';
import { withSnackbar, WithSnackbarProps } from 'notistack';

type ClassNames =
  | 'title'
  | 'toggle'
  | 'unrestrictedRoot'
  | 'globalSection'
  | 'globalRow'
  | 'section'
  | 'setAll';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      [theme.breakpoints.down('sm')]: {
        paddingLeft: theme.spacing(),
      },
    },
    toggle: {
      marginRight: 3,
    },
    unrestrictedRoot: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(3),
    },
    globalSection: {
      marginTop: theme.spacing(2),
    },
    globalRow: {
      padding: `${theme.spacing(1)}px 0`,
    },
    section: {
      marginTop: theme.spacing(2),
      paddingBottom: 0,
    },
    setAll: {
      '& > div': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
      '& label': {
        marginTop: 6,
      },
      '& .react-select__menu, & .input': {
        width: 125,
        right: 0,
        marginLeft: theme.spacing(1),
        textAlign: 'left',
      },
      '& .react-select__menu-list': {
        width: '100%',
      },
    },
  });

interface Props {
  username?: string;
  currentUser?: string;
  clearNewUser: () => void;
}

interface TabInfo {
  showTabs: boolean;
  tabs: string[];
}

interface State {
  loading: boolean;
  /* need this separated so we can show just the restricted toggle when it's in use */
  loadingGrants: boolean;
  isSavingGlobal: boolean;
  isSavingEntity: boolean;
  grants?: Grants;
  originalGrants?: Grants /* used to implement cancel functionality */;
  restricted?: boolean;
  errors?: APIError[];
  /* null needs to be a string here because it's a Select value */
  setAllPerm: 'null' | 'read_only' | 'read_write';
  /* Large Account Support */
  showTabs?: boolean;
  tabs?: string[];
}

type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

class UserPermissions extends React.Component<CombinedProps, State> {
  state: State = {
    loadingGrants: false,
    loading: true,
    setAllPerm: 'null',
    isSavingGlobal: false,
    isSavingEntity: false,
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
    'add_firewalls',
    'cancel_account',
  ];

  entityPerms: GrantType[] = [
    'linode',
    'firewall',
    'stackscript',
    'image',
    'volume',
    'nodebalancer',
    'domain',
    'longview',
  ];

  getTabInformation = (grants: Grants) =>
    this.entityPerms.reduce(
      (acc: TabInfo, entity: GrantType) => {
        const grantsForEntity = grants[entity];
        if (grantsForEntity.length > 25) {
          return { showTabs: true, tabs: [...acc.tabs, entity] };
        }
        if (grantsForEntity.length > 0) {
          return { ...acc, tabs: [...acc.tabs, entity] };
        }
        return acc;
      },
      { tabs: [], showTabs: false }
    );

  getUserGrants = () => {
    const { username } = this.props;
    if (username) {
      getGrants(username)
        .then((grants) => {
          if (grants.global) {
            const { showTabs, tabs } = this.getTabInformation(grants);

            this.setState({
              grants,
              originalGrants: grants,
              loading: false,
              loadingGrants: false,
              restricted: true,
              showTabs,
              tabs,
            });
          } else {
            this.setState({
              grants,
              loading: false,
              loadingGrants: false,
              restricted: false,
            });
          }
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Unknown error occurred while fetching user permissions. Try again later.'
            ),
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
    this.setState({ errors: undefined });
    const { username, clearNewUser } = this.props;
    const { grants } = this.state;
    if (!username || !(grants && grants[type])) {
      return this.setState({
        errors: [
          {
            reason: `Can\'t set ${type} permissions at this time. Please try again later`,
          },
        ],
      });
    }

    clearNewUser();

    if (type === 'global') {
      this.setState({ isSavingGlobal: true });
      updateGrants(username, { global: grants.global })
        .then((grantsResponse) => {
          this.setState(
            compose(
              set(lensPath(['grants', 'global']), grantsResponse.global),
              set(lensPath(['originalGrants', 'global']), grantsResponse.global)
            )
          );

          // In the chance a new type entity was added to the account, re-calculate what tabs need to be shown.
          const { tabs } = this.getTabInformation(grantsResponse);
          this.setState({ isSavingGlobal: false, tabs });

          this.props.enqueueSnackbar('Successfully saved global permissions', {
            variant: 'success',
          });
        })
        .catch((errResponse) => {
          this.setState({
            isSavingGlobal: false,
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            ),
          });
          scrollErrorIntoView();
        });
    }

    /* This is where individual entity saving could be implemented */
  };

  saveSpecificGrants = () => {
    this.setState({ errors: undefined, isSavingEntity: true });
    const { username } = this.props;
    const { grants } = this.state;
    if (!username || !grants) {
      return this.setState({
        isSavingEntity: false,
        errors: [
          {
            reason: `Can\'t set entity-specific permissions at this time. Please try again later`,
          },
        ],
      });
    }

    // You would think ramda could do a TS omit, but I guess not
    const requestPayload = omit(['global'], grants) as Omit<Grants, 'global'>;
    updateGrants(username, requestPayload)
      .then((grantsResponse) => {
        /* build array of update fns */
        let updateFns = this.entityPerms.map((entity) => {
          const lens = lensPath(['grants', entity]);
          const lensOrig = lensPath(['originalGrants', entity]);
          return [
            set(lens, grantsResponse[entity]),
            set(lensOrig, grantsResponse[entity]),
          ];
        });
        updateFns = flatten(updateFns);
        /* apply all of them at once */
        if (updateFns.length) {
          this.setState((compose as any)(...updateFns));
        }
        this.props.enqueueSnackbar(
          'Successfully saved entity-specific permissions',
          { variant: 'success' }
        );
        // In the chance a new type entity was added to the account, re-calculate what tabs need to be shown.
        const { tabs } = this.getTabInformation(grantsResponse);
        this.setState({ isSavingEntity: false, tabs });
      })
      .catch((errResponse) => {
        this.setState({
          isSavingEntity: false,
          errors: getAPIErrorOrDefault(
            errResponse,
            'Error while updating entity-specific permissions for this user. Please try again later'
          ),
        });
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
      const updateFns = this.entityPerms.map((entity) => {
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
      loadingGrants: true,
    });
    if (username) {
      updateUser(username, { restricted: !this.state.restricted })
        .then((user) => {
          this.setState({
            restricted: user.restricted,
          });
        })
        .then(() => {
          // unconditionally sets this.state.loadingGrants to false
          this.getUserGrants();
          // refresh the data on /account/users so it is accurate
          queryClient.invalidateQueries('account-users');
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error when updating user restricted status. Please try again later.'
            ),
            loadingGrants: false,
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
        'Can modify this account\u{2019}s Longview subscription ($)',
      add_domains: 'Can add Domains using the DNS Manager',
      add_stackscripts: 'Can create StackScripts under this account',
      add_images: 'Can create frozen Images under this account ($)',
      add_volumes: 'Can add Block Storage Volumes to this account ($)',
      add_firewalls: 'Can add Firewalls to this account',
      cancel_account: 'Can cancel the entire account',
    };
    return (
      <Grid item key={perm} xs={12} sm={6} className="py0">
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
      </Grid>
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
            subheadings={['Can view invoices and billing info.']}
            checked={grants.global.account_access === 'read_only'}
            onClick={this.billingPermOnClick('read_only')}
            data-qa-billing-access="Read Only"
          />
          <SelectionCard
            heading="Read-Write"
            subheadings={[
              'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails.',
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
      <ActionsPanel
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        className={classes.section}
      >
        <Button buttonType="secondary" onClick={onCancel} data-qa-cancel>
          Reset
        </Button>
        <Button
          buttonType="primary"
          onClick={onConfirm}
          loading={loading}
          data-qa-submit
        >
          Save
        </Button>
      </ActionsPanel>
    );
  };

  renderGlobalPerms = () => {
    const { classes } = this.props;
    const { grants, isSavingGlobal } = this.state;
    return (
      <Paper className={classes.globalSection} data-qa-global-section>
        <Typography
          variant="h2"
          data-qa-permissions-header="Global Permissions"
        >
          Global Permissions
        </Typography>
        <Grid container className={classes.section}>
          {grants &&
            grants.global &&
            this.globalBooleanPerms
              /**
               * filtering out cancel_account because we're not observing
               * this permission in Cloud or APIv4. Either the user is unrestricted
               * and can cancel the account or is restricted and cannot cancel.
               */
              .filter((eachPerm) => eachPerm !== 'cancel_account')
              .map((perm) =>
                this.renderGlobalPerm(perm, grants.global[perm] as boolean)
              )}
        </Grid>
        {this.renderBillingPerm()}
        {this.renderActions(
          this.savePermsType('global'),
          this.cancelPermsType('global'),
          isSavingGlobal
        )}
      </Paper>
    );
  };

  entityIsAll = (entity: string, value: GrantLevel): boolean => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return false;
    }
    return grants[entity].reduce((acc: boolean, grant: Grant) => {
      return acc && grant.permissions === value;
    }, true);
  };

  entitySetAllTo = (entity: GrantType, value: GrantLevel) => () => {
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

  setGrantTo = (entity: string, idx: number, value: GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    this.setState(set(lensPath(['grants', entity, idx, 'permissions']), value));
  };

  setAllEntitiesTo = (e: Item) => {
    const value = e.value === 'null' ? null : e.value;
    this.entityPerms.map((entity: GrantType) =>
      this.entitySetAllTo(entity, value as GrantLevel)()
    );
    this.setState({
      setAllPerm: e.value as 'null' | 'read_only' | 'read_write',
    });
  };

  renderSpecificPerms = () => {
    const { classes } = this.props;
    const { grants, setAllPerm, isSavingEntity } = this.state;

    const permOptions = [
      { label: 'None', value: 'null' },
      { label: 'Read Only', value: 'read_only' },
      { label: 'Read Write', value: 'read_write' },
    ];

    const defaultPerm = permOptions.find((eachPerm) => {
      return eachPerm.value === setAllPerm;
    });

    return (
      <Paper className={classes.globalSection} data-qa-entity-section>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography
              variant="h2"
              data-qa-permissions-header="Specific Permissions"
            >
              Specific Permissions
            </Typography>
          </Grid>

          <Grid item style={{ marginTop: 5 }}>
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
              small
            />
          </Grid>
        </Grid>
        <div className={classes.section}>
          {this.state.showTabs ? (
            <Tabs>
              <TabList>
                {this.state.tabs?.map((entity) => (
                  <Tab key={`${entity}-tab`}>{entityNameMap[entity]}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {this.state.tabs?.map((entity: GrantType, idx) => (
                  <SafeTabPanel key={`${entity}-tab-content`} index={idx}>
                    <UserPermissionsEntitySection
                      key={entity}
                      grants={this.state.grants?.[entity]}
                      entity={entity}
                      setGrantTo={this.setGrantTo}
                      entitySetAllTo={this.entitySetAllTo}
                    />
                  </SafeTabPanel>
                ))}
              </TabPanels>
            </Tabs>
          ) : (
            grants &&
            this.entityPerms.map((entity: GrantType) => (
              <UserPermissionsEntitySection
                key={entity}
                grants={this.state.grants?.[entity]}
                entity={entity}
                setGrantTo={this.setGrantTo}
                entitySetAllTo={this.entitySetAllTo}
                showHeading
              />
            ))
          )}
        </div>
        {this.renderActions(
          this.saveSpecificGrants,
          this.cancelPermsType('entity'),
          isSavingEntity
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
            <Typography
              className={classes.title}
              variant="h2"
              data-qa-restrict-access={restricted}
            >
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

export default withSnackbar(styled(UserPermissions));
