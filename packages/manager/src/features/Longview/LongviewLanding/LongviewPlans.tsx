import {
  LongviewSubscription,
  getActiveLongviewPlan,
  updateActiveLongviewPlan,
} from '@linode/api-v4/lib/longview';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { CircularProgress } from 'src/components/CircularProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Radio } from 'src/components/Radio/Radio';
import { SupportLink } from 'src/components/SupportLink';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { UseAPIRequest } from 'src/hooks/useAPIRequest';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useGrants, useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    borderRadius: 1,
    fontSize: '0.65rem',
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  clientCell: {
    [theme.breakpoints.up('md')]: {
      width: '10%',
    },
  },
  collapsedTable: {
    minHeight: 0,
  },
  currentSubscriptionLabel: {
    alignItems: 'center',
    display: 'flex',
    marginLeft: 2,
    paddingRight: theme.spacing(3),
    [theme.breakpoints.down('lg')]: {
      paddingRight: 0,
    },
  },
  dataResolutionCell: {
    [theme.breakpoints.up('md')]: {
      width: '15%',
    },
  },
  dataRetentionCell: {
    [theme.breakpoints.up('md')]: {
      width: '15%',
    },
  },
  disabledTableRow: {
    cursor: 'not-allowed !important',
  },
  link: {
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: theme.palette.primary.main,
    },
  },
  planCell: {
    [theme.breakpoints.up('md')]: {
      width: '40%',
    },
  },
  priceCell: {
    [theme.breakpoints.up('md')]: {
      width: '15%',
    },
  },
  radio: {
    marginLeft: `-${theme.spacing(0.5)}`,
    marginRight: theme.spacing(2),
    padding: 2,
  },
  root: {
    padding: theme.spacing(3),
    paddingBottom: 4,
  },
  submitButton: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  table: {
    '& tbody tr': {
      cursor: 'pointer',
    },
    '& td': {
      whiteSpace: 'nowrap',
    },
    border: `1px solid ${theme.borderColors.borderTable}`,
  },
}));

// If an account has the "free" Longview plan,
// longview_subscription will be {}. We'd rather use
// a string identifer in this component to keep track of the "free" plan, so
// we'll create a fake ID for it.
export const LONGVIEW_FREE_ID = 'longview-free';

interface Props {
  subscriptionRequestHook: UseAPIRequest<LongviewSubscription[]>;
}

export type CombinedProps = Props;

export const managedText = (
  <span>
    Longview Pro is included with Linode Managed. If you need additional
    clients, please{' '}
    <SupportLink
      description=""
      text="contact Support"
      title="Request for additional Longview clients"
    />{' '}
    for additional Longview plan options.
  </span>
);

