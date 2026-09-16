import { Paper } from '@linode/ui';
import React from 'react';

import { BarPercent } from 'src/components/BarPercent';

import styles from './TokenLimitStatus.module.css';

import type { InferenceUsageCredits } from '@linode/api-v4';

interface TokenLimitStatusProps {
  /** Animate the bar from 0 to its value (500ms delay, 900ms strong ease-out) on mount. Defaults to true. */
  animateBar?: boolean;
  isLoading?: boolean;
  tokenLimit?: InferenceUsageCredits;
}

// Map the tokens-used percentage to a risk tier class applied at the widget root.
const getRiskClassName = (percent: number): string => {
  if (percent >= 90) {
    return styles.HighRisk;
  }
  if (percent >= 75) {
    return styles.MediumRisk;
  }
  return styles.Nominal;
};

export const TokenLimitStatus = ({
  animateBar = true,
  isLoading,
  tokenLimit,
}: TokenLimitStatusProps) => {
  const maxCredits = tokenLimit?.max_credits ?? 0;
  const usedCredits = tokenLimit?.used_credits ?? 0;
  const percentUsed =
    maxCredits > 0
      ? Math.min(100, Math.round((usedCredits / maxCredits) * 100))
      : 0;
  const ready = !isLoading && Boolean(tokenLimit);

  // Start the fill at 0 and animate to the value once data is ready, so the
  // bar eases in from empty each time the Usage tab mounts.
  const [barValue, setBarValue] = React.useState(0);

  React.useEffect(() => {
    if (!animateBar || !ready) {
      return;
    }
    const frame = requestAnimationFrame(() => setBarValue(percentUsed));
    return () => cancelAnimationFrame(frame);
  }, [animateBar, ready, percentUsed]);

  // Render only once real data is available so the risk color and percentage
  // are correct on first paint (prevents a blue Nominal -> red HighRisk flash).
  if (!ready || !tokenLimit) {
    return null;
  }

  return (
    <Paper
      className={`${styles.paper} ${getRiskClassName(percentUsed)}`}
      variant="outlined"
    >
      <h3 className={styles.title}>Monthly Tokens Credits Status</h3>

      <div className={styles.gaugeRow}>
        <div className={styles.gauge}>
          <BarPercent
            customColors={[{ color: 'var(--bar-color)', percentage: 0 }]}
            max={100}
            sx={{
              '& .MuiLinearProgress-bar': {
                transition: animateBar
                  ? 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1) 500ms'
                  : 'none',
              },
            }}
            value={animateBar ? barValue : percentUsed}
          />
        </div>
        <span className={styles.percent}>{percentUsed}%</span>
      </div>

      <div className={styles.footerRow}>
        <p className={styles.description}>
          Your token use is at{' '}
          <span className={styles.descriptionPercent}>{percentUsed}%</span> of
          your limit.
          {percentUsed >= 75 &&
            ' Contact support to increase limit and ensure availability.'}
        </p>
      </div>
    </Paper>
  );
};
