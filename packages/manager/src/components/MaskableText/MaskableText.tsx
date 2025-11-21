import { usePreferences } from '@linode/queries';
import { Stack, Typography, VisibilityTooltip } from '@linode/ui';
import * as React from 'react';
import type { JSX } from 'react';

import { createMaskedText } from 'src/utilities/createMaskedText';

import type { SxProps, Theme } from '@mui/material';

export type MaskableTextLength = 'ipv4' | 'ipv6' | 'plaintext';

export interface MaskableTextProps {
  /**
   * (Optional) original JSX element to render if the text is not masked.
   */
  children?: JSX.Element | JSX.Element[];
  /**
   * Optionally specifies the position of the VisibilityTooltip icon either before or after the text.
   * @default end
   */
  iconPosition?: 'end' | 'start';
  /**
   * If true, displays a VisibilityTooltip icon to toggle the masked and unmasked text.
   * @default false
   */
  isToggleable?: boolean;
  /**
   * Optionally specifies the length of the masked text to depending on data type (e.g. 'ipv4', 'ipv6', 'plaintext'); if not provided, will use a default length.
   */
  length?: MaskableTextLength | number;
  /**
   * Optional styling for the masked and unmasked Typography
   */
  sxTypography?: SxProps<Theme>;
  /**
   * Optional styling for VisibilityTooltip icon
   */
  sxVisibilityTooltip?: SxProps<Theme>;
  /**
   * The original, maskable content; can be a string or any JSX/ReactNode.
   * If the text is not masked, render this text or the styled text via children.
   */
  text: React.ReactNode | string | undefined;
}

export const MaskableText = (props: MaskableTextProps) => {
  const {
    children,
    iconPosition = 'end',
    isToggleable = false,
    length,
    sxTypography,
    sxVisibilityTooltip,
    text,
  } = props;

  const { data: maskedPreferenceSetting } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const [isMasked, setIsMasked] = React.useState(maskedPreferenceSetting);

  const unmaskedText =
    children ??
    (typeof text === 'string' ? (
      <Typography sx={sxTypography}>{text}</Typography>
    ) : (
      text // JSX (ReactNode)
    ));

  // Return early based on the preference setting and the original text.

  if (!text) {
    return;
  }

  if (!maskedPreferenceSetting) {
    return unmaskedText;
  }

  const maskedText = createMaskedText(text, length);

  return (
    <Stack
      alignItems="center"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      {iconPosition === 'start' && isToggleable && (
        <VisibilityTooltip
          handleClick={() => setIsMasked(!isMasked)}
          isVisible={!isMasked}
          sx={{
            marginLeft: 0,
            marginRight: '8px',
            ...sxVisibilityTooltip,
          }}
        />
      )}
      {isMasked ? (
        <Typography sx={{ overflowWrap: 'anywhere', ...sxTypography }}>
          {maskedText}
        </Typography>
      ) : (
        unmaskedText
      )}
      {iconPosition === 'end' && isToggleable && (
        <VisibilityTooltip
          handleClick={() => setIsMasked(!isMasked)}
          isVisible={!isMasked}
        />
      )}
    </Stack>
  );
};
