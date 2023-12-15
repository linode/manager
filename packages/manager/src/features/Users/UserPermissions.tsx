import {
  Grant,
  GrantLevel,
  GrantType,
  Grants,
  getGrants,
  updateGrants,
  updateUser,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { WithSnackbarProps, withSnackbar } from 'notistack';
import { compose, flatten, lensPath, omit, set } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Item } from 'src/components/EnhancedSelect/Select';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import withFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { StyledDivWrapper, StyledSelect } from './UserPermissions.styles';
import {
  UserPermissionsEntitySection,
  entityNameMap,
} from './UserPermissionsEntitySection';
interface Props {
  clearNewUser: () => void;
  currentUser?: string;
  username?: string;
}

interface TabInfo {
  showTabs: boolean;
  tabs: string[];
}

interface State {
  errors?: APIError[];
  grants?: Grants;
  isSavingEntity: boolean;
  isSavingGlobal: boolean;
  loading: boolean;
  /* need this separated so we can show just the restricted toggle when it's in use */
  loadingGrants: boolean;
  originalGrants?: Grants /* used to implement cancel functionality */;
  restricted?: boolean;
  /* null needs to be a string here because it's a Select value */
  setAllPerm: 'null' | 'read_only' | 'read_write';
  /* Large Account Support */
  showTabs?: boolean;
  tabs?: string[];
  vpcEnabled: boolean;
}

type CombinedProps = Props &
  WithSnackbarProps &
  WithQueryClientProps &
  FeatureFlagConsumerProps;

