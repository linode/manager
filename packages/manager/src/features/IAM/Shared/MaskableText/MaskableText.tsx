import { Tooltip } from '@akamai/cds-components/react/Tooltip';
import { usePreferences } from '@linode/queries';
import * as React from 'react';
import type { JSX } from 'react';

import {
  StyledIcon,
  StyledToggleButton,
  StyledWrapper,
} from './MaskableText.styles';

const DEFAULT_MASKED_TEXT_LENGTH = 12;

export interface MaskableTextProps {
  /**
   * (Optional) original JSX element to render if the text is not masked.
   */
  children?: JSX.Element | JSX.Element[];
  /**
   * If true, displays a VisibilityTooltip icon to toggle the masked and unmasked text.
   * @default false
   */
  isToggleable?: boolean;
  /**
   * Optionally specifies the length of the masked text; if not provided, will use a default length.
   */
  length?: number;
  /**
   * Optional styling for the masked and unmasked Typography
   */
  styleTypography?: React.CSSProperties;
  /**
   * The original, maskable content; can be a string or any JSX/ReactNode.
   * If the text is not masked, render this text or the styled text via children.
   */
  text: React.ReactNode | string | undefined;
}

export const MaskableText = (props: MaskableTextProps) => {
  const {
    children,
    isToggleable = false,
    length,
    styleTypography,
    text,
  } = props;

  const { data: maskedPreferenceSetting } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const [isMasked, setIsMasked] = React.useState(maskedPreferenceSetting);

  const unmaskedText =
    children ??
    (typeof text === 'string' ? (
      <p style={styleTypography}>{text}</p>
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

  const maskedText = '•'.repeat(length ?? DEFAULT_MASKED_TEXT_LENGTH);

  return (
    <StyledWrapper>
      {isMasked ? (
        <p style={{ overflowWrap: 'anywhere', margin: 0, ...styleTypography }}>
          {maskedText}
        </p>
      ) : (
        unmaskedText
      )}
      {isToggleable && (
        <Tooltip
          noArrow={true}
          tooltipPlacement="top"
          tooltipText={isMasked ? 'Show' : 'Hide'}
        >
          <StyledToggleButton
            data-testid="maskable-text-toggle"
            onClick={() => setIsMasked(!isMasked)}
            variant="icon"
          >
            {isMasked ? (
              <StyledIcon icon="show" size="s" />
            ) : (
              <StyledIcon icon="hide" size="s" />
            )}
          </StyledToggleButton>
        </Tooltip>
      )}
    </StyledWrapper>
  );
};
