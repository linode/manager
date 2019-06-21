import * as React from 'react';
import CircleProgress from '../CircleProgress';

const DEFAULT_DELAY = 1000;

interface Props {
  shouldDelay?: boolean;
  delayInMS?: number;
}

/**
 *
 * LandingLoading
 *
 * If the `shouldDelay` prop is given, the loading indicator will
 * not be rendered for 1 second, which may give user's with fast
 * connections a more fluid experience. Use the `delayInMS` prop
 * to specify an exact delay duration.
 */
export const LandingLoading: React.FC<Props> = ({ shouldDelay, delayInMS }) => {
  const [showLoading, setShowLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    /* This `didCancel` business is to prevent a warning from React.
     * See: https://github.com/facebook/react/issues/14369#issuecomment-468267798
     */
    let didCancel = false;

    if (shouldDelay || typeof delayInMS === 'number') {
      // Used specified duration or default
      const delayDuration =
        typeof delayInMS === 'number' ? delayInMS : DEFAULT_DELAY;

      setTimeout(() => {
        if (!didCancel) {
          setShowLoading(true);
        }
      }, delayDuration);
    } else {
      setShowLoading(true);
    }
    return () => {
      didCancel = true
    };
  }, []);
  return showLoading ? <CircleProgress /> : null;
};

export default LandingLoading;
