import { InputAdornment } from '@linode/ui';
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
      autoComplete="off"
      dataAttrs={{
        'data-qa-hide': hidden,
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              {hidden ? (
                <Visibility onClick={toggle} />
              ) : (
                <VisibilityOff onClick={toggle} />
              )}
            </InputAdornment>
          ),
        },
      }}
      type={hidden ? 'password' : 'text'}
    />
  );
};
