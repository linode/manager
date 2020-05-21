import * as classnames from 'classnames';
import { AccountSettings } from '@linode/api-v4/lib/account';
import { LongviewSubscription } from '@linode/api-v4/lib/longview/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Chip from 'src/components/core/Chip';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import SupportLink from 'src/components/SupportLink';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import accountSettingsContainer, {
  Props as AccountSettingsProps
} from 'src/containers/accountSettings.container';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { UseAPIRequest } from 'src/hooks/useAPIRequest';
import { MapState } from 'src/store/types';
import { COMPACT_SPACING_UNIT } from 'src/themeFactory';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => {
  const border = `1px solid ${theme.bg.main}`;

  return {
    root: {
      padding: theme.spacing(3),
      paddingBottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      // These values represent the table size with 5 elements in compact
      // and normal mode. It's brittle, I know, but I'm not sure of another way.
      minHeight: theme.spacing() === COMPACT_SPACING_UNIT ? 311 : 419
    },
    collapsedTable: {
      minHeight: 0
    },
    table: {
      borderTop: border,
      borderRight: border,
      borderLeft: border,
      '& td': {
        whiteSpace: 'nowrap',
        borderBottom: border
      },
      '& tbody tr': {
        cursor: 'pointer'
      },
      '& th, thead > tr:first-child:before': {
        borderBottom: border
      },
      '& tr:before': {
        borderBottom: border
      }
    },
    radio: {
      marginLeft: -(theme.spacing(1) / 2),
      marginRight: theme.spacing(2) - 1,
      padding: 2
    },
    currentSubscriptionLabel: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: 2,
      paddingRight: theme.spacing(3),
      [theme.breakpoints.down('md')]: {
        paddingRight: 0
      }
    },
    chip: {
      backgroundColor: theme.color.green,
      color: '#fff',
      textTransform: 'uppercase',
      minHeight: theme.spacing(2) + 11,
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
      marginTop: 0,
      marginBottom: 0,
      marginLeft: theme.spacing(2)
    },
    planCell: {
      [theme.breakpoints.up('md')]: {
        width: '40%'
      }
    },
    clientCell: {
      [theme.breakpoints.up('md')]: {
        width: '10%'
      }
    },
    dataRetentionCell: {
      [theme.breakpoints.up('md')]: {
        width: '15%'
      }
    },
    dataResolutionCell: {
      [theme.breakpoints.up('md')]: {
        width: '15%'
      }
    },
    priceCell: {
      [theme.breakpoints.up('md')]: {
        width: '15%'
      }
    },
    submitButton: {
      alignSelf: 'flex-start',
      marginTop: theme.spacing(4) - 2,
      marginBottom: theme.spacing(4) - 2
    },
    disabledTableRow: {
      cursor: 'not-allowed !important'
    }
  };
});

// If an account has the "free" Longview plan,
// accountSettings.longview_subscription will be `null`. We'd rather use
// a string identifer in this component to be keep track of the "free" plan, so
// we'll create a fake ID for it.
export const LONGVIEW_FREE_ID = 'longview-free';

interface Props {
  subscriptionRequestHook: UseAPIRequest<LongviewSubscription[]>;
}

export type CombinedProps = Props & AccountSettingsProps & ReduxStateProps;

export const managedText = (
  <span>
    Longview Pro is included with Linode Managed. If you need additional
    clients, please{' '}
    <SupportLink
      title="Request for additional Longview clients"
      description=""
      text="contact Support"
    />{' '}
    for additional Longview plan options.
  </span>
);

