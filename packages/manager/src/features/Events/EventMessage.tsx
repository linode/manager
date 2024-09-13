import { styled } from '@mui/material/styles';
import * as React from 'react';

interface MessageLinkEntity {
  message: null | string;
}

/**
 * Renders a message with inline code blocks.
 * Meant to be used in the context of an event message.
 * This component is only used to render {e.message} in the case of potential ticks we want to render as <pre>.
 */
export const EventMessage = (props: MessageLinkEntity) => {
  const { message } = props;

  if (!message) {
    return null;
  }

  return formatTicks(message);
};

const formatTicks = (message: string): JSX.Element => {
  const parts = message.split(/(`[^`]*`)/g);

  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <StyledPre key={i}>{part.slice(1, -1)}</StyledPre>
        ) : (
          part
        )
      )}
    </>
  );
};

const StyledPre = styled('pre')(({ theme }) => ({
  backgroundColor: theme.name === 'dark' ? '#222' : '#f4f4f4',
  borderRadius: 4,
  display: 'inline',
  fontSize: '0.75rem',
  padding: '0.15rem 0.25rem',
}));
