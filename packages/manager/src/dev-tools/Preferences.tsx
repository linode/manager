import LinkIcon from '@mui/icons-material/Link';
import { useTheme } from '@mui/material';
import * as React from 'react';

export const Preferences = () => {
  const theme = useTheme();
  return (
    <>
      <h4 style={{ marginBottom: 4 }}>Preferences</h4>
      <a
        href="/profile/settings?preferenceEditor=true"
        style={{ color: theme.tokens.color.Neutrals.White }}
      >
        Open preference Modal
        <LinkIcon
          style={{
            height: 20,
            left: 4,
            position: 'relative',
            top: 6,
            width: 20,
          }}
        />
      </a>
    </>
  );
};
