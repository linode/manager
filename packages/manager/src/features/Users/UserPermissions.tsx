import {
  getGrants,
  getUser,
  updateGrants,
  updateUser,
} from '@linode/api-v4/lib/account';
import { accountQueries } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  CircleProgress,
  FormControlLabel,
  Notice,
  Paper,
  Select,
  Toggle,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from 'notistack';
import { compose, flatten, lensPath, omit, set } from 'ramda';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { withFeatureFlags } from 'src/containers/flags.container';
import { withQueryClient } from 'src/containers/withQueryClient.container';
import { grantTypeMap, PARENT_USER } from 'src/features/Account/constants';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import {
  StyledCircleProgress,
  StyledDivWrapper,
  StyledFullAccountAccessToggleGrid,
  StyledHeaderGrid,
  StyledPaper,
  StyledPermPaper,
  StyledUnrestrictedGrid,
} from './UserPermissions.styles';
import { UserPermissionsEntitySection } from './UserPermissionsEntitySection';

import type {
  GlobalGrantTypes,
  Grant,
  GrantLevel,
  Grants,
  GrantType,
  User,
} from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';
import type { SelectOption } from '@linode/ui';
import type { QueryClient } from '@tanstack/react-query';
import type { WithFeatureFlagProps } from 'src/containers/flags.container';
import type { WithQueryClientProps } from 'src/containers/withQueryClient.container';
interface Props {
  accountUsername?: string;
  currentUsername?: string;
  queryClient: QueryClient;
}

interface TabInfo {
  showTabs: boolean;
  tabs: GrantType[];
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
  tabs?: GrantType[];
  userType: null | string;
}

type CombinedProps = Props & WithQueryClientProps & WithFeatureFlagProps;

class UserPermissions extends React.Component<CombinedProps, State> {
  entityPerms: GrantType[] = [
    'linode',
    'firewall',
    'stackscript',
    'image',
    'volume',
    'lkecluster',
    'nodebalancer',
    'domain',
    'longview',
    'database',
    'vpc',
  ];

  formContainerRef = React.createRef<HTMLDivElement>();

  globalBooleanPerms: GlobalGrantTypes[] = [
    'add_databases',
    'add_domains',
    'add_firewalls',
    'add_images',
    'add_linodes',
    'add_longview',
    'add_lkes',
    'add_nodebalancers',
    'add_stackscripts',
    'add_volumes',
    'add_vpcs',
    'cancel_account',
    'longview_subscription',
  ];

  state: State = {
    isSavingEntity: false,
    isSavingGlobal: false,
    loading: true,
    loadingGrants: false,
    setAllPerm: 'null',
    userType: null,
  };

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