class UserPermissions extends React.Component<CombinedProps, State> {
  componentDidMount() {
    this.getUserGrants();

    if (this.props.flags.vpc) {
      this.setState({ vpcEnabled: true });
      this.entityPerms.push('vpc');
      this.globalBooleanPerms.push('add_vpcs');
    }
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.username !== this.props.username) {
      this.getUserGrants();
    }
  }

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

  billingPermOnClick = (value: null | string) => () => {
    const lp = lensPath(['grants', 'global', 'account_access']);
    this.setState(set(lp, value));
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
    }
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

  entityPerms: GrantType[] = [
    'linode',
    'firewall',
    'stackscript',
    'image',
    'volume',
    'nodebalancer',
    'domain',
    'longview',
    'database',
  ];

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

  getTabInformation = (grants: Grants) =>
    this.entityPerms.reduce(
      (acc: TabInfo, entity: GrantType) => {
        const grantsForEntity = grants?.[entity];
        if (grantsForEntity?.length > 25) {
          return { showTabs: true, tabs: [...acc.tabs, entity] };
        }
        if (grantsForEntity?.length > 0) {
          return { ...acc, tabs: [...acc.tabs, entity] };
        }
        return acc;
      },
      { showTabs: false, tabs: [] }
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
              loading: false,
              loadingGrants: false,
              originalGrants: grants,
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
    'add_databases',
    'cancel_account',
  ];

  globalPermOnChange = (perm: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const lp = lensPath(['grants', 'global', perm]);
    this.setState(set(lp, e.target.checked));
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
          this.props.queryClient.invalidateQueries('account-users');
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

  renderActions = (
    onConfirm: () => void,
    onCancel: () => void,
    loading: boolean
  ) => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Save',
          loading,
          onClick: onConfirm,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Reset',
          onClick: onCancel,
        }}
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
        alignItems="center"
        display="flex"
        justifyContent="flex-end"
      />
    );
  };

  renderBillingPerm = () => {
    const { grants } = this.state;
    if (!(grants && grants.global)) {
      return null;
    }

    return (
      <StyledDivWrapper>
        <Grid
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
          container
          data-qa-billing-section
          spacing={2}
        >
          <Grid>
            <Typography data-qa-permissions-header="billing" variant="h3">
              Billing Access
            </Typography>
          </Grid>
        </Grid>
        <Grid
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
          container
          spacing={2}
        >
          <SelectionCard
            checked={grants.global.account_access === null}
            data-qa-billing-access="None"
            heading="None"
            onClick={this.billingPermOnClick(null)}
            subheadings={['The user cannot view any billing information.']}
          />
          <SelectionCard
            checked={grants.global.account_access === 'read_only'}
            data-qa-billing-access="Read Only"
            heading="Read Only"
            onClick={this.billingPermOnClick('read_only')}
            subheadings={['Can view invoices and billing info.']}
          />
          <SelectionCard
            subheadings={[
              'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails.',
            ]}
            checked={grants.global.account_access === 'read_write'}
            data-qa-billing-access="Read-Write"
            heading="Read-Write"
            onClick={this.billingPermOnClick('read_write')}
          />
        </Grid>
      </StyledDivWrapper>
    );
  };

  renderBody = () => {
    const { currentUser, username } = this.props;
    const { errors, restricted } = this.state;
    const hasErrorFor = getAPIErrorFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError && (
          <Notice spacingTop={8} text={generalError} variant="error" />
        )}
        <Paper>
          <Grid
            alignItems="center"
            container
            spacing={2}
            style={{ width: 'auto' }}
          >
            <Grid>
              <Typography
                sx={(theme) => ({
                  [theme.breakpoints.down('md')]: {
                    paddingLeft: theme.spacing(),
                  },
                })}
                data-qa-restrict-access={restricted}
                variant="h2"
              >
                General Permissions
              </Typography>
            </Grid>
            <Grid>
              <Toggle
                tooltipText={
                  username === currentUser
                    ? 'You cannot restrict the current active user.'
                    : ''
                }
                checked={!restricted}
                disabled={username === currentUser}
                onChange={this.onChangeRestricted}
                sx={{ marginRight: '3px' }}
              />
            </Grid>
            <Grid>
              <Typography variant="subtitle2">Full Account Access</Typography>
            </Grid>
          </Grid>
        </Paper>
        {restricted && this.renderPermissions()}
      </React.Fragment>
    );
  };

  renderGlobalPerm = (perm: string, checked: boolean) => {
    const permDescriptionMap = {
      add_databases: 'Can add Databases to this account ($)',
      add_domains: 'Can add Domains using the DNS Manager',
      add_firewalls: 'Can add Firewalls to this account',
      add_images: 'Can create frozen Images under this account ($)',
      add_linodes: 'Can add Linodes to this account ($)',
      add_longview: 'Can add Longview clients to this account',
      add_nodebalancers: 'Can add NodeBalancers to this account ($)',
      add_stackscripts: 'Can create StackScripts under this account',
      add_volumes: 'Can add Block Storage Volumes to this account ($)',
      cancel_account: 'Can cancel the entire account',
      child_account_access: 'Enable child account access',
      longview_subscription:
        'Can modify this account\u{2019}s Longview subscription ($)',
    };

    if (this.state.vpcEnabled) {
      permDescriptionMap['add_vpcs'] = 'Can add VPCs to this account';
    }

    return (
      <Grid className="py0" key={perm} sm={6} xs={12}>
        <FormControlLabel
          control={
            <Toggle
              checked={checked}
              data-qa-global-permission={perm}
              onChange={this.globalPermOnChange(perm)}
            />
          }
          sx={(theme) => ({
            padding: `${theme.spacing(1)} 0`,
          })}
          label={permDescriptionMap[perm]}
        />
        <Divider />
      </Grid>
    );
  };

  renderGlobalPerms = () => {
    const { grants, isSavingGlobal } = this.state;
    return (
      <Paper data-qa-global-section>
        <Typography
          data-qa-permissions-header="Global Permissions"
          variant="subtitle2"
        >
          Configure the specific rights and privileges this user has within the
          account. Remember that permissions related to actions with the '$'
          symbol may incur additional charges.
        </Typography>
        <Grid
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
          container
          spacing={2}
        >
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

  renderSpecificPerms = () => {
    const { grants, isSavingEntity, setAllPerm } = this.state;

    const permOptions = [
      { label: 'None', value: 'null' },
      { label: 'Read Only', value: 'read_only' },
      { label: 'Read Write', value: 'read_write' },
    ];

    const defaultPerm = permOptions.find((eachPerm) => {
      return eachPerm.value === setAllPerm;
    });

    return (
      <Paper
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
        data-qa-entity-section
      >
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid>
            <Typography
              data-qa-permissions-header="Specific Permissions"
              variant="h2"
            >
              Specific Permissions
            </Typography>
          </Grid>

          <Grid style={{ marginTop: 5 }}>
            <StyledSelect
              defaultValue={defaultPerm}
              id="setall"
              inline
              isClearable={false}
              label="Set all permissions to:"
              name="setall"
              noMarginTop
              onChange={this.setAllEntitiesTo}
              options={permOptions}
              small
            />
          </Grid>
        </Grid>
        <StyledDivWrapper>
          {this.state.showTabs ? (
            <Tabs>
              <TabList>
                {this.state.tabs?.map((entity) => (
                  <Tab key={`${entity}-tab`}>{entityNameMap[entity]}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {this.state.tabs?.map((entity: GrantType, idx) => (
                  <SafeTabPanel index={idx} key={`${entity}-tab-content`}>
                    <UserPermissionsEntitySection
                      entity={entity}
                      entitySetAllTo={this.entitySetAllTo}
                      grants={this.state.grants?.[entity]}
                      key={entity}
                      setGrantTo={this.setGrantTo}
                    />
                  </SafeTabPanel>
                ))}
              </TabPanels>
            </Tabs>
          ) : (
            grants &&
            this.entityPerms.map((entity: GrantType) => (
              <UserPermissionsEntitySection
                entity={entity}
                entitySetAllTo={this.entitySetAllTo}
                grants={this.state.grants?.[entity]}
                key={entity}
                setGrantTo={this.setGrantTo}
                showHeading
              />
            ))
          )}
        </StyledDivWrapper>
        {this.renderActions(
          this.saveSpecificGrants,
          this.cancelPermsType('entity'),
          isSavingEntity
        )}
      </Paper>
    );
  };

  savePermsType = (type: string) => () => {
    this.setState({ errors: undefined });
    const { clearNewUser, username } = this.props;
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
            compose<State, State, State>(
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
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            ),
            isSavingGlobal: false,
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
        errors: [
          {
            reason: `Can\'t set entity-specific permissions at this time. Please try again later`,
          },
        ],
        isSavingEntity: false,
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
          errors: getAPIErrorOrDefault(
            errResponse,
            'Error while updating entity-specific permissions for this user. Please try again later'
          ),
          isSavingEntity: false,
        });
        scrollErrorIntoView();
      });
  };

  setAllEntitiesTo = (e: Item<string>) => {
    const value = e.value === 'null' ? null : e.value;
    this.entityPerms.map((entity: GrantType) =>
      this.entitySetAllTo(entity, value as GrantLevel)()
    );
    this.setState({
      setAllPerm: e.value as 'null' | 'read_only' | 'read_write',
    });
  };

  setGrantTo = (entity: string, idx: number, value: GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    this.setState(set(lensPath(['grants', entity, idx, 'permissions']), value));
  };

  state: State = {
    isSavingEntity: false,
    isSavingGlobal: false,
    loading: true,
    loadingGrants: false,
    setAllPerm: 'null',
    vpcEnabled: false,
  };
}

export default recompose<CombinedProps, Props>(
  withSnackbar,
  withQueryClient,
  withFlags
)(UserPermissions);
