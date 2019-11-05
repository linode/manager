import { getLongviewSubscriptions } from 'linode-js-sdk/lib/longview';
import { LongviewSubscription } from 'linode-js-sdk/lib/longview/types';
import * as React from 'react';
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
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import accountSettingsContainer, {
  DispatchProps,
  SettingsProps
} from 'src/containers/accountSettings.container';
import { COMPACT_SPACING_UNIT } from 'src/themeFactory';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3)}px ${theme.spacing(3)}px 0px ${theme.spacing(
      3
    )}px`
  },
  table: {
    border: `1px solid ${theme.bg.main}`,
    borderBottom: 0,
    '& td, th': {
      borderBottom: `1px solid ${theme.bg.main}`
    },
    '& tbody > tr': {
      cursor: 'pointer'
    },
    '& tr:before': {
      borderBottom: `1px solid ${theme.bg.main}`
    },
    minHeight: theme.spacing() === COMPACT_SPACING_UNIT ? 238 : 286
  },
  radio: {
    marginLeft: theme.spacing(1) - 3,
    marginRight: theme.spacing(2) - 1,
    padding: 2
  },
  currentSubscriptionLabel: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 'auto',
    paddingRight: theme.spacing(3)
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    height: theme.spacing(3) + 3,
    paddingLeft: 9,
    paddingRight: 9,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 'auto'
  },
  planCell: {
    width: '30%'
  },
  clientCell: {
    textAlign: 'right',
    paddingRight: theme.spacing(6.5),
    width: '10%'
  },
  dataRetentionCell: {
    width: '15%'
  },
  dataResolutionCell: {
    width: '25%'
  },
  priceCell: {
    width: '15%'
  },
  submitButton: {
    marginTop: theme.spacing(4) - 2,
    marginBottom: theme.spacing(4) - 2
  }
}));

export type CombinedProps = SettingsProps & DispatchProps;

export const LongviewPlans: React.FC<CombinedProps> = props => {
  const { accountSettings } = props;

  const initialSelected =
    accountSettings && accountSettings.longview_subscription !== null
      ? accountSettings.longview_subscription
      : '';

  const [subscriptions, setSubscriptions] = React.useState<
    LongviewSubscription[]
  >([]);
  const [selectedSubscription, setSelectedSubscription] = React.useState<
    string
  >(initialSelected);

  const [fetchLoading, setFetchLoading] = React.useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);

  const [fetchErrorMessage, setFetchErrorMessage] = React.useState<string>('');
  const [updateErrorMessage, setUpdateErrorMessage] = React.useState<string>(
    ''
  );

  const currentSubscriptionOnAccount =
    accountSettings && accountSettings.longview_subscription
      ? accountSettings.longview_subscription
      : '';

  React.useEffect(() => {
    setFetchLoading(true);
    getLongviewSubscriptions()
      .then(response => {
        setFetchLoading(false);

        setSubscriptions(response.data);
      })
      .catch(err => {
        const normalizedError = getAPIErrorOrDefault(
          err,
          'There was an error fetching Longview Plans.'
        );
        setFetchLoading(false);
        setFetchErrorMessage(normalizedError[0].reason);
      });
  }, []);

  const onSubmit = () => {
    if (selectedSubscription === currentSubscriptionOnAccount) {
      return;
    }

    setUpdateLoading(true);
    setUpdateErrorMessage('');

    props
      .updateAccountSettings({
        longview_subscription: selectedSubscription || null
      })
      .then(_ => {
        setUpdateLoading(false);
        if (selectedSubscription === '') {
          props.updateAccountSettingsInStore({ longview_subscription: null });
        }
      })
      .catch(err => {
        const normalizedError = getAPIErrorOrDefault(
          err,
          'There was an error updating your Longview Plan.'
        );
        setUpdateLoading(false);
        setUpdateErrorMessage(normalizedError[0].reason);
        // @todo: handle error
      });
  };

  const onRadioSelect = (e: React.FormEvent<HTMLInputElement>) =>
    setSelectedSubscription(e.currentTarget.value);

  const styles = useStyles();

  const rowProps = {
    onRadioSelect,
    onRowSelect: setSelectedSubscription,
    currentSubscriptionOnAccount,
    selectedSubscription
  };

  const Head = (
    <TableRow>
      <TableCell className={styles.planCell}>Plan</TableCell>
      <TableCell className={styles.clientCell}>Clients</TableCell>
      <TableCell className={styles.dataRetentionCell}>Data Retention</TableCell>
      <TableCell className={styles.dataResolutionCell}>
        Data Resolution
      </TableCell>
      <TableCell className={styles.priceCell}>Price</TableCell>
    </TableRow>
  );

  const renderBody = () => {
    if (fetchLoading) {
      return <TableRowLoading colSpan={12} />;
    }

    if (fetchErrorMessage) {
      return <TableRowError colSpan={12} message={fetchErrorMessage} />;
    }

    return (
      <>
        <LongviewSubscriptionRow
          key={'lv-free'}
          id={''}
          plan="Longview Free"
          clients={10}
          dataRetention="Limited to 12 hours"
          dataResolution="Every 5 minutes"
          price="FREE"
          {...rowProps}
        />
        {subscriptions.map(subscription => (
          <LongviewSubscriptionRow
            key={subscription.id}
            id={subscription.id}
            plan={subscription.label}
            clients={subscription.clients_included}
            dataRetention="Unlimited"
            dataResolution="Every minute"
            price={formatPrice(subscription.price)}
            {...rowProps}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <DocumentTitleSegment segment="Plan Details" />
      <Paper className={styles.root}>
        {updateErrorMessage && <Notice error text={updateErrorMessage} />}
        <Table className={styles.table} isResponsive={false}>
          <TableHead>{Head}</TableHead>
          <TableBody>{renderBody()}</TableBody>
        </Table>
        <Button
          className={styles.submitButton}
          buttonType="primary"
          onClick={onSubmit}
          loading={updateLoading}
          disabled={Boolean(fetchErrorMessage)}
        >
          Change Plan
        </Button>
      </Paper>
    </>
  );
};

const enhanced = compose<CombinedProps, {}>(
  React.memo,
  accountSettingsContainer()
);

export default enhanced(LongviewPlans);

export const formatPrice = (price: LongviewSubscription['price']): string => {
  return `$${price.hourly.toFixed(2)}/hr ($${price.monthly}/mo)`;
};

interface LongviewSubscriptionRowProps {
  id: string;
  plan: string;
  clients: number;
  dataRetention: string;
  dataResolution: string;
  price: string;
  onRowSelect: (plan: string) => void;
  onRadioSelect: (e: React.FormEvent<HTMLInputElement>) => void;
  currentSubscriptionOnAccount: string;
  selectedSubscription: string;
}

export const LongviewSubscriptionRow: React.FC<
  LongviewSubscriptionRowProps
> = props => {
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
    selectedSubscription
  } = props;

  const styles = useStyles();

  return (
    <TableRow
      key={id}
      onClick={() => onRowSelect(id)}
      rowLink={() => onRowSelect(id)}
    >
      <TableCell>
        <div className={styles.currentSubscriptionLabel}>
          <Radio
            value={id}
            checked={selectedSubscription === id}
            onChange={onRadioSelect}
            className={styles.radio}
            id={id}
          />
          {plan}
          {currentSubscriptionOnAccount === id && (
            <Chip label="Current Plan" className={styles.chip} />
          )}
        </div>
      </TableCell>
      <TableCell className={styles.clientCell}>{clients}</TableCell>
      <TableCell className={styles.dataRetentionCell}>
        {dataRetention}
      </TableCell>
      <TableCell className={styles.dataResolutionCell}>
        {dataResolution}
      </TableCell>
      <TableCell className={styles.priceCell}>{price}</TableCell>
    </TableRow>
  );
};
