import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

import PromotionDisplay from './PromotionDisplay';

interface Props {
  error?: boolean;
  loading: boolean;
  promotions: Linode.ActivePromotion[];
}

export type CombinedProps = Props;

export const PanelContent: React.FC<Props> = props => {
  const { error, loading, promotions } = props;
  if (loading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="Unable to load your promotions and credit information." />
    );
  }

  if (promotions.length === 0 && !loading) {
    return (
      <Typography variant="body1">
        You don't have any active promotions on your account.
      </Typography>
    );
  }

  return (
    <>
      {promotions.map((thisPromotion, idx) => (
        <PromotionDisplay
          key={`promotion-display-${idx}`}
          description={thisPromotion.description}
          expiry={thisPromotion.expire_dt}
          summary={thisPromotion.summary}
        />
      ))}
    </>
  );
};

export default PanelContent;
