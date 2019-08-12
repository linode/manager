import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import withAccount from 'src/containers/account.container';
import useFlags from 'src/hooks/useFlags';
import { expiresInDays } from 'src/utilities/promoUtils';

import PromotionDisplay from './PromotionDisplay';

const useStyles = makeStyles((theme: Theme) => ({
  promoNotice: {
    fontFamily: theme.font.normal
  }
}));

interface StateProps {
  accountLoading: boolean;
  accountError?: Linode.ApiFieldError[];
  accountUpdated: number;
  promotions: Linode.ActivePromotions[];
}

export type CombinedProps = StateProps;

export const PromotionsPanel: React.FC<StateProps> = props => {
  const { promotions } = props;
  const classes = useStyles();
  const flags = useFlags();

  if (!flags.promos) {
    return null;
  }

  const days = expiresInDays(pathOr(null, [0, 'expire_dt'], promotions));
  const header = days ? (
    <span>
      {'Promotions & Credits '}{' '}
      <em style={{ color: '#10a632' }} className={classes.promoNotice}>
        &#8212; You have promotional credits expiring in {days} days.
      </em>
    </span>
  ) : (
    'Promotions & Credits'
  );

  return (
    <ExpansionPanel heading={header}>
      {promotions.length === 0 ? (
        <Typography variant="body1">
          You don't have any active promotions on your account.
        </Typography>
      ) : (
        promotions.map((thisPromotion, idx) => (
          <PromotionDisplay
            key={`promotion-display-${idx}`}
            description={thisPromotion.description}
            expiry={thisPromotion.expire_dt}
            summary={thisPromotion.summary}
          />
        ))
      )}
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
