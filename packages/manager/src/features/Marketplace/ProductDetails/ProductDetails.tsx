import {
  useAllMarketplacePartnersQuery,
  useMarketplaceProductQuery,
} from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import {
  InfoBanner,
  LogoContainer,
  ProductDetailsContainer,
  ProductDetailsSection,
  ProductInfoSection,
  ProductTitleSection,
  StyledChip,
  TagsContainer,
} from './ProductDetails.styles';
import { ProductDetailsTabs } from './ProductDetailsTabs';

import type { MarketplacePartner } from '@linode/api-v4';

/**
 * Main Product Details Component
 */
export const ProductDetails = () => {
  const { productId } = useParams({
    from: '/cloud-marketplace/catalog/$productId',
  });
  const theme = useTheme();

  // Fetch partners using shared query (cached from parent page)
  const { data: partners } = useAllMarketplacePartnersQuery();

  // Fetch product details using shared query
  const {
    data: product,
    error,
    isLoading,
  } = useMarketplaceProductQuery(Number(productId));

  const sanitizedInfoBanner = React.useMemo(() => {
    return product?.info_banner
      ? sanitizeHTML({ sanitizingTier: 'flexible', text: product.info_banner })
      : '';
  }, [product?.info_banner]);

  // Find partner information
  const partner = React.useMemo(() => {
    if (!partners || !product) {
      return null;
    }
    return partners.find(
      (p: MarketplacePartner) => p.id === product.partner_id
    );
  }, [partners, product]);

  // Handle loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <CircleProgress />
      </Box>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <ErrorState
        errorText={
          error?.[0]?.reason ||
          'Unable to load product details. Please try again later.'
        }
      />
    );
  }

  // Determine logo URL based on theme (fallback to light mode if dark mode logo is unavailable)
  const logoUrl = partner
    ? (theme.name === 'dark' && partner.logo_url_dark_mode) ||
      partner.logo_url_light_mode
    : '';

  // Contact sales handler placeholder - will be implemented in a future ticket
  const handleContactSales = () => {
    // Placeholder for contact sales functionality
  };

  return (
    <Paper
      sx={{
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ProductDetailsContainer>
        {/* Info Banner (conditional) */}
        {product.info_banner && (
          <InfoBanner variant="info">
            <div dangerouslySetInnerHTML={{ __html: sanitizedInfoBanner }} />
          </InfoBanner>
        )}

        {/* Product Info Section */}
        <ProductInfoSection>
          {/* Product Logo */}
          <LogoContainer>
            {logoUrl && (
              <img
                alt={`${product.name} logo`}
                src={logoUrl}
                style={{
                  height: '100%',
                  objectFit: 'contain',
                  width: '100%',
                }}
              />
            )}
          </LogoContainer>

          {/* Product Details */}
          <ProductDetailsSection>
            {/* Product Name and Partner */}
            <ProductTitleSection>
              <Typography
                sx={(theme) => ({
                  color: theme.tokens.alias.Content.Text.Primary.Default,
                  font: theme.font.extrabold,
                })}
                variant="h1"
              >
                {product.name}
              </Typography>
              {partner && (
                <Typography
                  sx={(theme) => ({
                    color: theme.tokens.alias.Content.Text.Secondary.Default,
                    font: theme.font.bold,
                  })}
                  variant="body1"
                >
                  {partner.name}
                </Typography>
              )}
            </ProductTitleSection>

            {/* Description */}
            <Typography
              sx={(theme) => ({
                alignSelf: 'stretch',
                color: theme.tokens.component.Tile.Default.Text,
                font: theme.font.normal,
                maxWidth: '800px',
              })}
              variant="body1"
            >
              {product.short_description}
            </Typography>

            {/* Tags */}
            <TagsContainer>
              {/* Tile Tag */}
              {product.tile_tag && (
                <StyledChip
                  label={product.tile_tag}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.tokens.component.Badge.Positive.Subtle.Background,
                    color: theme.tokens.component.Badge.Positive.Subtle.Text,
                  })}
                />
              )}

              {/* Product Tags */}
              {product.product_tags?.map((tag: string, index: number) => (
                <StyledChip
                  key={index}
                  label={tag}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.tokens.component.Badge.Informative.Subtle
                        .Background,
                    color: theme.tokens.component.Badge.Informative.Subtle.Text,
                  })}
                />
              ))}
            </TagsContainer>

            {/* Contact Sales Button */}
            <Box marginTop={1}>
              <Button
                buttonType="primary"
                data-pendo-id={`Cloud Marketplace ${product.name}-Contact Sales`}
                onClick={handleContactSales}
              >
                Contact Sales
              </Button>
            </Box>
          </ProductDetailsSection>
        </ProductInfoSection>

        {/* Product Details Tabs */}
        {product.details && (
          <Box width="100%">
            <ProductDetailsTabs details={product.details} />
          </Box>
        )}
      </ProductDetailsContainer>
    </Paper>
  );
};
