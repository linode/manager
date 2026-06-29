import {
  BetaChip,
  Box,
  Button,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useMatchRoute, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Markdown } from 'src/components/Markdown/Markdown';
import { FOOTER_HEIGHT, FOOTER_HEIGHT_SM } from 'src/features/Footer';
import { TOPMENU_HEIGHT } from 'src/features/TopMenu/constants';

import { getProductById } from '../products';
import {
  formatTrademarkSymbols,
  getLogoUrl,
  MAIN_CONTENT_VERTICAL_PADDING,
  marketplaceContainerStyles,
} from '../shared';
import { ContactSalesDrawer } from './ContactSalesDrawer';
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
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const isContactSalesOpen = Boolean(
    matchRoute({ to: '/cloud-marketplace/catalog/$productId/contact-sales' })
  );

  const product = React.useMemo(() => getProductById(productId), [productId]);

  // Scroll to top on mount to prevent inheriting scroll position from the landing page
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

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

  // Tab content is optional. If not present for this product, we still show the page.
  const details = getProductTabDetails(productId);

  // Contact sales handler - navigates to contact-sales URL to open drawer
  const handleContactSales = () => {
    navigate({
      params: { productId },
      to: '/cloud-marketplace/catalog/$productId/contact-sales',
    });
  };

  const handleCloseContactSales = () => {
    navigate({
      params: { productId },
      to: '/cloud-marketplace/catalog/$productId',
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={{
        md: `calc(100vh - ${TOPMENU_HEIGHT}px - ${FOOTER_HEIGHT}px - ${MAIN_CONTENT_VERTICAL_PADDING}px)`,
        sm: `calc(100vh - ${TOPMENU_HEIGHT}px - ${FOOTER_HEIGHT_SM}px - ${MAIN_CONTENT_VERTICAL_PADDING}px)`,
        xs: 'auto',
      }}
      overflow="hidden"
      sx={marketplaceContainerStyles}
    >
      <DocumentTitleSegment
        segment={
          isContactSalesOpen
            ? `${product.name} - Contact Sales`
            : `${product.name} - Details`
        }
      />
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
          labelTitle: product.name,
          pathname: `/cloud-marketplace/catalog/${productId}`,
        }}
      />
      <Paper
        sx={(theme) => ({
          alignItems: 'flex-start',
          border: `1px solid ${theme.tokens.alias.Border.Normal}`,
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          padding: theme.spacingFunction(24),
          [theme.breakpoints.down('md')]: {
            padding: theme.spacingFunction(16),
          },
        })}
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
                    font: theme.tokens.alias.Typography.Heading.Xxl,
                    [theme.breakpoints.down('md')]: {
                      font: theme.tokens.alias.Typography.Heading.L,
                    },
                  })}
                  variant="h1"
                >
                  {formatTrademarkSymbols(product.name)}
                </Typography>
                {product.partner && (
                  <Typography
                    sx={(theme) => ({
                      color: theme.tokens.alias.Content.Text.Secondary.Default,
                      font: theme.font.bold,
                    })}
                    variant="body1"
                  >
                    {formatTrademarkSymbols(product.partner.name)}
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
                {formatTrademarkSymbols(product.shortDescription)}
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
                      color:
                        theme.tokens.component.Badge.Informative.Subtle.Text,
                    })}
                  />
                ))}
              </TagsContainer>

              {/* Contact Partner Button */}
              <Box marginTop={1}>
                <Button
                  buttonType="primary"
                  data-pendo-id={`Cloud Marketplace ${product.name}-Contact Partner`}
                  onClick={handleContactSales}
                >
                  Contact Partner
                </Button>
              </Box>
            </ProductDetailsSection>
          </ProductInfoSection>

          {/* Product Details Tabs */}
          {details && (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <ProductDetailsTabs details={details} />
            </Box>
          )}
        </ProductDetailsContainer>
        <ContactSalesDrawer
          onClose={handleCloseContactSales}
          open={isContactSalesOpen}
          partnerName={product.partner.name}
          productName={product.name}
        />
      </Paper>
    </Box>
  );
};
