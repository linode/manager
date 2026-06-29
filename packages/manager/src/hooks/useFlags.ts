import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { FeatureFlagContext } from 'src/featureFlags';

import type { ApplicationState } from 'src/store';

/**
 * Wrapper around LaunchDarkly, so that we can replace this context
 * without updating imports in every consumer.
 *
 * The featureFlagClient client may be needed in some cases, which in turn
 * may require us to do a more involved abstraction.
 *
 * Usage:
 *
 * const flags = useFlags();
 */
export const useFlags = () => {
  const featureFlagClient = React.useContext(FeatureFlagContext);

  // Mock flags are set by custom dev tools and saved in local storage, and override real flags.
  const mockFlags = useSelector(
    (state: ApplicationState) => state.mockFeatureFlags
  );

  const [flags, setFlags] = useState(featureFlagClient.getFlags() ?? {});

  useEffect(() => {
    const cleanup = featureFlagClient.subscribe((newFlags) => {
      setFlags(newFlags);
    });

    return () => {
      cleanup();
    };
  }, []);

  return {
    ...flags,
    ...mockFlags,
  };
};
