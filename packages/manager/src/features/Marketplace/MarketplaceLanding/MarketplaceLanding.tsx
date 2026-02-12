import {
  Autocomplete,
  BetaChip,
  Box,
  ErrorState,
  LinkButton,
  Stack,
  Typography,
} from '@linode/ui';
import { Grid } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import EmptyStateCloud from 'src/assets/icons/empty-state-cloud.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { PRODUCTS } from '../products';
import { CategorySection } from './CategorySection';
import { filterProducts } from './utils';

import type { Category, Product, Type } from '../shared';

export const MarketplaceLanding = () => {
  const navigate = useNavigate();
  const CATALOG_ROUTE = '/cloud-marketplace/catalog';
  const search = useSearch({ from: CATALOG_ROUTE });
  const {
    category: selectedCategory,
    query: searchQuery,
    type: selectedType,
  } = search;

  // categories that have at least one product
  const categoriesWithProducts = React.useMemo(() => {
    const uniqueCategories = new Set<Category>();
    PRODUCTS.forEach((product) => {
      product.categories.forEach((cat) => uniqueCategories.add(cat));
    });
    return Array.from(uniqueCategories);
  }, []);

  // types that have at least one product
  const typesWithProducts = React.useMemo(() => {
    const uniqueTypes = new Set<Type>();
    PRODUCTS.forEach((product) => uniqueTypes.add(product.type.name));
    return Array.from(uniqueTypes);
  }, []);

  // Category dropdown options (sorted alphabetically)
  const categoryOptions = React.useMemo(
    () =>
      [...categoriesWithProducts]
        .sort((a, b) => a.localeCompare(b))
        .map((cat) => ({ label: cat })),
    [categoriesWithProducts]
  );

  // Type dropdown options
  const typeOptions = React.useMemo(
    () => typesWithProducts.map((type) => ({ label: type })),
    [typesWithProducts]
  );

  const handleResetFilters = () => {
    navigate({
      search: {},
      to: CATALOG_ROUTE,
    });
  };

  const updateSearchParam = React.useCallback(
    (key: keyof typeof search, value: string | undefined) => {
      navigate({
        search: (prev) => ({
          ...prev,
          [key]: value,
        }),
        to: CATALOG_ROUTE,
      });
    },
    [navigate]
  );

  const onSearch = (searchString: string) => {
    // Pass undefined to remove query param if string is empty
    updateSearchParam('query', searchString || undefined);
  };

  // Filter products here based on search and type filters. If no filters are set, shows all available products.
  const filteredProducts = React.useMemo(
    () => filterProducts(PRODUCTS, { searchQuery, selectedType }),
    [searchQuery, selectedType]
  );

  // Group filtered products by category
  const filteredProductsByCategory = React.useMemo(() => {
    const map = {} as Record<Category, Product[]>;
    filteredProducts.forEach((product) => {
      product.categories.forEach((cat) => {
        if (!map[cat]) {
          map[cat] = [];
        }
        map[cat].push(product);
      });
    });
    return map;
  }, [filteredProducts]);

  // Filter categories based on:
  // 1. Selected category from dropdown (if set)
  // 2. All categories, sorted by product count (if no filters)
  const filteredCategories = React.useMemo(() => {
    if (selectedCategory) {
      return categoriesWithProducts.filter((cat) => cat === selectedCategory);
    }
    // No filters - show all categories, sorted by product count (highest to lowest)
    return [...categoriesWithProducts].sort((a, b) => {
      const countA = filteredProductsByCategory[a]?.length || 0;
      const countB = filteredProductsByCategory[b]?.length || 0;
      return countB - countA;
    });
  }, [selectedCategory, categoriesWithProducts, filteredProductsByCategory]);

  const hasFiltersApplied = Boolean(searchQuery || selectedType);

  // Show empty state if there are no products to display (either no products exist, or filters return no results)
  const showEmptyState = filteredProducts.length === 0;

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
      <DocumentTitleSegment segment="Cloud Marketplace - Catalog" />
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
            inputSlotProps={{
              sx: { maxWidth: 'unset !important' },
              inputProps: {
                'data-pendo-id': 'Cloud Marketplace Catalog-Search',
              },
            }}
            label="Search marketplace"
            noMarginTop
            onSearch={onSearch}
            placeholder="Search apps, products, and partners"
            value={searchQuery ?? ''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            data-pendo-id="Cloud Marketplace Catalog-Category"
            label="Category"
            onChange={(_, selected) =>
              updateSearchParam('category', selected?.label)
            }
            options={categoryOptions}
            placeholder="Category"
            textFieldProps={{
              hideLabel: true,
            }}
            value={
              categoryOptions.find((o) => o.label === selectedCategory) ?? null
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            data-pendo-id="Cloud Marketplace Catalog-Type"
            label="Type"
            onChange={(_, selected) =>
              updateSearchParam('type', selected?.label)
            }
            options={typeOptions}
            placeholder="Type"
            textFieldProps={{
              hideLabel: true,
            }}
            value={typeOptions.find((o) => o.label === selectedType) ?? null}
          />
        </Grid>
      </Grid>
      <Stack spacing={4}>
        {filteredCategories.map((categoryName) => {
          const categoryProducts =
            filteredProductsByCategory[categoryName] || [];
          // Do not render this category if it has no products
          if (categoryProducts.length === 0) return null;
          return (
            <CategorySection
              categoryName={categoryName}
              key={categoryName}
              products={categoryProducts}
            />
          );
        })}
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
