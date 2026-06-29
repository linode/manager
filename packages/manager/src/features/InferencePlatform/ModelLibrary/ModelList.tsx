import { Box, IconButton, Select, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

import CardView from 'src/assets/icons/ai/cardview.svg';
import GridViewIcon from 'src/assets/icons/grid-view.svg';
import { storage } from 'src/utilities/storage';

import { ModelCard, ModelCardSkeleton } from './ModelCard/ModelCard';
import { ModelRow } from './ModelCard/ModelRow';
import { applyModelSort } from './modelLibraryUtils';

import type { Model, SortKey } from './modelLibrary.types';

type ViewMode = 'grid' | 'list';

interface ModelListProps {
  height?: number;
  isLoading: boolean;
  models: Model[];
}

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Biggest Context', value: 'contextLength_desc' },
  { label: 'Smallest Context', value: 'contextLength_asc' },
  { label: 'Most Parameters', value: 'parameters_desc' },
  { label: 'Least Parameters', value: 'parameters_asc' },
  { label: 'Release Date', value: 'releaseDate_desc' },
  { label: 'Update Date', value: 'updateDate_desc' },
];

const DEFAULT_SORT: SortKey = 'parameters_desc';

export const ModelList = ({ height, isLoading, models }: ModelListProps) => {
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewMode>(
    storage.aiModelsListViewType.get()
  );
  const [selectedColor, setModeSelectedColor] =
    useState<string>('hsl(210,100%,40%)');
  const [deselectedColor, setModeDeselectedColor] =
    useState<string>('hsl(210,100%,80%)');

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    storage.aiModelsListViewType.set(mode);
  };

  const sortedModels = applyModelSort(models, sortKey);

  const selectedSortOption =
    SORT_OPTIONS.find((o) => o.value === sortKey) ?? SORT_OPTIONS[2];

  const isEmpty = !isLoading && models.length === 0;
  const hasFixedHeight = typeof height === 'number';

  const cmTheme = useTheme();

  useEffect(() => {
    if (cmTheme.palette.mode === 'light') {
      setModeSelectedColor('hsl(210,30%,80%)');
      setModeDeselectedColor('hsl(210,60%,50%)');
    } else {
      setModeSelectedColor('hsl(210,10%,35%)');
      setModeDeselectedColor('hsl(210,70%,52%)');
    }
  }, [cmTheme]);

  return (
    <Box
      sx={
        hasFixedHeight
          ? {
              display: 'flex',
              flexDirection: 'column',
              height,
              minHeight: 0,
            }
          : undefined
      }
    >
      {/* SortBy bar — always visible */}
      <Stack
        alignItems="flex-end"
        direction="row"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack alignItems="center" direction="row" gap={0}>
          <IconButton
            aria-label="Grid view"
            onClick={() => handleViewModeChange('grid')}
            sx={{
              borderRadius: 1,
              color: viewMode === 'grid' ? deselectedColor : selectedColor,
              padding: 0.75,
            }}
          >
            <Box component={CardView} sx={{ height: 20, width: 20 }} />
          </IconButton>

          <IconButton
            aria-label="List view"
            onClick={() => handleViewModeChange('list')}
            sx={{
              borderRadius: 1,
              color: viewMode !== 'grid' ? deselectedColor : selectedColor,
              padding: 0.75,
            }}
          >
            <Box component={GridViewIcon} sx={{ height: 20, width: 20 }} />
          </IconButton>
        </Stack>

        <Box sx={{ minWidth: 200 }}>
          <Select
            label="Sort by"
            onChange={(_, option) => {
              if (option) setSortKey(option.value as SortKey);
            }}
            options={SORT_OPTIONS}
            value={selectedSortOption}
          />
        </Box>
      </Stack>

      <Box
        sx={
          hasFixedHeight
            ? {
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pb: 1,
              }
            : undefined
        }
      >
        {/* Empty state */}
        {isEmpty && (
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body1">
              No models match your filters.
            </Typography>
          </Box>
        )}

        {/* Grid / List */}
        {!isEmpty && (
          <Box
            sx={(theme) => ({
              display: 'grid',
              gap: 2,
              gridTemplateColumns:
                viewMode === 'list' ? '1fr' : 'repeat(2, 1fr)',
              [theme.breakpoints.down('sm')]: {
                gridTemplateColumns: '1fr',
              },
            })}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ModelCardSkeleton key={i} />
                ))
              : sortedModels.map((model) =>
                  viewMode === 'grid' ? (
                    <ModelCard key={model.id} model={model} />
                  ) : (
                    <ModelRow key={model.id} model={model} />
                  )
                )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