  componentDidMount() {
    this.getUserGrants();
    this.getUserType();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.currentUsername !== this.props.currentUsername) {
      this.getUserGrants();
      this.getUserType();
    }
  }

  entityIsAll = (entity: GrantType, value: GrantLevel): boolean => {
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
    const { currentUsername } = this.props;
    if (currentUsername) {
      getGrants(currentUsername)
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
          scrollErrorIntoViewV2(this.formContainerRef);
        });
    }
  };

  getUserType = async () => {
    const { currentUsername } = this.props;

    // Current user is the user whose permissions are currently being viewed.
    if (currentUsername) {
      try {
        const user = await getUser(currentUsername);

        this.setState({
          userType: user.user_type,
        });
      } catch (error) {
        this.setState({
          errors: getAPIErrorOrDefault(
            error,
            'Unknown error occurred while fetching user permissions. Try again later.'
          ),
        });
        scrollErrorIntoViewV2(this.formContainerRef);
      }
    }
  };

  globalPermOnChange =
    (perm: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const lp = lensPath(['grants', 'global', perm]);
      this.setState(set(lp, e.target.checked));
    };

  onChangeRestricted = () => {
    const { currentUsername } = this.props;
    this.setState({
      errors: [],
      loadingGrants: true,
    });
    if (currentUsername) {
      updateUser(currentUsername, { restricted: !this.state.restricted })
        .then((user) => {
          this.setState({
            restricted: user.restricted,
          });
          // refresh the data on /account/users so it is accurate
          this.props.queryClient.invalidateQueries({
            queryKey: accountQueries.users._ctx.paginated._def,
          });
          // Update the user directly in the cache
          this.props.queryClient.setQueryData<User>(
            accountQueries.users._ctx.user(user.username).queryKey,
            user
          );
          // unconditionally sets this.state.loadingGrants to false
          this.getUserGrants();
          enqueueSnackbar('User permissions successfully saved.', {
            variant: 'success',
          });
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

  render() {
    const { loading } = this.state;
    const { currentUsername } = this.props;

    return (
      <div ref={this.formContainerRef}>
        <DocumentTitleSegment segment={`${currentUsername} - Permissions`} />
        {loading ? <CircleProgress /> : this.renderBody()}
      </div>
    );
  }

  renderActions = (
    onConfirm: () => void,
    onCancel: () => void,
    loading: boolean
  ) => {
    return (
      <ActionsPanel
        alignItems="center"
        display="flex"
        justifyContent="flex-end"
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
      />
    );
  };

  renderBillingPerm = () => {
    const { grants, userType } = this.state;
    const isChildUser = userType === 'child';
    const isProxyUser = userType === 'proxy';

    if (!(grants && grants.global)) {
      return null;
    }

    return (
      <StyledDivWrapper data-qa-billing-section>
        <Grid
          container
          spacing={2}
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
        >
          <Grid>
            <Typography data-qa-permissions-header="billing" variant="h3">
              Billing Access
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
        >
          <SelectionCard
            checked={grants.global.account_access === null}
            data-qa-billing-access="None"
            disabled={isProxyUser}
            heading="None"
            onClick={this.billingPermOnClick(null)}
            subheadings={['The user cannot view any billing information.']}
          />
          <SelectionCard
            checked={
              grants.global.account_access === 'read_only' ||
              (isChildUser && Boolean(this.state.grants?.global.account_access))
            }
            data-qa-billing-access="Read Only"
            disabled={isProxyUser}
            heading="Read Only"
            onClick={this.billingPermOnClick('read_only')}
            subheadings={['Can view invoices and billing info.']}
          />
          <SelectionCard
            checked={
              grants.global.account_access === 'read_write' && !isChildUser
            }
            data-qa-billing-access="Read-Write"
            disabled={isChildUser}
            heading="Read-Write"
            onClick={this.billingPermOnClick('read_write')}
            subheadings={[
              'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails.',
            ]}
          />
        </Grid>
      </StyledDivWrapper>
    );
  };

  renderBody = () => {
    const { accountUsername, currentUsername } = this.props;
    const { errors, restricted } = this.state;
    const hasErrorFor = getAPIErrorFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');
    const isProxyUser = this.state.userType === 'proxy';

    return (
      <Box>
        {generalError && (
          <Notice spacingTop={8} text={generalError} variant="error" />
        )}
        <StyledPaper>
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: 'center',
              margin: 0,
              width: 'auto',
            }}
          >
            <StyledHeaderGrid>
              <Typography
                data-qa-restrict-access={restricted}
                sx={{
                  textTransform: 'capitalize',
                }}
                variant="h2"
              >
                {isProxyUser ? PARENT_USER : 'General'} Permissions
              </Typography>
            </StyledHeaderGrid>
            <StyledFullAccountAccessToggleGrid>
              <FormControlLabel
                control={
                  <Toggle
                    checked={!restricted}
                    disabled={currentUsername === accountUsername}
                    inputProps={{
                      'aria-label': 'Toggle Full Account Access',
                    }}
                    onChange={this.onChangeRestricted}
                    tooltipText={
                      currentUsername === accountUsername
                        ? 'You cannot restrict the current active user.'
                        : ''
                    }
                  />
                }
                data-qa="toggle-full-account-access"
                label="Full Account Access"
                labelPlacement="end"
                slotProps={{
                  typography: {
                    sx: (theme) => ({
                      font: theme.font.bold,
                      fontSize: '16px',
                    }),
                  },
                }}
                value={restricted}
              />
            </StyledFullAccountAccessToggleGrid>
          </Grid>
        </StyledPaper>
        {restricted ? this.renderPermissions() : this.renderUnrestricted()}
      </Box>
    );
  };

  renderGlobalPerm = (perm: GlobalGrantTypes, checked: boolean) => {
    const permDescriptionMap: Partial<Record<GlobalGrantTypes, string>> = {
      add_databases: 'Can add Databases to this account ($)',
      add_domains: 'Can add Domains using the DNS Manager',
      add_firewalls: 'Can add Firewalls to this account',
      add_images: 'Can create frozen Images under this account ($)',
      add_linodes: 'Can add Linodes to this account ($)',
      add_lkes: 'Can add Kubernetes Clusters to this account ($)',
      add_longview: 'Can add Longview clients to this account',
      add_nodebalancers: 'Can add NodeBalancers to this account ($)',
      add_stackscripts: 'Can create StackScripts under this account',
      add_volumes: 'Can add Block Storage Volumes to this account ($)',
      add_vpcs: 'Can add VPCs to this account',
      cancel_account: 'Can cancel the entire account',
      longview_subscription:
        'Can modify this account\u{2019}s Longview subscription ($)',
    };

    if (this.state.userType === 'parent') {
      permDescriptionMap['child_account_access'] =
        'Enable child account access';
    }

    return (
      <Grid
        className="py0"
        key={perm}
        size={{
          sm: 6,
          xs: 12,
        }}
      >
        <FormControlLabel
          control={
            <Toggle
              checked={checked}
              data-qa-global-permission={perm}
              onChange={this.globalPermOnChange(perm)}
            />
          }
          label={permDescriptionMap[perm]}
          sx={(theme) => ({
            padding: `${theme.spacing(1)} 0`,
          })}
        />
      </Grid>
    );
  };

  renderGlobalPerms = () => {
    const { grants, isSavingGlobal } = this.state;
    if (
      this.state.userType === 'parent' &&
      !this.globalBooleanPerms.includes('child_account_access')
    ) {
      this.globalBooleanPerms.push('child_account_access');
    }
    return (
      <StyledPermPaper data-qa-global-section>
        <Typography
          data-qa-permissions-header="Global Permissions"
          variant="body2"
        >
          Configure the specific rights and privileges this user has within the
          account.{<br />}Remember that permissions related to actions with the
          '$' symbol may incur additional charges.
        </Typography>
        <Grid
          container
          spacing={2}
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
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
      </StyledPermPaper>
    );
  };

  renderPermissions = () => {
    const { loading, loadingGrants } = this.state;
    if (loadingGrants || loading) {
      return <StyledCircleProgress />;
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
      <StyledPermPaper
        data-qa-entity-section
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
      >
        <Grid
          container
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Grid>
            <Typography
              data-qa-permissions-header="Specific Permissions"
              variant="h2"
            >
              Specific Permissions
            </Typography>
          </Grid>
          <Grid style={{ marginTop: 5 }}>
            <Select
              id="setall"
              label="Set all permissions to:"
              onChange={(_, value) => this.setAllEntitiesTo(value)}
              options={permOptions}
              sx={{
                '& > .MuiBox-root': {
                  '& label': {
                    position: 'relative',
                    right: 10,
                    top: -4,
                  },
                  alignItems: 'center',
                  display: 'flex',
                },
              }}
              value={{
                label: defaultPerm?.label ?? '',
                value: defaultPerm?.value ?? '',
              }}
            />
          </Grid>
        </Grid>
        <StyledDivWrapper>
          {this.state.showTabs ? (
            <Tabs>
              <TabList>
                {this.state.tabs?.map((entity) => (
                  <Tab key={`${entity}-tab`}>{grantTypeMap[entity]}</Tab>
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
      </StyledPermPaper>
    );
  };

  renderUnrestricted = () => {
    return (
      <Paper>
        <StyledUnrestrictedGrid>
          <Typography data-qa-unrestricted-msg>
            This user has unrestricted access to the account.
          </Typography>
        </StyledUnrestrictedGrid>
      </Paper>
    );
  };

  savePermsType = (type: keyof Grants) => () => {
    this.setState({ errors: undefined });
    const { currentUsername } = this.props;
    const { grants } = this.state;
    if (!currentUsername || !(grants && grants[type])) {
      return this.setState({
        errors: [
          {
            reason: `Can\'t set ${type} permissions at this time. Please try again later`,
          },
        ],
      });
    }

    if (type === 'global') {
      this.setState({ isSavingGlobal: true });
      updateGrants(currentUsername, { global: grants.global })
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

          enqueueSnackbar('General user permissions successfully saved.', {
            variant: 'success',
          });

          // Update the user's grants directly in the cache
          this.props.queryClient.setQueryData<Grants>(
            accountQueries.users._ctx.user(currentUsername)._ctx.grants
              .queryKey,
            grantsResponse
          );
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            ),
            isSavingGlobal: false,
          });
          scrollErrorIntoViewV2(this.formContainerRef);
        });
    }

    /* This is where individual entity saving could be implemented */
  };

  saveSpecificGrants = () => {
    this.setState({ errors: undefined, isSavingEntity: true });
    const { currentUsername } = this.props;
    const { grants } = this.state;
    if (!currentUsername || !grants) {
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
    updateGrants(currentUsername, requestPayload)
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
        enqueueSnackbar(
          'Entity-specific user permissions successfully saved.',
          {
            variant: 'success',
          }
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
        scrollErrorIntoViewV2(this.formContainerRef);
      });
  };

  setAllEntitiesTo = (e: null | SelectOption | undefined) => {
    const value = e?.value === 'null' ? null : e?.value;
    this.entityPerms.map((entity: GrantType) =>
      this.entitySetAllTo(entity, value as GrantLevel)()
    );
    this.setState({
      setAllPerm: e?.value as 'null' | 'read_only' | 'read_write',
    });
  };

  setGrantTo = (entity: GrantType, idx: number, value: GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    this.setState(set(lensPath(['grants', entity, idx, 'permissions']), value));
  };
}

export default withQueryClient(withFeatureFlags(UserPermissions));
