import * as React from 'react';
import { Link } from 'src/components/Link';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

export interface TypeToConfirmProps extends Omit<TextFieldProps, 'onChange'> {
  confirmationText?: JSX.Element | string;
  textFieldStyle?: React.CSSProperties;
  typographyStyle?: React.CSSProperties;
  visible?: boolean | undefined;
  title?: string;
  hideInstructions?: boolean;
  onChange: (value: string) => void;
}

export const TypeToConfirm = (props: TypeToConfirmProps) => {
  const {
    confirmationText,
    textFieldStyle,
    typographyStyle,
    title,
    visible,
    hideInstructions,
    onChange,
    ...rest
  } = props;

  /*
    There was an edge case bug where, when preferences?.type_to_confirm was undefined,
    the type-to-confirm input did not appear and the language in the instruction text
    did not match. If 'visible' is not explicitly false, we treat it as true.
  */

  const showTypeToConfirmInput = visible !== false;
  const disableOrEnable = showTypeToConfirmInput ? 'disable' : 'enable';

  return (
    <>
      {showTypeToConfirmInput ? (
        <>
          <Typography variant="h2">{title}</Typography>
          <Typography style={typographyStyle}>{confirmationText}</Typography>
          <TextField
            style={textFieldStyle}
            onChange={(e) => onChange(e.target.value)}
            {...rest}
          />
        </>
      ) : null}
      {!hideInstructions ? (
        <Typography
          data-testid="instructions-to-enable-or-disable"
          sx={{ marginTop: 1 }}
        >
          To {disableOrEnable} type-to-confirm, go to the Type-to-Confirm
          section of <Link to="/profile/settings">My Settings</Link>.
        </Typography>
      ) : null}
    </>
  );
};
