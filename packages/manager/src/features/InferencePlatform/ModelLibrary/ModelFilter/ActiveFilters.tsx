import { Button } from '@akamai/cds-components/react/Button';
import { Close } from '@akamai/cds-icons/react';
import { Box, Divider, Stack } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import FilterOutline from 'src/assets/icons/filter.svg';

import { providerIcon, providerIconStyles } from '../../utils';
import { ActiveFilterChip } from './ActiveFilterChip';
import { CTX_MAX, CTX_MIN, formatContextLabel } from './MaxContextFilter';
import { formatParamLabel, PARAM_MAX, PARAM_MIN } from './ParametersFilter';

import type { ModelFilterState } from '../modelLibrary.types';

interface ActiveFiltersProps {
  dividerXPadding?: number;
  inputModes: string[];
  isServerless: boolean;
  languages: string[];
  maxContextLengthK: null | number;
  maxParametersB: null | number;
  minContextLengthK: number;
  minParametersB: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  outputModes: string[];
  providerLabel: null | string;
  searchQuery: string;
  useCaseTags: string[];
}

export const ActiveFilters = ({
  dividerXPadding = 1.5,
  inputModes,
  isServerless,
  languages,
  maxContextLengthK,
  maxParametersB,
  minContextLengthK,
  minParametersB,
  onFilterChange,
  outputModes,
  providerLabel,
  searchQuery,
  useCaseTags,
}: ActiveFiltersProps) => {
  const cmTheme = useTheme();

  const hasActiveFilters =
    isServerless ||
    !!providerLabel ||
    languages.length > 0 ||
    useCaseTags.length > 0 ||
    inputModes.length > 0 ||
    outputModes.length > 0 ||
    minParametersB !== PARAM_MIN ||
    maxParametersB !== null ||
    minContextLengthK !== CTX_MIN ||
    maxContextLengthK !== null ||
    !!searchQuery;

  const [isFlashing, setIsFlashing] = React.useState(false);
  const prevHasActiveFilters = React.useRef(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!prevHasActiveFilters.current && hasActiveFilters) {
      setIsFlashing(true);
      timer = setTimeout(() => setIsFlashing(false), 700);
    }
    prevHasActiveFilters.current = hasActiveFilters;
    return () => clearTimeout(timer);
  }, [hasActiveFilters]);

  const activeProviderIconEl = providerLabel
    ? (() => {
        const Icon = providerIcon(providerLabel);
        return Icon ? (
          <Box
            component={Icon}
            height={16}
            style={providerIconStyles(providerLabel, cmTheme)}
            width={16}
          />
        ) : undefined;
      })()
    : undefined;

  return (
    <Box>
      <Divider
        sx={{ mx: dividerXPadding, paddingTop: 0.3, paddingBottom: 1 }}
      />

      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={1}
        sx={{ mt: 2 }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexShrink: 0,
            gap: 1.5,
          }}
        >
          <Box
            component={FilterOutline}
            height={26}
            sx={(theme) => ({
              animation: isFlashing ? 'filterIconFlash 0.7s ease-out' : 'none',
              color: theme.palette.text.secondary,
              flexShrink: 0,
              opacity: hasActiveFilters ? 1 : 0.4,
              transition: 'opacity 0.2s ease',
              '@keyframes filterIconFlash': {
                '0%': { color: theme.palette.text.secondary },
                '50%': { color: theme.palette.common.white },
                '100%': { color: theme.palette.text.secondary },
              },
            })}
            width={16}
          />
          {hasActiveFilters && (
            <Button
              aria-label="Clear all filters"
              onClick={() =>
                onFilterChange({
                  inputModes: [],
                  isServerless: false,
                  languages: [],
                  maxContextLengthK: null,
                  maxParametersB: null,
                  minContextLengthK: CTX_MIN,
                  minParametersB: PARAM_MIN,
                  outputModes: [],
                  providerLabel: null,
                  searchQuery: '',
                  useCaseTags: [],
                })
              }
              size="small"
              variant="icon"
            >
              <Close height={14} width={14} />
            </Button>
          )}
        </Box>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
        {searchQuery && (
          <ActiveFilterChip
            label={`Search: ${searchQuery}`}
            onDelete={() => onFilterChange({ searchQuery: '' })}
            type="search"
          />
        )}

        {minParametersB !== PARAM_MIN || maxParametersB !== null ? (
          <ActiveFilterChip
            label={`Parameters: ${formatParamLabel(
              minParametersB,
              maxParametersB ?? PARAM_MAX
            )}`}
            onDelete={() =>
              onFilterChange({
                maxParametersB: null,
                minParametersB: PARAM_MIN,
              })
            }
            type="parameters"
          />
        ) : null}

        {minContextLengthK !== CTX_MIN || maxContextLengthK !== null ? (
          <ActiveFilterChip
            label={`Max Context: ${formatContextLabel(
              minContextLengthK,
              maxContextLengthK ?? CTX_MAX
            )}`}
            onDelete={() =>
              onFilterChange({
                maxContextLengthK: null,
                minContextLengthK: CTX_MIN,
              })
            }
            type="maxContext"
          />
        ) : null}

        {isServerless && (
          <ActiveFilterChip
            label="is: Serverless"
            onDelete={() => onFilterChange({ isServerless: false })}
            type="serverless"
          />
        )}

        {providerLabel && (
          <ActiveFilterChip
            icon={activeProviderIconEl}
            label={`Provider: ${providerLabel}`}
            onDelete={() => onFilterChange({ providerLabel: null })}
            type="provider"
          />
        )}

        {languages.map((lang) => (
          <ActiveFilterChip
            key={lang}
            label={`Language: ${lang}`}
            onDelete={() =>
              onFilterChange({ languages: languages.filter((l) => l !== lang) })
            }
            type="language"
          />
        ))}

        {inputModes.map((mode) => (
          <ActiveFilterChip
            key={mode}
            label={mode}
            onDelete={() =>
              onFilterChange({
                inputModes: inputModes.filter((m) => m !== mode),
              })
            }
            type="inputModes"
          />
        ))}

        {outputModes.map((mode) => (
          <ActiveFilterChip
            key={mode}
            label={mode}
            onDelete={() =>
              onFilterChange({
                outputModes: outputModes.filter((m) => m !== mode),
              })
            }
            type="outputModes"
          />
        ))}

        {useCaseTags.map((tag) => (
          <ActiveFilterChip
            key={tag}
            label={tag}
            onDelete={() =>
              onFilterChange({
                useCaseTags: useCaseTags.filter((t) => t !== tag),
              })
            }
            type="useCaseTags"
          />
        ))}
      </Stack>
    </Box>
  );
};
