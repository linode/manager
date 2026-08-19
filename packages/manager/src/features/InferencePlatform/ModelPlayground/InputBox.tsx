import { ArrowUp, Square } from '@akamai/cds-icons/react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
} from '@linode/ui';
import React, { useContext, useEffect, useRef } from 'react';

import { useInferencePlatform } from '../InferencePlatformContext';
import {
  ModelPlaygroundInputContext,
  ModelPlaygroundModelContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';

export const InputBox = () => {
  const { inputValue, isLoading, onCancel, onInputChange, onSend } = useContext(
    ModelPlaygroundInputContext
  );
  const { selectedModel } = useContext(ModelPlaygroundModelContext);
  const { messages } = useContext(ModelPlaygroundOutputContext);
  const { isModelsLoading } = useInferencePlatform();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled = isLoading || isModelsLoading || !selectedModel;
  const hasInput = Boolean(inputValue.trim());
  const canSend = hasInput && !isDisabled;

  useEffect(() => {
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isModelsLoading && selectedModel) {
      inputRef.current?.focus();
    }
  }, [isModelsLoading, selectedModel]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        disabled={isDisabled}
        fullWidth
        hideLabel
        inputRef={inputRef}
        label="Prompt"
        minRows={1}
        multiline
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a prompt..."
        slotProps={{
          htmlInput: {
            style: { minHeight: 'unset' },
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <IconButton
                    onClick={onCancel}
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.text.secondary}`,
                      borderRadius: '4px',
                      color: theme.palette.text.secondary,
                      height: 32,
                      mb: 0.6,
                      width: 32,
                      '&:hover': { color: theme.palette.text.primary },
                    }}
                  >
                    <Square style={{ height: 12, width: 12 }} />
                  </IconButton>
                ) : (
                  <IconButton
                    disabled={!canSend}
                    onClick={onSend}
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      borderRadius: '4px',
                      color: 'primary.contrastText',
                      height: 32,
                      mb: 0.6,
                      width: 32,
                      '&.Mui-disabled': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        opacity: 0.45,
                      },
                      '&:hover': {
                        bgcolor: canSend ? 'primary.dark' : undefined,
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <ArrowUp style={{ height: 24, width: 24 }} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: (theme) => ({
              alignItems: 'flex-end',
              border: `1px solid ${theme.borderColors.divider}`,
              borderRadius: '4px',
              height: 'auto',
              maxWidth: 'unset',
              px: 1.5,
              py: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }),
          },
        }}
        value={inputValue}
      />
    </Box>
  );
};
