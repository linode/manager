import { ActivePromotion } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import ExpansionPanel from 'src/components/ExpansionPanel';
import withAccount from 'src/containers/account.container';
import useFlags from 'src/hooks/useFlags';

import PanelContent from './PanelContent';

import formatDate from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  promoNotice: {
    fontFamily: theme.font.normal,
    color: theme.color.green
  }
}));

interface StateProps {
  accountLoading: boolean;
  accountError?: APIError[];
  accountUpdated: number;
  promotions: ActivePromotion[];
}

export type CombinedProps = StateProps;

export const PromotionsPanel: React.FC<StateProps> = props => {
  const { accountError, accountLoading, accountUpdated, promotions } = props;
  const classes = useStyles();
  const flags = useFlags();

  if (!flags.promos) {
    return null;
  }

  const expireDate = pathOr(null, [0, 'expire_dt'], promotions);
  const formattedDated = expireDate
    ? formatDate(expireDate, { format: 'D-MMM-YYYY' })
    : null;
  const header = expireDate ? (
    <span>
      {'Promotions & Credits '}{' '}
      <em className={classes.promoNotice}>
        &#8212; You have promotional credits expiring {formattedDated}
      </em>
    </span>
  ) : (
    'Promotions & Credits'
  );

  return (
    <ExpansionPanel heading={header}>
      <PanelContent
        error={Boolean(accountError)}
        loading={accountLoading && accountUpdated === 0}
        promotions={promotions}
      />
    </ExpansionPanel>
  );
};

const enhanced = compose<CombinedProps, {}>(
  withAccount(
    (ownProps, accountLoading, lastUpdated, accountError, accountData) => ({
      ...ownProps,
      // Should never be more than one of these for the MVF
      promotions: pathOr([], ['active_promotions'], accountData),
      accountUpdated: lastUpdated,
      accountError: accountError.read,
      accountLoading
    })
  )
);
export default enhanced(PromotionsPanel);
