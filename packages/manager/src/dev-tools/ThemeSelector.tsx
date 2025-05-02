import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { getStorage, setStorage } from 'src/utilities/storage';

export const MOCK_THEME_STORAGE_KEY = 'devTools/theme';

import type { ThemeChoice } from '@linode/utilities';

export const ThemeSelector = () => {
  const [mockTheme, setMockTheme] = React.useState<ThemeChoice>('system');

  React.useEffect(() => {
    const storedTheme = getStorage(MOCK_THEME_STORAGE_KEY);
    if (storedTheme) {
      setMockTheme(storedTheme);
    }
  }, []);

  const handleSetTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as ThemeChoice;

    setMockTheme(selectedValue);
    setStorage(MOCK_THEME_STORAGE_KEY, selectedValue);
    window.location.reload();
  };

  return (
    <Grid container>
      <Grid size={12}>
        <h4 style={{ marginBottom: 0 }}>MSW Theme Selector</h4>
        <p style={{ marginBottom: 8, marginTop: 0 }}>
          (only when MSW is enabled)
        </p>
      </Grid>
      <Grid size={12}>
        <select
          className="dt-select"
          onChange={handleSetTheme}
          value={mockTheme}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Grid>
    </Grid>
  );
};
