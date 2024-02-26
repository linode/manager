import LinkIcon from '@mui/icons-material/Link';
import * as React from 'react';

export const Preferences = () => {
  return (
    <>
      <h4 style={{ marginBottom: 4 }}>Preferences</h4>
      <a
        href="/profile/settings?preferenceEditor=true"
        style={{ color: '#fff' }}
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
