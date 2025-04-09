import { TextField } from '@linode/ui';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import * as React from 'react';

import type { TextFieldProps } from '@linode/ui';

export const HideShowText = (props: TextFieldProps) => {
  const [hidden, setHidden] = React.useState(true);

  const toggle = () => setHidden((prev) => !prev);

  return (
    <TextField
      {...props}
      InputProps={{
        startAdornment: hidden ? (
          <Visibility onClick={toggle} style={{ marginLeft: 14 }} />
        ) : (
          <VisibilityOff onClick={toggle} style={{ marginLeft: 14 }} />
        ),
      }}
      dataAttrs={{
        'data-qa-hide': hidden,
      }}
      autoComplete="off"
      type={hidden ? 'password' : 'text'}
    />
  );
};
