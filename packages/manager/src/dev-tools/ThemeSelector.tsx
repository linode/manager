import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { getStorage, setStorage } from 'src/utilities/storage';

export const MOCK_THEME_STORAGE_KEY = 'devTools/theme';

export interface ThemeSelectionOptions {
  label: string;
  value: 'dark' | 'light' | 'system';
}

export const ThemeSelector = () => {
  const [mockTheme, setMockTheme] = React.useState<
    ThemeSelectionOptions['value']
  >('system');

  React.useEffect(() => {
    const storedTheme = getStorage(MOCK_THEME_STORAGE_KEY);
    if (storedTheme) {
      setMockTheme(storedTheme);
    }
  }, []);

  const handleSetTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as ThemeSelectionOptions['value'];

    setStorage(MOCK_THEME_STORAGE_KEY, selectedValue);
    window.location.reload();
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginBottom: 8 }}>Theme Selector</h4>
      </Grid>
      <Grid xs={12}>
        <select onChange={(e) => handleSetTheme(e)} value={mockTheme}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Grid>
    </Grid>
  );
};
