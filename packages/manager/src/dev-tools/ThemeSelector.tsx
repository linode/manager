import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useDispatch, useStore } from 'react-redux';

import { setMockTheme } from 'src/store/mockTheme';
import { getStorage, setStorage } from 'src/utilities/storage';

import type { Dispatch } from 'src/hooks/types';

export const MOCK_THEME_STORAGE_KEY = 'devTools/theme';

export interface ThemeSelectionOptions {
  label: string;
  value: 'dark' | 'light' | 'system';
}

export const ThemeSelector = () => {
  const dispatch: Dispatch = useDispatch();
  const store = useStore();
  const state = store.getState();

  console.log(state);

  React.useEffect(() => {
    const storedTheme = getStorage(MOCK_THEME_STORAGE_KEY);
    if (storedTheme) {
      dispatch(setMockTheme(storedTheme));
    }
  }, [dispatch]);

  const handleSetTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as ThemeSelectionOptions['value'];
    dispatch(setMockTheme(selectedValue));
    setStorage(MOCK_THEME_STORAGE_KEY, e.target.value);
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginBottom: 8 }}>Theme Selector</h4>
      </Grid>
      <Grid xs={12}>
        <select
          onChange={(e) => handleSetTheme(e)}
          value={state.mockTheme.value}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Grid>
    </Grid>
  );
};
