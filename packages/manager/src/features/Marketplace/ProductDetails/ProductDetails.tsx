import { Box, Button, ErrorState, Paper, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { Markdown } from 'src/components/Markdown/Markdown';

import { getProductById } from '../products';
import { getLogoUrl } from '../shared';
import { getProductTabDetails } from './pages';
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

/**
 * Main Product Details Component
 */
export const ProductDetails = () => {
  const { productId } = useParams({
    from: '/cloud-marketplace/catalog/$productId',
  });
  const theme = useTheme();

  const numericProductId = Number(productId);

  const product = React.useMemo(
    () => getProductById(numericProductId),
    [numericProductId]
  );

  // Tab content is optional. If not present for this product, we still show the page.
  const details = getProductTabDetails(numericProductId);

  // Get logo URL based on theme
  const logoUrl = React.useMemo(() => {
    if (!product) {
      return '';
    }
    return getLogoUrl(product, theme);
  }, [product, theme]);

  // Handle invalid/unknown product id
  if (!product) {
    return (
      <ErrorState
        errorText={'Unable to load product details. Please try again later.'}
      />
    );
  }

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
        {product.infoBanner && (
          <InfoBanner variant="info">
            <Markdown textOrMarkdown={product.infoBanner} />
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
              {product.partner && (
                <Typography
                  sx={(theme) => ({
                    color: theme.tokens.alias.Content.Text.Secondary.Default,
                    font: theme.font.bold,
                  })}
                  variant="body1"
                >
                  {product.partner.name}
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
              {product.shortDescription}
            </Typography>

            {/* Tags */}
            <TagsContainer>
              {/* Tile Tag */}
              {product.tileTag && (
                <StyledChip
                  label={product.tileTag}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.tokens.component.Badge.Positive.Subtle.Background,
                    color: theme.tokens.component.Badge.Positive.Subtle.Text,
                  })}
                />
              )}

              {/* Product Tags */}
              {product.productTags?.map((tag: string, index: number) => (
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
        {details && (
          <Box width="100%">
            <ProductDetailsTabs details={details} />
          </Box>
        )}
      </ProductDetailsContainer>
    </Paper>
  );
};
