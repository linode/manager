import { Typography } from '@mui/material';
import * as React from 'react';

import { createMaskedText } from 'src/utilities/createMaskedText';

import { Stack } from '../Stack';
import { MaskableTextTooltip } from './MaskableTextTooltip';

interface Props {
  /**
   * (Optional) original JSX element to render if the text is not masked.
   */
  children?: JSX.Element;
  /**
   * If true, the user has enabled masking sensitive data in their Profile settings.
   */
  isMaskedPreferenceEnabled: boolean;
  /**
   * If true, displays a MaskableTextTooltip icon to toggle the masked and unmasked text.
   */
  isToggleable?: boolean;
  /**
   * The original, maskable text; if the text is not masked, render this text or the styled text via children.
   */
  text: string | undefined;
}

export const MaskableText = (props: Props) => {
  const {
    children,
    isMaskedPreferenceEnabled,
    isToggleable = false,
    text,
  } = props;

  const [isMasked, setIsMasked] = React.useState(isMaskedPreferenceEnabled);

  // Return early based on the preference setting and the original text.

  if (!text) {
    return;
  }

  if (!isMaskedPreferenceEnabled) {
    return children ? children : <Typography>{text}</Typography>;
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
      ) : children ? (
        children
      ) : (
        <Typography>{text}</Typography>
      )}
      {isToggleable && (
        <MaskableTextTooltip
          handleClick={() => setIsMasked(!isMasked)}
          isMasked={isMasked}
        />
      )}
    </Stack>
  );
};
