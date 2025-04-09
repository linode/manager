import { isOSMac } from '@linode/utilities';
import React from 'react';

import { useMutatePreferences, usePreferences } from '@linode/queries';
import { getNextThemeValue } from 'src/utilities/theme';

export const useGlobalKeyboardListener = () => {
  const { data: theme } = usePreferences((preferences) => preferences?.theme);
  const { mutateAsync: updateUserPreferences } = useMutatePreferences();
  const [goToOpen, setGoToOpen] = React.useState(false);

  const keyboardListener = React.useCallback(
    (event: KeyboardEvent) => {
      const letterForThemeShortcut = 'D';
      const letterForGoToOpen = 'K';
      const modifierKey = isOSMac ? 'ctrlKey' : 'altKey';
      if (event[modifierKey] && event.shiftKey) {
        switch (event.key) {
          case letterForThemeShortcut:
            const newTheme = getNextThemeValue(theme);

            updateUserPreferences({ theme: newTheme });
            break;
          case letterForGoToOpen:
            setGoToOpen(!goToOpen);
            break;
        }
      }
    },

    [goToOpen, theme, updateUserPreferences]
  );

  React.useEffect(() => {
    /**
     * Allow an Easter egg for toggling the theme with
     * a key combination
     */
    document.addEventListener('keydown', keyboardListener);
    return () => {
      document.removeEventListener('keydown', keyboardListener);
    };
  }, [keyboardListener]);

  return { goToOpen, setGoToOpen };
};
