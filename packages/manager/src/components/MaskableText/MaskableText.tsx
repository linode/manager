import { Typography } from '@mui/material';
import * as React from 'react';

import { createMaskedText } from 'src/utilities/createMaskedText';

import { Stack } from '../Stack';
import { MaskableTextTooltip } from './MaskableTextTooltip';

interface Props {
  children?: JSX.Element;
  isRedacted: boolean;
  isToggleable?: boolean;
  text: string | undefined;
}

export const MaskableText = (props: Props) => {
  const { children, isRedacted, isToggleable = false, text } = props;

  const [isMasked, setIsMasked] = React.useState(isRedacted);

  // Return early based on the prop value and the original text.
  if (!text) {
    return;
  }

  if (!isRedacted) {
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
