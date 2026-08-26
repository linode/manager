import { Button, TextArea } from '@akamai/cds-components/react';
import { ArrowUp, Square } from '@akamai/cds-icons/react';
import { TextArea as TextAreaTokens } from '@akamai/cds-tokens';
import { TextArea as TextAreaTokensDark } from '@akamai/cds-tokens/themes/dark';
import { useTheme } from '@linode/ui';
import React, { useContext, useEffect, useRef } from 'react';

import { Box } from '../components';
import { useInferencePlatform } from '../InferencePlatformContext';
import styles from './InputBox.module.css';
import {
  ModelPlaygroundInputContext,
  ModelPlaygroundModelContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';

const MAX_TEXTAREA_HEIGHT_PX = 240;

const resizeTextarea = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > MAX_TEXTAREA_HEIGHT_PX ? 'auto' : 'hidden';
};

export const InputBox = () => {
  const { inputValue, isLoading, onCancel, onInputChange, onSend } = useContext(
    ModelPlaygroundInputContext
  );
  const { selectedModel } = useContext(ModelPlaygroundModelContext);
  const { messages } = useContext(ModelPlaygroundOutputContext);
  const { isModelsLoading } = useInferencePlatform();
  const theme = useTheme();
  const inputRef = useRef<React.ComponentRef<typeof TextArea>>(null);

  const isDisabled = isLoading || isModelsLoading || !selectedModel;
  const hasInput = Boolean(inputValue.trim());
  const canSend = hasInput && !isDisabled;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.updateComplete.then(() => {
      const root = el.shadowRoot;
      if (!root) return;

      const handle = root.querySelector<HTMLElement>('.cds-text-area--resize');
      if (handle) handle.style.display = 'none';

      const clearBtn = root.querySelector<HTMLElement>('.cds-text-area--clear');
      if (clearBtn) clearBtn.style.display = 'none';

      const textarea = root.querySelector<HTMLTextAreaElement>('textarea');
      if (textarea) {
        textarea.style.resize = 'none';
        textarea.style.maxHeight = `${MAX_TEXTAREA_HEIGHT_PX}px`;
        textarea.style.overflowX = 'hidden';
        textarea.style.paddingRight = '12px';
        resizeTextarea(textarea);
      }
    });
  }, []);

  // Auto-grow: after Lit renders the new value, measure scrollHeight and apply it
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.updateComplete.then(() => {
      const textarea =
        el.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea');
      if (!textarea) return;

      resizeTextarea(textarea);
    });
  }, [inputValue]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      onKeyDown={handleKeyDown}
      style={{
        alignItems: 'flex-end',
        border: `1px solid ${
          isDisabled
            ? theme.palette.mode === 'dark'
              ? TextAreaTokensDark.Disabled.Border
              : TextAreaTokens.Disabled.Border
            : theme.borderColors.divider
        }`,
        backgroundColor: isDisabled
          ? theme.palette.mode === 'dark'
            ? TextAreaTokensDark.Disabled.Background
            : TextAreaTokens.Disabled.Background
          : theme.bg.white,
        borderRadius: '4px',
        cursor: isDisabled ? 'not-allowed' : undefined,
        display: 'flex',
        gap: '8px',
        padding: '5px 0px',
        width: '100%',
      }}
    >
      <TextArea
        aria-label="Prompt"
        className={styles.textarea}
        disabled={isDisabled}
        onChange={(e: Event) =>
          onInputChange((e.target as HTMLElement & { value: string }).value)
        }
        placeholder="Write a prompt..."
        ref={inputRef}
        rows={1}
        value={inputValue}
      />
      {isLoading ? (
        <Button
          aria-label="Cancel generation"
          className={styles.cancelButton}
          onClick={onCancel}
          size="small"
          variant="secondary"
        >
          <Square style={{ height: 12, width: 12 }} />
        </Button>
      ) : (
        <Button
          aria-label="Send prompt"
          className={styles.button}
          disabled={!canSend}
          onClick={onSend}
          size="small"
          variant="primary"
        >
          <ArrowUp style={{ height: 12, width: 12 }} />
        </Button>
      )}
    </Box>
  );
};