export const LongviewPlans: React.FC<CombinedProps> = (props) => {
  const { subscriptionRequestHook: subscriptions } = props;
  const classes = useStyles();
  const mounted = React.useRef<boolean>(false);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: accountSettings } = useAccountSettings();

  const isManaged = Boolean(accountSettings?.managed);

  const mayUserModifyLVSubscription =
    !(profile?.restricted || false) ||
    (grants?.global.longview_subscription &&
      grants.global.account_access === 'read_write');

  const [currentSubscription, setCurrentSubscription] = React.useState<
    string | undefined
  >(undefined);

  const [selectedSub, setSelectedSub] = React.useState<string>(
    currentSubscription || ''
  );
  const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);
  const [updateErrorMsg, setUpdateErrorMsg] = React.useState<string>('');
  const [updateSuccessMsg, setUpdateSuccessMsg] = React.useState<string>('');

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    getActiveLongviewPlan()
      .then((plan: LongviewSubscription) => {
        if (!mounted.current) {
          return;
        }
        const activeID = plan.id ?? LONGVIEW_FREE_ID;
        setCurrentSubscription(activeID);
        setSelectedSub(activeID);
      })
      .catch((_) => {
        if (!mounted.current) {
          return;
        }

        setUpdateErrorMsg('Error loading your current Longview plan');
      });
  }, []);

  const onSubmit = () => {
    // No need to do anything if the user hasn't selected a different plan.
    if (selectedSub === currentSubscription) {
      return;
    }

    setUpdateLoading(true);
    setUpdateErrorMsg('');
    setUpdateSuccessMsg('');

    // If the user has selected the free plan, which need to make a switch for
    // {}, which is what the API wants.
    const payload =
      selectedSub === LONGVIEW_FREE_ID
        ? {}
        : { longview_subscription: selectedSub };

    updateActiveLongviewPlan(payload)
      .then((_) => {
        setUpdateLoading(false);
        setUpdateSuccessMsg('Plan updated successfully.');
        setCurrentSubscription(selectedSub);
      })
      .catch((err) => {
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

  // Hide table if current plan is not being displayed
  // ie. Users with no access to Longview
  const isTableDisplayed =
    Boolean(subscriptions.error) ||
    currentSubscription === selectedSub ||
    mayUserModifyLVSubscription;

  const isButtonDisabled =
    Boolean(subscriptions.error) ||
    currentSubscription === selectedSub ||
    !mayUserModifyLVSubscription;

  if (!profile) {
    return <CircularProgress data-testid="loading" />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Plan Details" />
      {isManaged ? (
        <Paper className={`${classes.root} ${classes.collapsedTable}`}>
          {updateErrorMsg && <Notice text={updateErrorMsg} variant="error" />}
          {updateSuccessMsg && (
            <Notice text={updateSuccessMsg} variant="success" />
          )}
          <Notice className={classes.link} variant="success">
            {managedText}
          </Notice>
        </Paper>
      ) : (
        <>
          {mayUserModifyLVSubscription && updateErrorMsg && (
            <Notice text={updateErrorMsg} variant="error" />
          )}
          {!mayUserModifyLVSubscription && (
            <Notice
              important
              text="You don't have permissions to change the Longview plan. Please contact an account administrator for details."
              variant="error"
            />
          )}
          {updateSuccessMsg && (
            <Notice text={updateSuccessMsg} variant="success" />
          )}
          {isTableDisplayed && (
            <>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.planCell}>Plan</TableCell>
                    <TableCell className={classes.clientCell}>
                      Clients
                    </TableCell>
                    <TableCell className={classes.dataRetentionCell}>
                      Data Retention
                    </TableCell>
                    <TableCell className={classes.dataResolutionCell}>
                      Data Resolution
                    </TableCell>
                    <TableCell className={classes.priceCell}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <LongviewPlansTableBody
                    currentSubscriptionOnAccount={currentSubscription}
                    disabled={!mayUserModifyLVSubscription}
                    error={subscriptions.error}
                    loading={subscriptions.loading}
                    onRadioSelect={onRadioSelect}
                    onRowSelect={setSelectedSub}
                    selectedSub={selectedSub}
                    subscriptions={subscriptions.data}
                  />
                </TableBody>
              </Table>
              <Button
                buttonType="primary"
                className={classes.submitButton}
                data-testid="submit-button"
                disabled={isButtonDisabled}
                loading={updateLoading}
                onClick={onSubmit}
              >
                Change Plan
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
};

export default React.memo(LongviewPlans);

// =============================================================================
// LongviewPlansTableBody
// =============================================================================
interface LongviewPlansTableBodyProps {
  currentSubscriptionOnAccount?: string;
  disabled: boolean;
  error: APIError[] | undefined;
  loading: boolean;
  onRadioSelect: (e: React.FormEvent<HTMLInputElement>) => void;
  onRowSelect: (plan: string) => void;
  selectedSub: string;
  subscriptions: LongviewSubscription[];
}

export const LongviewPlansTableBody: React.FC<LongviewPlansTableBodyProps> = React.memo(
  (props) => {
    const { error, loading, selectedSub, subscriptions, ...rest } = props;

    if (loading) {
      return <TableRowLoading columns={5} />;
    }

    if (error && error.length > 0) {
      return <TableRowError colSpan={12} message={error[0].reason} />;
    }

    return (
      <>
        {/* The first row is hard-coded, as the "free" plan is not returned from
      the API. */}
        <LongviewSubscriptionRow
          clients={10}
          dataResolution="Every 5 minutes"
          dataRetention="Limited to 12 hours"
          id={LONGVIEW_FREE_ID}
          isSelected={selectedSub === LONGVIEW_FREE_ID}
          key={LONGVIEW_FREE_ID}
          plan="Longview Free"
          price="FREE"
          {...rest}
        />
        {/* We use data from /longview/subscriptions to generate the remaining
      rows. */}
        {subscriptions.map((sub) => (
          <LongviewSubscriptionRow
            clients={sub.clients_included}
            dataResolution="Every minute"
            dataRetention="Unlimited"
            id={sub.id}
            isSelected={selectedSub === sub.id}
            key={sub.id}
            plan={sub.label}
            price={formatPrice(sub.price)}
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
  clients: number;
  currentSubscriptionOnAccount?: string;
  dataResolution: string;
  dataRetention: string;
  disabled: boolean;
  id: string;
  isSelected: boolean;
  onRadioSelect: (e: React.FormEvent<HTMLInputElement>) => void;
  onRowSelect: (plan: string) => void;
  plan: string;
  price: string;
}

export const LongviewSubscriptionRow: React.FC<LongviewSubscriptionRowProps> = React.memo(
  (props) => {
    const {
      clients,
      currentSubscriptionOnAccount,
      dataResolution,
      dataRetention,
      disabled,
      id,
      isSelected,
      onRadioSelect,
      onRowSelect,
      plan,
      price,
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
        className={classNames({
          [styles.disabledTableRow]: disabled,
        })}
        ariaLabel={plan}
        data-testid={`lv-sub-table-row-${id}`}
        key={id}
        onClick={handleClick}
      >
        <TableCell data-testid={`plan-cell-${id}`}>
          <div className={styles.currentSubscriptionLabel}>
            <Radio
              checked={isSelected}
              className={styles.radio}
              data-testid={`lv-sub-radio-${id}`}
              disabled={disabled}
              id={id}
              onChange={onRadioSelect}
              value={id}
            />
            {plan}
            {currentSubscriptionOnAccount === id && (
              <Chip
                className={styles.chip}
                data-testid={`current-plan-${id}`}
                label="Current Plan"
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
