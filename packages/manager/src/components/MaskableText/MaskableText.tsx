import { VisibilityTooltip } from '@linode/ui';
import { Typography } from '@mui/material';
import * as React from 'react';

import { usePreferences } from 'src/queries/profile/preferences';
import { createMaskedText } from 'src/utilities/createMaskedText';

import { Stack } from '../Stack';

export type MaskableTextLength = 'ipv4' | 'ipv6' | 'plaintext';

export interface MaskableTextProps {
  /**
   * (Optional) original JSX element to render if the text is not masked.
   */
  children?: JSX.Element | JSX.Element[];
  /**
   * If true, displays a VisibilityTooltip icon to toggle the masked and unmasked text.
   */
  isToggleable?: boolean;
  /**
   * Optionally specifies the length of the masked text to depending on data type (e.g. 'ipv4', 'ipv6', 'plaintext'); if not provided, will use a default length.
   */
  length?: MaskableTextLength;
  /**
   * The original, maskable text; if the text is not masked, render this text or the styled text via children.
   */
  text: string | undefined;
}

export const MaskableText = (props: MaskableTextProps) => {
  const { children, isToggleable = false, text, length } = props;

  const { data: preferences } = usePreferences();
  const maskedPreferenceSetting = preferences?.maskSensitiveData;

  const [isMasked, setIsMasked] = React.useState(maskedPreferenceSetting);

  const unmaskedText = children ? children : <Typography>{text}</Typography>;

  // Return early based on the preference setting and the original text.

  if (!text) {
    return;
  }

  if (!maskedPreferenceSetting) {
    return unmaskedText;
  }

  return (
    <Stack
      alignItems="center"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      {isMasked ? (
        <Typography sx={{ overflowWrap: 'anywhere' }}>
          {createMaskedText(text, length)}
        </Typography>
      ) : (
        unmaskedText
      )}
      {isToggleable && (
        <VisibilityTooltip
          handleClick={() => setIsMasked(!isMasked)}
          isVisible={!isMasked}
        />
      )}
    </Stack>
  );
};
