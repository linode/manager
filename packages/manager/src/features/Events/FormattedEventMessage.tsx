import { styled } from '@mui/material/styles';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';

interface MessageLinkEntity {
  message: null | string;
}

/**
 * Renders a message with inline code blocks.
 * Meant to be used in the context of an event message.
 * This component is only used to render {e.message} as JSX in order to:
 *  - render ticks as <pre>.
 *  - render "contact support" strings as <Link>.
 */
export const FormattedEventMessage = (props: MessageLinkEntity) => {
  const { message } = props;

  if (!message) {
    return null;
  }

  return formatMessage(message);
};

const formatMessage = (message: string): JSX.Element => {
  const parts = message.split(/(`[^`]*`)/g);
  const supportLinkMatch = /(contact support)/i;

  return (
    <>
      {parts.map((part, i) => {
        let formattedPart: JSX.Element | string = part;

        if (part.startsWith('`') && part.endsWith('`')) {
          formattedPart = (
            <StyledPre key={`${i}-${part}`}>{part.slice(1, -1)}</StyledPre>
          );
        }

        if (part.match(supportLinkMatch)) {
          const [before, linkText, after] = part.split(supportLinkMatch);

          formattedPart = (
            <span key={`${i}-${part}`}>
              {before}
              <SupportLink text={linkText} />
              {after}
            </span>
          );
        }

        return formattedPart;
      })}
    </>
  );
};

const StyledPre = styled('pre')(({ theme }) => ({
  backgroundColor:
    theme.name === 'dark'
      ? theme.tokens.color.Neutrals.Black
      : theme.tokens.color.Neutrals[5],
  borderRadius: 4,
  display: 'inline',
  fontSize: '0.75rem',
  padding: '0.15rem 0.25rem',
}));
