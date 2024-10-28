import { VisibilityTooltip } from '@linode/ui';
import { Typography } from '@mui/material';
import * as React from 'react';

import { usePreferences } from 'src/queries/profile/preferences';
import { createMaskedText } from 'src/utilities/createMaskedText';

import { Stack } from '../Stack';

export interface MaskableTextProps {
  /**
   * (Optional) original JSX element to render if the text is not masked.
   */
  children?: JSX.Element;
  /**
   * If true, displays a VisibilityTooltip icon to toggle the masked and unmasked text.
   */
  isToggleable?: boolean;
  /**
   * The original, maskable text; if the text is not masked, render this text or the styled text via children.
   */
  text: string | undefined;
}

export const MaskableText = (props: MaskableTextProps) => {
  const { children, isToggleable = false, text } = props;

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
          {createMaskedText(text)}
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