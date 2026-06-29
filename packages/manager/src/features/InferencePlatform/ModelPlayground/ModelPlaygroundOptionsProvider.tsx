import React, { useCallback, useMemo, useState } from 'react';

import { ModelPlaygroundOptionsContext } from './ModelPlaygroundContext';
import { DEFAULT_PLAYGROUND_SETTINGS } from './types';

import type { PlaygroundSettings } from './types';

interface Props {
  children: React.ReactNode;
}

export const ModelPlaygroundOptionsProvider = ({ children }: Props) => {
  const [settings, setSettings] = useState<PlaygroundSettings>(
    DEFAULT_PLAYGROUND_SETTINGS
  );

  const onSettingsChange = useCallback(
    (patch: Partial<PlaygroundSettings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    []
  );

  const value = useMemo(
    () => ({ onSettingsChange, settings }),
    [onSettingsChange, settings]
  );

  return (
    <ModelPlaygroundOptionsContext.Provider value={value}>
      {children}
    </ModelPlaygroundOptionsContext.Provider>
  );
};
