import React from 'react';

import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { getNextThemeValue } from 'src/utilities/theme';
import { isOSMac } from 'src/utilities/userAgent';

export const useGlobalKeyboardListener = () => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updateUserPreferences } = useMutatePreferences();
  const [goToOpen, setGoToOpen] = React.useState(false);

  const theme = preferences?.theme;

  const keyboardListener = React.useCallback(
    (event: KeyboardEvent) => {
      const letterForThemeShortcut = 'D';
      const letterForGoToOpen = 'K';
      const modifierKey = isOSMac ? 'ctrlKey' : 'altKey';
      if (event[modifierKey] && event.shiftKey) {
        switch (event.key) {
          case letterForThemeShortcut:
            const currentTheme = theme;
            const newTheme = getNextThemeValue(currentTheme);

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
    // eslint-disable-next-line scanjs-rules/call_addEventListener
    document.addEventListener('keydown', keyboardListener);
    return () => {
      document.removeEventListener('keydown', keyboardListener);
    };
  }, [keyboardListener]);

  return { goToOpen, setGoToOpen };
};
