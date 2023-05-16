import { styled } from '@mui/material/styles';
import * as React from 'react';
import Link from 'src/components/Link';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';

export interface TypeToConfirmProps {
  confirmationText?: JSX.Element | string;
  onChange: (str: string) => void;
  label: string;
  hideLabel?: boolean;
  textFieldStyle?: React.CSSProperties;
  typographyStyle?: React.CSSProperties;
  visible?: boolean | undefined;
  title?: string;
  hideInstructions?: boolean;
  // This is a string index signature.
  // This means that all properties in 'Props' are assignable to any
  [propName: string]: any;
}

export const TypeToConfirm = (props: TypeToConfirmProps) => {
  const {
    confirmationText,
    onChange,
    label,
    hideLabel,
    textFieldStyle,
    typographyStyle,
    title,
    visible,
    hideInstructions,
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
            label={label}
            hideLabel={hideLabel}
            onChange={(e) => onChange(e.target.value)}
            style={textFieldStyle}
            {...rest}
          />
        </>
      ) : null}
      {!hideInstructions ? (
        <StyledTypography data-testid="instructions-to-enable-or-disable">
          To {disableOrEnable} type-to-confirm, go to the Type-to-Confirm
          section of <Link to="/profile/settings">My Settings</Link>.
        </StyledTypography>
      ) : null}
    </>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(),
}));
