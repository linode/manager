import { Box, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';

import type { SupportedLanguage } from 'src/utilities/syntax-highlighter';

export interface CodeSnippetBrowserProps {
  defaultLanguage?: string;
  languages: string[];
  snippets: Record<string, string>;
  syntaxHighlightingLanguageMap: Record<string, SupportedLanguage>;
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
  textAreaHeight?: number;
}

interface ViewSizeToggleButtonProps {
  label: string;
  onClick: () => void;
}

const ViewSizeToggleButton = ({
  label,
  onClick,
}: ViewSizeToggleButtonProps) => {
  const cmTheme = useTheme();
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${cmTheme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[700]}`,
        borderRadius: 1.5,
        color: theme.palette.text.primary,
        cursor: 'pointer',
        font: theme.font.semibold,
        fontSize: theme.tokens.font.FontSize.Xxs,
        minWidth: 100,
        padding: '4px 1px 1px 1px',
        '&:hover': {
          borderColor:
            cmTheme.palette.mode === 'light'
              ? theme.palette.grey[600]
              : theme.palette.grey[500],
        },
        '&:active': {
          borderColor:
            cmTheme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[600],
        },
      })}
    >
      {label}
    </Box>
  );
};

const getTabBorderRadius = (index: number, maxIndex: number) => {
  if (index === 0 && maxIndex === 0) {
    return '4px';
  }
  if (index === 0) {
    return '4px 0 0 4px';
  }
  if (index === maxIndex) {
    return '0 4px 4px 0';
  }
  return 0;
};

interface LanguageTabProps {
  index: number;
  isActive: boolean;
  label: string;
  maxIndex: number;
  onSelect: () => void;
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
}

const LanguageTab = ({
  index,
  isActive,
  label,
  maxIndex,
  onSelect,
  tabRightBorderWidthByIndex,
}: LanguageTabProps) => (
  <Box
    onClick={onSelect}
    sx={(theme) => ({
      backgroundColor: isActive
        ? theme.palette.primary.main
        : theme.palette.background.paper,
      border: `2px solid ${theme.palette.primary.main}`,
      borderRightWidth: `${getTabRightBorderWidth(index, tabRightBorderWidthByIndex)}px`,
      borderRadius: getTabBorderRadius(index, maxIndex),
      color: isActive
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
      cursor: 'pointer',
      px: 1.5,
      py: 0.5,
      textTransform: 'capitalize',
    })}
  >
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const getTabRightBorderWidth = (
  index: number,
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>
) => {
  if (!tabRightBorderWidthByIndex) {
    return index === 0 ? 0 : 1;
  }
  return tabRightBorderWidthByIndex[index] ?? 1;
};

export const CodeSnippetBrowser = ({
  languages,
  snippets,
  syntaxHighlightingLanguageMap,
  defaultLanguage,
  tabRightBorderWidthByIndex,
  textAreaHeight = 158,
}: CodeSnippetBrowserProps) => {
  const firstLanguage = languages[0];
  const [language, setLanguage] = React.useState<string>(
    defaultLanguage || firstLanguage || ''
  );
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shortSnippets, setShortSnippets] = React.useState<
    Record<string, boolean>
  >({});
  const contentBoxRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!contentBoxRef.current) {
      return;
    }

    const fits = contentBoxRef.current.scrollHeight <= textAreaHeight;
    setShortSnippets((previous) => {
      if (previous[language] === fits) {
        return previous;
      }

      return { ...previous, [language]: fits };
    });
  }, [language, textAreaHeight]);

  const alwaysExpanded = shortSnippets[language] ?? false;
  const effectivelyExpanded = isExpanded || alwaysExpanded;

  return (
    <Paper sx={{ borderRadius: 1 }}>
      <Stack direction="row" gap={0} sx={{ mt: 1 }}>
        {languages.map((tab, index) => (
          <LanguageTab
            index={index}
            isActive={tab === language}
            key={tab}
            label={tab}
            maxIndex={languages.length - 1}
            onSelect={() => setLanguage(tab)}
            tabRightBorderWidthByIndex={tabRightBorderWidthByIndex}
          />
        ))}
      </Stack>

      <Paper
        sx={() => ({
          border: 'none',
          overflowX: 'auto',
          p: 0,
        })}
      >
        <Box
          ref={contentBoxRef}
          sx={{
            height: effectivelyExpanded ? 'auto' : textAreaHeight,
            overflowY: effectivelyExpanded ? 'visible' : 'hidden',
            position: 'relative',
          }}
        >
          <CodeBlock
            code={snippets[language]}
            language={syntaxHighlightingLanguageMap[language]}
            showLineNumbers={false}
          />

          {!effectivelyExpanded && (
            <Box
              sx={(theme) => ({
                alignItems: 'flex-end',
                background: `linear-gradient(to bottom, transparent 0%, ${theme.palette.background.paper} 100%)`,
                bottom: 0,
                display: 'flex',
                height: textAreaHeight / 2,
                justifyContent: 'center',
                left: 0,
                pb: 1,
                position: 'absolute',
                right: 0,
              })}
            >
              <ViewSizeToggleButton
                label="VIEW MORE"
                onClick={() => setIsExpanded(true)}
              />
            </Box>
          )}
        </Box>

        {isExpanded && !alwaysExpanded && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <ViewSizeToggleButton
              label="VIEW LESS"
              onClick={() => setIsExpanded(false)}
            />
          </Box>
        )}
      </Paper>
    </Paper>
  );
};
