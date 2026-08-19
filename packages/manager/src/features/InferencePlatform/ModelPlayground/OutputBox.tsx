import { Checkmark, ChevronDown } from '@akamai/cds-icons/react';
import { Box, keyframes, Stack, useTheme } from '@linode/ui';
import Collapse from '@mui/material/Collapse';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import AI from 'src/assets/icons/entityIcons/ai.svg';
import CoreUser from 'src/assets/icons/entityIcons/coreuser.svg';
import { Markdown } from 'src/components/Markdown/Markdown';

import { pulse } from './animations';
import { ClearOutputButton } from './ClearOutputButton';
import { MetadataBar } from './MetadataBar';
import { ModelPlaygroundOutputContext } from './ModelPlaygroundContext';
import { PlaygroundEmptyState } from './PlaygroundEmptyState';

import type { Message } from './ModelPlaygroundContext';

const ICON_AND_SECONDARY_COLOR = 'text.secondary' as const;

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

const DOT_SX = {
  animation: `${breathe} 1.2s ease-in-out infinite`,
  bgcolor: 'text.secondary',
  borderRadius: '50%',
  height: 8,
  width: 8,
} as const;

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

// Prevents markdown-it from treating 4-space-indented lines in model reasoning as code blocks.
const LEADING_INDENT_RE = /^ {4}/gm;

const ReasoningBlock = memo(
  ({
    isStreaming,
    onExpand,
    thinking,
    wasInterrupted,
  }: {
    isStreaming: boolean;
    onExpand?: () => void;
    thinking: string;
    wasInterrupted: boolean;
  }) => {
    // If thinking response is interrupted, reasoning block should render open with no animation
    const [open, setOpen] = useState(() => wasInterrupted);
    const [constrainHeight, setConstrainHeight] = useState(false);
    const theme = useTheme();
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevConstrainHeightRef = useRef(false);

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

    // After the height constraint is removed on cancellation, notify the parent
    // so it can scroll the outer container to the bottom.
    useEffect(() => {
      if (
        prevConstrainHeightRef.current &&
        !constrainHeight &&
        wasInterrupted
      ) {
        onExpand?.();
      }
      prevConstrainHeightRef.current = constrainHeight;
    }, [constrainHeight, wasInterrupted, onExpand]);

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
                  ? `${pulse} 1.2s ease-out infinite`
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
              <Checkmark
                height={20}
                style={{
                  color: theme.tokens.alias.Content.Icon.Recommendation,
                  marginLeft: 4,
                }}
                width={20}
              />
            )}
          </Stack>
          <ChevronDown
            height={20}
            style={{
              color: ICON_AND_SECONDARY_COLOR,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
            width={20}
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
              overflowX: 'hidden',
              overflowY: constrainHeight ? 'auto' : 'visible',
              px: 1.5,
              py: 1,
            }}
          >
            <Markdown
              textOrMarkdown={thinking.replace(LEADING_INDENT_RE, '')}
            />
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
  onReasoningExpand?: () => void;
}

const AssistantMessageRow = memo(
  ({ isStreaming, message, onReasoningExpand }: AssistantMessageRowProps) => {
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
              sx={{ mb: 3, pt: 2.0 }}
            >
              <Box sx={{ ...DOT_SX }} />
              <Box sx={{ ...DOT_SX, animationDelay: '0.2s' }} />
              <Box sx={{ ...DOT_SX, animationDelay: '0.4s' }} />
            </Stack>
          )}
          {message.thinking && (
            <ReasoningBlock
              isStreaming={isStreaming && message.content === ''}
              onExpand={onReasoningExpand}
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
          {message.startedAt !== undefined && (
            <Box
              sx={{
                mt: message.content || message.thinking ? 1.5 : 0,
              }}
            >
              <MetadataBar
                error={message.error}
                metadata={message.metadata}
                startedAt={message.startedAt}
                timeToFirstTokenMs={message.timeToFirstTokenMs}
              />
            </Box>
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
  const shouldAutoScrollRef = useRef(true);

  const handleReasoningExpand = useCallback(() => {
    if (shouldAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  const handleScroll = () => {
    const box = scrollBoxRef.current;

    if (!box) {
      return;
    }

    const distanceFromBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 80;
  };

  // Scroll to bottom synchronously before paint so the MetadataBar and new
  // content never appear displaced for even a single frame.
  useLayoutEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }
    const box = scrollBoxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages]);

  return (
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <Box
        onScroll={handleScroll}
        ref={scrollBoxRef}
        sx={{
          bgcolor:
            theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
          height: '100%',
          overflowY: 'auto',
          p: 2,
          position: 'relative',
        }}
      >
        <ClearOutputButton />
        <PlaygroundEmptyState />
        {messages.length > 0 && (
          <>
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserMessageRow key={message.id} message={message} />
              ) : (
                <AssistantMessageRow
                  isStreaming={message.id === streamingMessageId}
                  key={message.id}
                  message={message}
                  onReasoningExpand={handleReasoningExpand}
                />
              )
            )}
            <div ref={bottomRef} />
          </>
        )}
      </Box>
    </Box>
  );
};
