import { Box, Stack, useTheme } from '@linode/ui';
import Check from '@mui/icons-material/Check';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import { keyframes } from '@mui/material/styles';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';

import AI from 'src/assets/icons/entityIcons/ai.svg';
import CoreUser from 'src/assets/icons/entityIcons/coreuser.svg';
import { Markdown } from 'src/components/Markdown/Markdown';

import { ModelPlaygroundOutputContext } from './ModelPlaygroundContext';

import type { Message } from './ModelPlaygroundContext';

const breathe = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
`;

const textBreathe = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const cursorBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const ripple = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

const DOT_SX = {
  animation: `${breathe} 1.2s ease-in-out infinite`,
  bgcolor: 'text.secondary',
  borderRadius: '50%',
  height: 8,
  width: 8,
} as const;

const ICON_AND_SECONDARY_COLOR = 'text.secondary' as const;

const ICON_BOX_SX = {
  alignItems: 'center',
  alignSelf: 'flex-start',
  bgcolor: 'action.selected',
  borderRadius: 1,
  color: ICON_AND_SECONDARY_COLOR,
  display: 'flex',
  flexShrink: 0,
  height: 40,
  justifyContent: 'center',
  position: 'sticky',
  top: 0,
  width: 40,
} as const;

const MARKDOWN_SX = {
  '& p': { lineHeight: 1.8 },
  '& p:first-of-type': { mt: 0 },
  '& p:last-of-type': { mb: 0 },
} as const;

const ReasoningBlock = memo(
  ({
    isStreaming,
    thinking,
    wasInterrupted,
  }: {
    isStreaming: boolean;
    thinking: string;
    wasInterrupted: boolean;
  }) => {
    // If thinking response is interrupted, reasoning block should render open with no animation
    const [open, setOpen] = useState(() => wasInterrupted);
    const [constrainHeight, setConstrainHeight] = useState(false);
    const theme = useTheme();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Open when streaming begins; close when it finishes.
    // Delay removing the height constraint until after the Collapse animation (300ms).
    useEffect(() => {
      if (isStreaming) {
        setConstrainHeight(true);
        setOpen(true);
        return;
      }
      if (wasInterrupted) {
        // Remove the height constraint so all interrupted reasoning is visible.
        setConstrainHeight(false);
        return;
      }
      setOpen(false);
      const t = setTimeout(() => setConstrainHeight(false), 300);
      return () => clearTimeout(t);
    }, [isStreaming, wasInterrupted]);

    // Scroll to bottom of preview as reasoning arrives.
    useEffect(() => {
      if (isStreaming && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [isStreaming, thinking]);

    return (
      <Box sx={{ mb: 2 }}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            border: `1px solid ${theme.borderColors.divider}`,
            borderRadius: open ? '8px 8px 0 0' : '8px',
            cursor: 'pointer',
            minHeight: 40,
            px: 1.5,
            userSelect: 'none',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Stack alignItems="center" direction="row" gap={1}>
            <Box
              sx={{
                animation: isStreaming
                  ? `${ripple} 1.2s ease-out infinite`
                  : 'none',
                bgcolor: isStreaming
                  ? 'text.disabled'
                  : wasInterrupted
                    ? theme.palette.warning.main
                    : theme.tokens.alias.Content.Icon.Recommendation,
                borderRadius: '50%',
                flexShrink: 0,
                height: 11,
                transition: 'background-color 0.3s',
                width: 11,
              }}
            />
            <Box
              component="span"
              sx={{
                animation: isStreaming
                  ? `${textBreathe} 1.4s ease-in-out infinite`
                  : 'none',
                fontFamily: theme.font.bold,
                fontSize: theme.tokens.font.FontSize.Xs,
              }}
            >
              Reasoning
            </Box>
            {!isStreaming && !wasInterrupted && (
              <Check
                sx={{
                  color: theme.tokens.alias.Content.Icon.Recommendation,
                  fontSize: '20px',
                  ml: 0.5,
                }}
              />
            )}
          </Stack>
          <KeyboardArrowDown
            sx={{
              color: ICON_AND_SECONDARY_COLOR,
              fontSize: '1.25rem',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </Stack>
        <Collapse in={open}>
          <Box
            ref={scrollRef}
            sx={{
              border: `1px solid ${theme.borderColors.divider}`,
              borderRadius: '0 0 8px 8px',
              borderTop: 'none',
              color: ICON_AND_SECONDARY_COLOR,
              fontSize: theme.tokens.font.FontSize.Xs,
              maxHeight: constrainHeight ? 120 : 'none',
              overflowY: constrainHeight ? 'auto' : 'visible',
              px: 1.5,
              py: 1,
            }}
          >
            <Markdown textOrMarkdown={thinking} />
          </Box>
        </Collapse>
      </Box>
    );
  }
);

const UserMessageRow = memo(({ message }: { message: Message }) => {
  const theme = useTheme();

  return (
    <Stack alignItems="flex-start" direction="row" gap={1.5} sx={{ mb: 4 }}>
      <Box sx={ICON_BOX_SX}>
        <CoreUser />
      </Box>
      <Box
        sx={{
          bgcolor:
            theme.palette.mode === 'light'
              ? theme.tokens.color.Ultramarine[20]
              : theme.tokens.alias.Background.Informativesubtle,
          borderRadius: '30px',
          maxWidth: '80%',
          px: '18px',
          py: '8px',
        }}
      >
        <Box sx={MARKDOWN_SX}>
          <Markdown textOrMarkdown={message.content} />
        </Box>
      </Box>
    </Stack>
  );
});

interface AssistantMessageRowProps {
  isStreaming: boolean;
  message: Message;
}

const AssistantMessageRow = memo(
  ({ isStreaming, message }: AssistantMessageRowProps) => {
    const hasAnyChunk = Boolean(message.content || message.thinking);
    const hasAnswerContent = Boolean(message.content);

    return (
      <Stack alignItems="flex-start" direction="row" gap={1.5} sx={{ mb: 4 }}>
        <Box sx={{ ...ICON_BOX_SX, '& svg': { height: 24, width: 24 } }}>
          <AI />
        </Box>
        <Box sx={{ ...MARKDOWN_SX, flex: 1, minWidth: 0 }}>
          {isStreaming && !hasAnyChunk && (
            <Stack
              alignItems="center"
              direction="row"
              gap={0.75}
              sx={{ pt: 2.0 }}
            >
              <Box sx={{ ...DOT_SX }} />
              <Box sx={{ ...DOT_SX, animationDelay: '0.2s' }} />
              <Box sx={{ ...DOT_SX, animationDelay: '0.4s' }} />
            </Stack>
          )}
          {message.thinking && (
            <ReasoningBlock
              isStreaming={isStreaming && message.content === ''}
              thinking={message.thinking}
              wasInterrupted={!isStreaming && message.content === ''}
            />
          )}
          <Markdown textOrMarkdown={message.content} />
          {isStreaming && hasAnswerContent && (
            <Box
              component="span"
              sx={{
                animation: `${cursorBlink} 0.8s step-start infinite`,
                borderRight: '2px solid',
                display: 'inline-block',
                height: '1em',
                ml: '1px',
                verticalAlign: 'text-bottom',
              }}
            />
          )}
        </Box>
      </Stack>
    );
  }
);

export const OutputBox = () => {
  const { messages, streamingMessageId } = useContext(
    ModelPlaygroundOutputContext
  );
  const theme = useTheme();
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Tracks a queued scroll RAF so frequent stream updates don't stack
  // multiple scrollIntoView calls in consecutive frames.
  const scrollFrameRef = useRef<null | number>(null);
  const shouldAutoScrollRef = useRef(true);

  const handleScroll = () => {
    const box = scrollBoxRef.current;

    if (!box) {
      return;
    }

    const distanceFromBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    // Coalesce rapid updates into one pending frame.
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: streamingMessageId ? 'auto' : 'smooth',
        block: 'end',
      });
      scrollFrameRef.current = null;
    });

    return () => {
      // Prevent stale queued scroll work after dependency changes/unmount.
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [messages, streamingMessageId]);

  return (
    <Box
      onScroll={handleScroll}
      ref={scrollBoxRef}
      sx={{
        bgcolor:
          theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
        flex: 1,
        overflowY: 'auto',
        p: 2,
      }}
    >
      {messages.map((message) =>
        message.role === 'user' ? (
          <UserMessageRow key={message.id} message={message} />
        ) : (
          <AssistantMessageRow
            isStreaming={message.id === streamingMessageId}
            key={message.id}
            message={message}
          />
        )
      )}
      <div ref={bottomRef} />
    </Box>
  );
};
