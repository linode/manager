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
    return text;
  }

  return (
    <Stack
      alignItems="center"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      {isMasked ? createMaskedText(text) : children ? children : text}
      {isToggleable && (
        <MaskableTextTooltip
          handleClick={() => setIsMasked(!isMasked)}
          isMasked={isMasked}
        />
      )}
    </Stack>
  );
};
