import {
  getActiveLongviewPlan,
  updateActiveLongviewPlan,
} from '@linode/api-v4/lib/longview';
import { Button, CircleProgress, Notice, Paper, Radio } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SupportLink } from 'src/components/SupportLink';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useAccountSettings, useGrants, useProfile } from '@linode/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  StyledChip,
  StyledClientCell,
  StyledDataOrPriceCell,
  StyledDiv,
  StyledNotice,
  StyledPlanCell,
  StyledTable,
  StyledTableRow,
} from './LongviewPlans.styles';

import type { LongviewSubscription } from '@linode/api-v4/lib/longview';
import type { APIError } from '@linode/api-v4/lib/types';
import type { UseAPIRequest } from 'src/hooks/useAPIRequest';

// If an account has the "free" Longview plan,
// longview_subscription will be {}. We'd rather use
// a string identifer in this component to keep track of the "free" plan, so
// we'll create a fake ID for it.
export const LONGVIEW_FREE_ID = 'longview-free';

export interface LongviewPlansProps {
  subscriptionRequestHook: UseAPIRequest<LongviewSubscription[]>;
}

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

export const LongviewPlans = (props: LongviewPlansProps) => {
  const { subscriptionRequestHook: subscriptions } = props;
  const theme = useTheme();
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
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Plan Details" />
      {isManaged ? (
        <Paper
          sx={{
            minHeight: 0,
            padding: theme.spacing(3),
            paddingBottom: '4px',
          }}
        >
          {updateErrorMsg && <Notice text={updateErrorMsg} variant="error" />}
          {updateSuccessMsg && (
            <Notice text={updateSuccessMsg} variant="success" />
          )}
          <StyledNotice variant="success">{managedText}</StyledNotice>
        </Paper>
      ) : (
        <>
          {mayUserModifyLVSubscription && updateErrorMsg && (
            <Notice text={updateErrorMsg} variant="error" />
          )}
          {!mayUserModifyLVSubscription && (
            <Notice
              text="You don't have permissions to change the Longview plan. Please contact an account administrator for details."
              variant="error"
            />
          )}
          {updateSuccessMsg && (
            <Notice text={updateSuccessMsg} variant="success" />
          )}
          {isTableDisplayed && (
            <>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <StyledPlanCell>Plan</StyledPlanCell>
                    <StyledClientCell>Clients</StyledClientCell>
                    <StyledDataOrPriceCell>
                      Data Retention
                    </StyledDataOrPriceCell>
                    <StyledDataOrPriceCell>
                      Data Resolution
                    </StyledDataOrPriceCell>
                    <StyledDataOrPriceCell>Price</StyledDataOrPriceCell>
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
              </StyledTable>
              <Button
                sx={{
                  marginBottom: theme.spacing(3),
                  marginTop: theme.spacing(3),
                }}
                buttonType="primary"
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

export const LongviewPlansTableBody = React.memo(
  (props: LongviewPlansTableBodyProps) => {
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
export interface LongviewSubscriptionRowProps {
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

export const LongviewSubscriptionRow = React.memo(
  (props: LongviewSubscriptionRowProps) => {
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

    const theme = useTheme();

    const handleClick = () => {
      if (disabled) {
        return;
      }
      onRowSelect(id);
    };

    return (
      <StyledTableRow
        data-testid={`lv-sub-table-row-${id}`}
        disabled={disabled}
        key={id}
        onClick={handleClick}
      >
        <TableCell data-testid={`plan-cell-${id}`}>
          <StyledDiv>
            <Radio
              sx={{
                marginLeft: `-${theme.spacing(0.5)}`,
                marginRight: theme.spacing(2),
                padding: '2px',
              }}
              checked={isSelected}
              data-testid={`lv-sub-radio-${id}`}
              disabled={disabled}
              id={id}
              onChange={onRadioSelect}
              value={id}
            />
            {plan}
            {currentSubscriptionOnAccount === id && (
              <StyledChip
                data-testid={`current-plan-${id}`}
                label="Current Plan"
              />
            )}
          </StyledDiv>
        </TableCell>
        <StyledClientCell data-testid={`clients-cell-${id}`}>
          {clients}
        </StyledClientCell>
        <StyledDataOrPriceCell data-testid={`data-retention-cell-${id}`}>
          {dataRetention}
        </StyledDataOrPriceCell>
        <StyledDataOrPriceCell data-testid={`data-resolution-cell-${id}`}>
          {dataResolution}
        </StyledDataOrPriceCell>
        <StyledDataOrPriceCell data-testid={`price-cell-${id}`}>
          {price}
        </StyledDataOrPriceCell>
      </StyledTableRow>
    );
  }
);

// =============================================================================
// Utilities
// =============================================================================
export const formatPrice = (price: LongviewSubscription['price']): string => {
  return `$${price.hourly.toFixed(2)}/hr ($${price.monthly}/mo)`;
};
