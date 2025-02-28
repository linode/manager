import { Checkbox, FormControlLabel, TextField, Typography } from '@linode/ui';
import * as React from 'react';

import { FormGroup } from 'src/components/FormGroup';
import { Link } from 'src/components/Link';
import { usePreferences } from 'src/queries/profile/preferences';

import type { TextFieldProps, TypographyProps } from '@linode/ui';
import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material';

export interface TypeToConfirmProps extends Omit<TextFieldProps, 'onChange'> {
  confirmationText?: JSX.Element | string;
  expand?: boolean;
  handleDeleteAccountServices?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  hideInstructions?: boolean;
  isCloseAccount?: boolean;
  onChange: (value: string) => void;
  textFieldStyle?: React.CSSProperties;
  title?: string;
  /**
   * Override the title's variant
   * @default h2
   */
  titleVariant?: TypographyProps['variant'];
  typographyStyle?: React.CSSProperties;
  typographyStyleSx?: SxProps<Theme>;
  visible?: boolean | undefined;
}

export const TypeToConfirm = (props: TypeToConfirmProps) => {
  const {
    confirmationText,
    expand,
    handleDeleteAccountServices,
    hideInstructions,
    isCloseAccount,
    onChange,
    textFieldStyle,
    title,
    typographyStyle,
    typographyStyleSx,
    titleVariant,
    visible = false,
    ...rest
  } = props;

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  /*
    There is an edge case where preferences?.type_to_confirm is undefined
    when the user has not yet set a preference as seen in /profile/settings?preferenceEditor=true.
    Therefore, the 'visible' prop defaults to true unless explicitly set to false, ensuring this feature is enabled by default.
  */

  const showTypeToConfirmInput = Boolean(visible);
  const disableOrEnable =
    showTypeToConfirmInput || Boolean(typeToConfirmPreference)
      ? 'disable'
      : 'enable';

  return (
    <>
      {showTypeToConfirmInput ? (
        <>
          <Typography variant={titleVariant ?? 'h2'}>{title}</Typography>
          <Typography style={typographyStyle} sx={typographyStyleSx}>
            {confirmationText}
          </Typography>
          {isCloseAccount && (
            <FormGroup
              sx={(theme) => ({
                marginTop: theme.tokens.spacing.S4,
                paddingLeft: theme.tokens.spacing.S2,
              })}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="services"
                    onChange={handleDeleteAccountServices}
                  />
                }
                data-qa-checkbox="deleteAccountServices"
                label="Delete all account services and entities (Linodes, volumes, DNS records, etc.)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="users"
                    onChange={handleDeleteAccountServices}
                  />
                }
                data-qa-checkbox="deleteAccountUsers"
                label="Delete all user accounts, including your own."
              />
            </FormGroup>
          )}
          <TextField
            onChange={(e) => onChange(e.target.value)}
            style={textFieldStyle}
            {...rest}
            expand={expand}
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
