import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';

const DEFAULT_DELAY = 1000;

interface LandingLoadingProps {
  /** If true, the loading indicator will not be rendered for 1 second which may give user's with fast connections a more fluid experience. */
  shouldDelay?: boolean;
  /**  If given, the loading indicator will not be rendered for the given duration in milliseconds */
  delayInMS?: number;
  /**  Allow children to be passed in to override the default loading indicator */
  children?: JSX.Element;
}

export const LandingLoading = ({
  shouldDelay,
  delayInMS,
  children,
}: LandingLoadingProps): JSX.Element | null => {
  const [showLoading, setShowLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    /* This `didCancel` business is to prevent a warning from React.
     * See: https://github.com/facebook/react/issues/14369#issuecomment-468267798
     */
    let didCancel = false;
    // Reference to the timeoutId so we can cancel it
    let timeoutId: NodeJS.Timeout | null = null;

    if (shouldDelay || typeof delayInMS === 'number') {
      // Used specified duration or default
      const delayDuration =
        typeof delayInMS === 'number' ? delayInMS : DEFAULT_DELAY;

      timeoutId = setTimeout(() => {
        if (!didCancel) {
          setShowLoading(true);
        }
      }, delayDuration);
    } else {
      setShowLoading(true);
    }
    return () => {
      didCancel = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldDelay, delayInMS]);

  return showLoading ? children || <CircleProgress /> : null;
};
