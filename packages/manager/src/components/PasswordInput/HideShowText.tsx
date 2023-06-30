import * as React from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { TextField, TextFieldProps } from '../TextField';

export const HideShowText = (props: TextFieldProps) => {
  const [hidden, setHidden] = React.useState(true);

  const toggle = () => setHidden((prev) => !prev);

  return (
    <TextField
      {...props}
      dataAttrs={{
        'data-qa-hide': hidden,
      }}
      type={hidden ? 'password' : 'text'}
      InputProps={{
        startAdornment: hidden ? (
          <Visibility onClick={toggle} style={{ marginLeft: 14 }} />
        ) : (
          <VisibilityOff onClick={toggle} style={{ marginLeft: 14 }} />
        ),
      }}
      autoComplete="off"
    />
  );
};