export const LongviewPlans: React.FC<CombinedProps> = props => {
  const {
    accountSettings,
    subscriptionRequestHook: subscriptions,
    updateAccountSettings,
    mayUserViewAccountSettings,
    mayUserModifyLVSubscription
  } = props;
  const styles = useStyles();

  const currentSubscriptionOnAccount = getCurrentSubscriptionOnAccount(
    mayUserViewAccountSettings,
    accountSettings
  );

  const [selectedSub, setSelectedSub] = React.useState<string>(
    currentSubscriptionOnAccount || ''
  );
  const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);
  const [updateErrorMsg, setUpdateErrorMsg] = React.useState<string>('');

  const onSubmit = () => {
    // No need to do anything if the user hasn't selected a different plan.
    if (selectedSub === currentSubscriptionOnAccount) {
      return;
    }

    setUpdateLoading(true);
    setUpdateErrorMsg('');

    // If the user has selected the free plan, which need to make a switch for
    // `null`, which is what the API wants.
    const newSubscriptionID =
      selectedSub === LONGVIEW_FREE_ID ? null : selectedSub;

    updateAccountSettings({
      longview_subscription: newSubscriptionID
    })
      .then(_ => {
        setUpdateLoading(false);
        // If the user has selected the free plan, the response to the PUT
        // request will have the old longview_subscription. I don't know why.
        // We need to manually update the store in this case.
        if (selectedSub === LONGVIEW_FREE_ID) {
          props.updateAccountSettingsInStore({ longview_subscription: null });
        }
      })
      .catch(err => {
        const normalizedError = getAPIErrorOrDefault(
          err,
          'There was an error updating your Longview Plan.'
        );
        setUpdateLoading(false);
        setUpdateErrorMsg(normalizedError[0].reason);
      });
  };

  const onRadioSelect = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) =>
      setSelectedSub(e.currentTarget.value),
    []
  );

  const isManaged = accountSettings ? accountSettings.managed : false;

  const isButtonDisabled =
    Boolean(subscriptions.error) ||
    currentSubscriptionOnAccount === selectedSub ||
    !mayUserModifyLVSubscription;

  return (
    <>
      <DocumentTitleSegment segment="Plan Details" />
      <Paper
        className={classnames({
          [styles.root]: true,
          [styles.collapsedTable]: isManaged
        })}
        id="tabpanel-planDetails"
        role="tabpanel"
        aria-labelledby="tab-planDetails"
      >
        {updateErrorMsg && <Notice error text={updateErrorMsg} />}
        {!mayUserModifyLVSubscription && !isManaged && (
          <Notice
            error
            important
            text="You don't have permissions to change the Longview plan. Please contact an account administrator for details."
          />
        )}
        {isManaged && <Notice success text={managedText} />}
        {!isManaged && (
          <>
            <Table className={styles.table}>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.planCell}>Plan</TableCell>
                  <TableCell className={styles.clientCell}>Clients</TableCell>
                  <TableCell className={styles.dataRetentionCell}>
                    Data Retention
                  </TableCell>
                  <TableCell className={styles.dataResolutionCell}>
                    Data Resolution
                  </TableCell>
                  <TableCell className={styles.priceCell}>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <LongviewPlansTableBody
                  loading={subscriptions.loading}
                  error={subscriptions.error}
                  subscriptions={subscriptions.data}
                  onRadioSelect={onRadioSelect}
                  onRowSelect={setSelectedSub}
                  currentSubscriptionOnAccount={currentSubscriptionOnAccount}
                  selectedSub={selectedSub}
                  disabled={!mayUserModifyLVSubscription}
                />
              </TableBody>
            </Table>
            <Button
              className={styles.submitButton}
              buttonType="primary"
              onClick={onSubmit}
              loading={updateLoading}
              disabled={isButtonDisabled}
              data-testid="submit-button"
            >
              Change Plan
            </Button>
          </>
        )}
      </Paper>
    </>
  );
};

interface ReduxStateProps {
  mayUserViewAccountSettings: boolean;
  mayUserModifyLVSubscription: boolean;
}

