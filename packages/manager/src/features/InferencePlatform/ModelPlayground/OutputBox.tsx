import { Box, Stack, useTheme } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import { keyframes } from '@mui/material/styles';
import React, { useContext, useEffect, useRef, useState } from 'react';

import AI from 'src/assets/icons/entityIcons/ai.svg';
import CoreUser from 'src/assets/icons/entityIcons/coreuser.svg';
import { Markdown } from 'src/components/Markdown/Markdown';

import { ModelPlaygroundContext } from './ModelPlaygroundContext';

const breathe = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
`;

const DOT_SX = {
  animation: `${breathe} 1.2s ease-in-out infinite`,
  bgcolor: 'text.primary',
  borderRadius: '50%',
  height: 8,
  width: 8,
} as const;

const ICON_BOX_SX = {
  alignItems: 'center',
  bgcolor: 'action.selected',
  borderRadius: 1,
  display: 'flex',
  flexShrink: 0,
  height: 40,
  justifyContent: 'center',
  width: 40,
} as const;

const MARKDOWN_SX = {
  '& p': { lineHeight: 1.8 },
  '& p:first-of-type': { mt: 0 },
  '& p:last-of-type': { mb: 0 },
} as const;

const ReasoningBlock = ({ thinking }: { thinking: string }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

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
              bgcolor: 'success.main',
              borderRadius: '50%',
              flexShrink: 0,
              height: 10,
              width: 10,
            }}
          />
          <Box
            component="span"
            sx={{
              fontFamily: theme.font.bold,
              fontSize: '0.875rem',
            }}
          >
            Reasoning
          </Box>
          {/* <Check sx={{ color: 'success.main', fontSize: '1rem' }} /> */}
        </Stack>
        <KeyboardArrowDown
          sx={{
            color: 'text.secondary',
            fontSize: '1.25rem',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </Stack>
      <Collapse in={open}>
        <Box
          sx={{
            border: `1px solid ${theme.borderColors.divider}`,
            borderRadius: '0 0 8px 8px',
            borderTop: 'none',
            color: 'text.secondary',
            fontSize: '0.875rem',
            px: 1.5,
            py: 1,
          }}
        >
          <Markdown textOrMarkdown={thinking} />
        </Box>
      </Collapse>
    </Box>
  );
};

export const OutputBox = () => {
  const { isLoading, messages } = useContext(ModelPlaygroundContext);
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        bgcolor: theme.bg.offWhite,
        flex: 1,
        overflowY: 'auto',
        p: 2,
      }}
    >
      {messages.map((message) =>
        message.role === 'user' ? (
          <Stack
            alignItems="flex-start"
            direction="row"
            gap={1.5}
            key={message.id}
            sx={{ mb: 4 }}
          >
            <Box sx={ICON_BOX_SX}>
              <CoreUser />
            </Box>
            <Box
              sx={{
                border: `1px solid ${theme.borderColors.divider}`,
                borderRadius: 2,
                maxWidth: '80%',
                px: 1.5,
                py: 0.75,
              }}
            >
              <Box sx={MARKDOWN_SX}>
                <Markdown textOrMarkdown={message.content} />
              </Box>
            </Box>
          </Stack>
        ) : (
          <Stack
            alignItems="flex-start"
            direction="row"
            gap={1.5}
            key={message.id}
            sx={{ mb: 4 }}
          >
            <Box sx={{ ...ICON_BOX_SX, '& svg': { height: 24, width: 24 } }}>
              <AI />
            </Box>
            <Box sx={{ ...MARKDOWN_SX, flex: 1, minWidth: 0 }}>
              {message.thinking && (
                <ReasoningBlock thinking={message.thinking} />
              )}
              <Markdown textOrMarkdown={message.content} />
            </Box>
          </Stack>
        )
      )}
      <div ref={messagesEndRef} />
      {isLoading && (
        <Stack alignItems="flex-start" direction="row" gap={1.5} sx={{ mb: 4 }}>
          <Box sx={{ ...ICON_BOX_SX, '& svg': { height: 24, width: 24 } }}>
            <AI />
          </Box>
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
        </Stack>
      )}
    </Box>
  );
};
