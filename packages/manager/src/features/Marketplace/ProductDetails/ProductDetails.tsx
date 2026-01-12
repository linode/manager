import {
  useAllMarketplacePartnersQuery,
  useMarketplaceProductQuery,
} from '@linode/queries';
import {
  Box,
  Button,
  Chip,
  CircleProgress,
  ErrorState,
  Notice,
  Typography,
} from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { ProductDetailsTabs } from './ProductDetailsTabs';
import { sanitizeMarketplaceBannerHtml } from './sanitizeHtml';

import type { MarketplacePartner } from '@linode/api-v4';

/**
 * Styled Components following Figma specifications
 */
const OuterContainer = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  background: theme.bg.bgPaper,
  border: `1px solid ${theme.borderColors.borderTable}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  padding: '24px 32px',
}));

const ProductDetailsContainer = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  padding: '24px 32px',
}));

const InfoBanner = styled(Notice)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  maxWidth: '630px',
  width: '100%',
}));

const ProductInfoSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  gap: '24px',
}));

const LogoContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '96px',
  justifyContent: 'center',
  width: '96px',
}));

const ProductDetailsSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

const ProductTitleSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}));

const TagsContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}));

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
      ? sanitizeMarketplaceBannerHtml(product.info_banner)
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

  // Determine logo URL based on theme
  const logoUrl = partner
    ? theme.palette.mode === 'dark' && partner.logo_url_dark_mode
      ? partner.logo_url_dark_mode
      : partner.logo_url_light_mode
    : '';

  // Contact sales handler placeholder - will be implemented in a future ticket
  const handleContactSales = () => {
    // Placeholder for contact sales functionality
  };

  return (
    <OuterContainer>
      {/* Breadcrumb - will be implemented in a future ticket */}
      <Box>
        <Typography color="textSecondary" variant="body2">
          Breadcrumb placeholder
        </Typography>
      </Box>

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
                  fontSize: theme.tokens.font.FontSize.Xxl,
                  lineHeight: theme.tokens.font.LineHeight.Xl,
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
                    fontSize: theme.tokens.font.FontSize.Xs,
                    lineHeight: theme.tokens.font.LineHeight.Xs,
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
                fontSize: theme.tokens.font.FontSize.Xs,
                lineHeight: theme.tokens.font.LineHeight.Xs,
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
                <Chip
                  label={product.tile_tag}
                  sx={(theme) => ({
                    '& .MuiChip-label': {
                      fontSize: theme.tokens.font.FontSize.Xxxs,
                      fontFamily: theme.font.bold,
                      letterSpacing: '0.12px',
                      lineHeight: '12px',
                      padding: `${theme.spacingFunction(4)} ${theme.spacingFunction(6)}`,
                    },
                    backgroundColor:
                      theme.tokens.component.Badge.Positive.Subtle.Background,
                    color: theme.tokens.component.Badge.Positive.Subtle.Text,
                    flexShrink: 0,
                  })}
                />
              )}

              {/* Product Tags */}
              {product.product_tags?.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={(theme) => ({
                    '& .MuiChip-label': {
                      fontSize: theme.tokens.font.FontSize.Xxxs,
                      fontFamily: theme.font.bold,
                      letterSpacing: '0.12px',
                      lineHeight: '12px',
                      padding: `${theme.spacingFunction(4)} ${theme.spacingFunction(6)}`,
                    },
                    backgroundColor:
                      theme.tokens.component.Badge.Informative.Subtle
                        .Background,
                    color: theme.tokens.component.Badge.Informative.Subtle.Text,
                    flexShrink: 0,
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
    </OuterContainer>
  );
};