const mapStateToProps: MapState<ReduxStateProps, CombinedProps> = state => ({
  mayUserViewAccountSettings:
    !isRestrictedUser(state) ||
    hasGrant(state, 'account_access') === 'read_only' ||
    hasGrant(state, 'account_access') === 'read_write',
  mayUserModifyLVSubscription:
    !isRestrictedUser(state) ||
    (hasGrant(state, 'longview_subscription') &&
      hasGrant(state, 'account_access') === 'read_write')
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  connected,
  accountSettingsContainer()
);

export default enhanced(LongviewPlans);

// =============================================================================
// LongviewPlansTableBody
// =============================================================================
interface LongviewPlansTableBodyProps {
  loading: boolean;
  error: APIError[] | undefined;
  subscriptions: LongviewSubscription[];
  onRowSelect: (plan: string) => void;
  onRadioSelect: (e: React.FormEvent<HTMLInputElement>) => void;
  currentSubscriptionOnAccount?: string;
  selectedSub: string;
  disabled: boolean;
}

export const LongviewPlansTableBody: React.FC<LongviewPlansTableBodyProps> = React.memo(
  props => {
    const { loading, error, subscriptions, selectedSub, ...rest } = props;

    if (loading) {
      return <TableRowLoading colSpan={12} />;
    }

    if (error && error.length > 0) {
      return <TableRowError colSpan={12} message={error[0].reason} />;
    }

    return (
      <>
        {/* The first row is hard-coded, as the "free" plan is not returned from
      the API. */}
        <LongviewSubscriptionRow
          key={LONGVIEW_FREE_ID}
          id={LONGVIEW_FREE_ID}
          plan="Longview Free"
          clients={10}
          dataRetention="Limited to 12 hours"
          dataResolution="Every 5 minutes"
          price="FREE"
          isSelected={selectedSub === LONGVIEW_FREE_ID}
          {...rest}
        />
        {/* We use data from /longview/subscriptions to generate the remaining
      rows. */}
        {subscriptions.map(sub => (
          <LongviewSubscriptionRow
            key={sub.id}
            id={sub.id}
            plan={sub.label}
            clients={sub.clients_included}
            dataRetention="Unlimited"
            dataResolution="Every minute"
            price={formatPrice(sub.price)}
            isSelected={selectedSub === sub.id}
            {...rest}
          />
        ))}
      </>
    );
  }
);

// =============================================================================
// LongviewSubscriptionRow
// =============================================================================
interface LongviewSubscriptionRowProps {
  id: string;
  plan: string;
  clients: number;
  dataRetention: string;
  dataResolution: string;
  price: string;
  onRowSelect: (plan: string) => void;
  onRadioSelect: (e: React.FormEvent<HTMLInputElement>) => void;
  currentSubscriptionOnAccount?: string;
  isSelected: boolean;
  disabled: boolean;
}

export const LongviewSubscriptionRow: React.FC<LongviewSubscriptionRowProps> = React.memo(
  props => {
    const {
      id,
      plan,
      clients,
      dataRetention,
      dataResolution,
      price,
      onRowSelect,
      onRadioSelect,
      currentSubscriptionOnAccount,
      isSelected,
      disabled
    } = props;

    const styles = useStyles();

    const handleClick = () => {
      if (disabled) {
        return;
      }
      onRowSelect(id);
    };

    return (
      <TableRow
        key={id}
        onClick={handleClick}
        rowLink={disabled ? undefined : handleClick}
        className={classnames({
          [styles.disabledTableRow]: disabled
        })}
        data-testid={`lv-sub-table-row-${id}`}
        ariaLabel={plan}
      >
        <TableCell data-testid={`plan-cell-${id}`}>
          <div className={styles.currentSubscriptionLabel}>
            <Radio
              value={id}
              checked={isSelected}
              onChange={onRadioSelect}
              className={styles.radio}
              id={id}
              data-testid={`lv-sub-radio-${id}`}
              disabled={disabled}
            />
            {plan}
            {currentSubscriptionOnAccount === id && (
              <Chip
                data-testid="current-plan"
                label="Current Plan"
                className={styles.chip}
              />
            )}
          </div>
        </TableCell>
        <TableCell
          className={styles.clientCell}
          data-testid={`clients-cell-${id}`}
        >
          {clients}
        </TableCell>
        <TableCell
          className={styles.dataRetentionCell}
          data-testid={`data-retention-cell-${id}`}
        >
          {dataRetention}
        </TableCell>
        <TableCell
          className={styles.dataResolutionCell}
          data-testid={`data-resolution-cell-${id}`}
        >
          {dataResolution}
        </TableCell>
        <TableCell
          className={styles.priceCell}
          data-testid={`price-cell-${id}`}
        >
          {price}
        </TableCell>
      </TableRow>
    );
  }
);

// =============================================================================
// Utilities
// =============================================================================
export const formatPrice = (price: LongviewSubscription['price']): string => {
  return `$${price.hourly.toFixed(2)}/hr ($${price.monthly}/mo)`;
};

// Return the Longview subscription on the account, or the default if
// accountSettings is undefined or if the account has the "free" plan enabled
// (in which case accountSettings.longview_subscription will be `null`).
export const getCurrentSubscriptionOnAccount = (
  mayUserViewAccountSettings: boolean,
  accountSettings?: AccountSettings,
  defaultSubscriptionID = LONGVIEW_FREE_ID
) => {
  if (!mayUserViewAccountSettings) {
    return undefined;
  }

  return accountSettings &&
    typeof accountSettings.longview_subscription === 'string'
    ? accountSettings.longview_subscription
    : defaultSubscriptionID;
};
