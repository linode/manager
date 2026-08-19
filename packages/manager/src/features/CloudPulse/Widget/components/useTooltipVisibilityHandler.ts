import * as React from 'react';

import type { TooltipOwnershipResult } from './chartTypes';

const CLOUDPULSE_TOOLTIP_OWNER_EVENT = 'cloudpulse-widget-tooltip-owner-change';

/**
 * Coordinates tooltip visibility across side-by-side CloudPulse widgets.
 * When one widget claims ownership on hover, other widgets hide their tooltip.
 */
export const useTooltipVisibilityHandler = (
  resetTooltipKeysOnClaimChange?: () => void
): TooltipOwnershipResult => {
  const ownerId = React.useId();
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const claimTooltipVisibility = React.useCallback(() => {
    setIsTooltipVisible((prev) => (prev ? prev : true));

    window.dispatchEvent(
      new CustomEvent<string>(CLOUDPULSE_TOOLTIP_OWNER_EVENT, {
        detail: ownerId,
      })
    );
  }, [ownerId]);

  const releaseTooltipVisibility = React.useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  React.useEffect(() => {
    const handleTooltipOwnerChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail === ownerId) {
        return;
      }

      setIsTooltipVisible(false);
      resetTooltipKeysOnClaimChange?.();
    };

    window.addEventListener(
      CLOUDPULSE_TOOLTIP_OWNER_EVENT,
      handleTooltipOwnerChange
    );

    return () => {
      window.removeEventListener(
        CLOUDPULSE_TOOLTIP_OWNER_EVENT,
        handleTooltipOwnerChange
      );
    };
  }, [resetTooltipKeysOnClaimChange, ownerId]);

  return {
    claimTooltipVisibility,
    isTooltipVisible,
    releaseTooltipVisibility,
  };
};
