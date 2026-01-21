import {
  useAllMarketplaceCategoriesQuery,
  useAllMarketplacePartnersQuery,
  useAllMarketplaceTypesQuery,
} from '@linode/queries';
import {
  Autocomplete,
  BetaChip,
  Box,
  CircleProgress,
  ErrorState,
  LinkButton,
  Stack,
  Typography,
} from '@linode/ui';
import { Grid } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { Waypoint } from 'react-waypoint';

import EmptyStateCloud from 'src/assets/icons/empty-state-cloud.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { LandingHeader } from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useIsMarketplaceV2Enabled } from '../utils';
import { CategorySection } from './CategorySection';

const CATEGORIES_PER_BATCH = 5;

export const MarketplaceLanding = () => {
  const { isMarketplaceV2FeatureEnabled } = useIsMarketplaceV2Enabled();
  const navigate = useNavigate();
  const search = useSearch({ from: '/cloud-marketplace/catalog' });
  const {
    categoryId: selectedCategoryId,
    query: searchQuery,
    typeId: selectedTypeId,
  } = search;

  const [emptyCategoryCount, setEmptyCategoryCount] = React.useState(0);
  const [loadedCategoryCount, setLoadedCategoryCount] = React.useState(0);
  const [displayedCategoryCount, setDisplayedCategoryCount] =
    React.useState(CATEGORIES_PER_BATCH);

  const {
    data: categories,
    error,
    isLoading,
  } = useAllMarketplaceCategoriesQuery({}, {}, isMarketplaceV2FeatureEnabled);

  const { data: types } = useAllMarketplaceTypesQuery(
    {},
    {},
    isMarketplaceV2FeatureEnabled
  );

  const { data: partners } = useAllMarketplacePartnersQuery(
    {},
    {},
    isMarketplaceV2FeatureEnabled
  );

  const categoriesWithProducts = React.useMemo(
    () =>
      categories
        ?.filter((category) => category.products_count > 0)
        .sort((a, b) => b.products_count - a.products_count) ?? [],
    [categories]
  );

  const categoryOptions = React.useMemo(
    () =>
      categoriesWithProducts.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoriesWithProducts]
  );

  const typeOptions = React.useMemo(
    () =>
      types
        ?.filter((type) => type.products_count > 0)
        .map((type) => ({
          label: type.name,
          value: type.id,
        })) ?? [],
    [types]
  );

  // Extract IDs from search query if it matches type, or partner names
  const searchDerivedFilters = React.useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return { typeIds: [], partnerIds: [] };
    }

    const lowerQuery = searchQuery.toLowerCase();

    // If typeId is selected from the dropdown, do NOT derive type IDs from the search query.
    // This prevents unnecessary AND conditions in API filtering.
    const matchedTypeIds = selectedTypeId
      ? []
      : (types
          ?.filter((type) => type.name.toLowerCase().includes(lowerQuery))
          .map((type) => type.id) ?? []);

    const matchedPartnerIds =
      partners
        ?.filter((partner) => partner.name.toLowerCase().includes(lowerQuery))
        .map((partner) => partner.id) ?? [];

    return {
      typeIds: matchedTypeIds,
      partnerIds: matchedPartnerIds,
    };
  }, [searchQuery, types, partners, selectedTypeId]);

  const globalFilters = {
    searchQuery,
    categoryId: selectedCategoryId,
    typeId: selectedTypeId,
    searchDerivedTypeIds: searchDerivedFilters.typeIds, // Only populated if no type is selected
    searchDerivedPartnerIds: searchDerivedFilters.partnerIds,
  };

  // Filter categories based on:
  // 1. Selected category from dropdown (if set)
  // 2. All categories (if no filters)
  const filteredCategories = React.useMemo(() => {
    if (selectedCategoryId) {
      // Dropdown selection takes precedence
      return categoriesWithProducts.filter(
        (category) => category.id === selectedCategoryId
      );
    }

    // No filters - show all categories
    return categoriesWithProducts;
  }, [selectedCategoryId, categoriesWithProducts]);

  const handleResetFilters = () => {
    navigate({
      search: {},
      to: '/cloud-marketplace/catalog',
    });
  };

  const updateSearchParam = React.useCallback(
    (key: keyof typeof search, value: number | string | undefined) => {
      navigate({
        search: (prev) => ({
          ...prev,
          [key]: value,
        }),
        to: '/cloud-marketplace/catalog',
      });
    },
    [navigate]
  );

  const onSearch = (searchString: string) => {
    // Pass undefined to remove query param if string is empty
    updateSearchParam('query', searchString || undefined);
  };

  const hasFiltersApplied = Boolean(searchQuery || selectedTypeId);

  const handleCategoryLoaded = React.useCallback((isEmpty: boolean) => {
    setLoadedCategoryCount((prev) => prev + 1);
    if (isEmpty) {
      setEmptyCategoryCount((prev) => prev + 1);
    }
  }, []);

  const handleFetchMore = () => {
    setDisplayedCategoryCount((prev) => prev + CATEGORIES_PER_BATCH);
  };

  const displayedCategoriesToRender = filteredCategories.slice(
    0,
    displayedCategoryCount
  );

  const categoriesToFetch = displayedCategoriesToRender;

  const totalCategories = filteredCategories.length;

  const hasMoreCategories =
    displayedCategoriesToRender.length < totalCategories;

  // Reset counters when filters change
  React.useEffect(() => {
    setEmptyCategoryCount(0);
    setLoadedCategoryCount(0);
    setDisplayedCategoryCount(CATEGORIES_PER_BATCH);
  }, [searchQuery, selectedCategoryId, selectedTypeId]);

  // Auto-fetch next batch if current batch has no results when filters are applied.
  // This avoids relying on waypoint scrolling to find results:
  // - Keeps fetching batches until we find results or run out of categories
  // - Once results appear, switches to normal waypoint (scroll) lazy loading
  // - Shows empty state only after checking all categories
  React.useEffect(() => {
    const allCurrentBatchCategoriesEmpty =
      hasFiltersApplied &&
      loadedCategoryCount > 0 &&
      loadedCategoryCount === emptyCategoryCount &&
      loadedCategoryCount === displayedCategoryCount;

    const hasMoreToFetch = displayedCategoryCount < totalCategories;

    if (allCurrentBatchCategoriesEmpty && hasMoreToFetch) {
      setDisplayedCategoryCount((prev) => prev + CATEGORIES_PER_BATCH);
    }
  }, [
    hasFiltersApplied,
    loadedCategoryCount,
    emptyCategoryCount,
    displayedCategoryCount,
    totalCategories,
  ]);

  // Show empty state when:
  // 1. No filters: totalCategories === 0 (no categories exist with products)
  // 2. With filters: all categories loaded and all are empty
  const allCategoriesLoaded = loadedCategoryCount === totalCategories;
  const showEmptyState =
    !isLoading &&
    (totalCategories === 0 ||
      (hasFiltersApplied &&
        allCategoriesLoaded &&
        loadedCategoryCount === emptyCategoryCount));

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading Marketplace.')[0].reason
        }
      />
    );
  }

  return (
    <Box
      sx={(theme) => ({
        px: {
          sm: theme.spacingFunction(16),
          xs: theme.spacingFunction(12),
        },
        // Adjust Breadcrumb's marginLeft on screens < md to keep it aligned with the Products
        '& [data-qa-entity-header]': {
          [theme.breakpoints.down('md')]: {
            marginLeft: `-${theme.spacingFunction(8)}`,
          },
        },
      })}
    >
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: (
                <>
                  Partner Referrals
                  <BetaChip component="span" />
                </>
              ),
              position: 1,
            },
            {
              label: 'Catalog',
              position: 2,
            },
          ],
          pathname: '/cloud-marketplace/catalog',
        }}
      />
      <Grid container mb={3} spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 7 }}>
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            fullWidth
            hideLabel
            inputSlotProps={{ sx: { maxWidth: 'unset !important' } }}
            label="Search marketplace"
            noMarginTop
            onSearch={onSearch}
            placeholder="Search apps, products, and partners"
            value={searchQuery ?? ''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            label="Category"
            onChange={(_, selected) =>
              updateSearchParam('categoryId', selected?.value)
            }
            options={categoryOptions}
            placeholder="Category"
            textFieldProps={{
              hideLabel: true,
            }}
            value={
              categoryOptions.find((o) => o.value === selectedCategoryId) ??
              null
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            label="Type"
            onChange={(_, selected) =>
              updateSearchParam('typeId', selected?.value)
            }
            options={typeOptions}
            placeholder="Type"
            textFieldProps={{
              hideLabel: true,
            }}
            value={typeOptions.find((o) => o.value === selectedTypeId) ?? null}
          />
        </Grid>
      </Grid>
      <Stack spacing={4}>
        {categoriesToFetch.map((category) => (
          <CategorySection
            category={category}
            filters={globalFilters}
            key={category.id}
            onLoaded={handleCategoryLoaded}
          />
        ))}
        {hasMoreCategories && <Waypoint onEnter={handleFetchMore} />}
        {showEmptyState && (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 400px)',
            }}
          >
            <ErrorState
              compact
              CustomIcon={EmptyStateCloud}
              errorText={
                <Box>
                  <Typography variant="h2">No results found</Typography>
                  <Typography>
                    Looks like there&apos;s nothing here.
                    {hasFiltersApplied && (
                      <> Try a new search and let&apos;s see what we find!</>
                    )}
                  </Typography>
                  {hasFiltersApplied && (
                    <LinkButton onClick={handleResetFilters} sx={{ mt: 2 }}>
                      Reset filters
                    </LinkButton>
                  )}
                </Box>
              }
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};
