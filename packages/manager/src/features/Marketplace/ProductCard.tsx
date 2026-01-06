import { Box, Chip, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import React from 'react';
import type { JSX } from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import type { SxProps, Theme } from '@mui/material/styles';

export interface ProductCardProps {
  /**
   * Company name displayed below the product name
   */
  companyName?: string;
  /**
   * Product description text
   */
  description?: string;
  /**
   * If true, the card will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * URL or path to the product logo image
   */
  logoUrl?: string;
  /**
   * Callback fired when the card is clicked
   */
  onClick?: () => void;
  /**
   * Product name/title
   */
  productName: string;
  /**
   * Product tag chip displayed in top right corner (e.g., "New", "30 days free trial")
   */
  productTag?: string;
  /**
   * Optional custom styles
   */
  sx?: SxProps<Theme>;
  /**
   * Bottom left type chip label (e.g., "SaaS and APIs")
   */
  type?: string;
}

/**
 * A reusable product card component for displaying marketplace products.
 * Built on top of SelectionCard for consistency.
 *
 * Layout:
 * - Top left: Rectangular logo
 * - Below logo: Product name (bold) and company name (smaller font)
 * - Middle: Description paragraph
 * - Top right: Optional promotion chip
 * - Bottom left: Optional category chip
 */
export const ProductCard = React.memo((props: ProductCardProps) => {
  const {
    type,
    companyName,
    description,
    disabled = false,
    logoUrl,
    onClick,
    productName,
    productTag,
    sx,
  } = props;

  // Build subheadings array: company name, description, and Product type chip
  const subheadings = React.useMemo(() => {
    const items: (JSX.Element | string | undefined)[] = [];

    // Company name as first subheading
    if (companyName) {
      items.push(
        <Typography
          key="company"
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Secondary.Default,
            fontSize: theme.tokens.font.FontSize.Xxxs,
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: theme.tokens.font.FontWeight.Semibold,
          })}
        >
          {companyName}
        </Typography>
      );
    }

    // Description
    if (description) {
      items.push(
        <Typography
          key="description"
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Primary.Default,
            fontSize: theme.tokens.font.FontSize.Xs,
            marginTop: theme.spacingFunction(12),
            paddingBottom: type ? theme.spacingFunction(36) : 0, // Space for type chip at bottom
          })}
          variant="body1"
        >
          {truncate(description, 268)}
        </Typography>
      );
    }

    return items;
  }, [companyName, description]);

  // Add type chip as last element with absolute positioning at bottom
  const subheadingsWithChip = React.useMemo(() => {
    if (!type) {
      return subheadings;
    }
    return [
      ...subheadings,
      <Box
        key="category"
        sx={(theme) => ({
          bottom: theme.spacingFunction(16),
          left: theme.spacingFunction(20),
          position: 'absolute',
        })}
      >
        <Chip label={type} size="small" />
      </Box>,
    ];
  }, [subheadings, type]);

  // Render header row with logo and optional Product tag chip
  const renderHeader = React.useCallback(() => {
    return (
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Logo */}
        {logoUrl && (
          <StyledLogoBox>
            <img
              alt={`${productName} logo`}
              src={logoUrl}
              style={{
                display: 'block',
                height: '100%',
                objectFit: 'contain',
                width: '100%',
              }}
            />
          </StyledLogoBox>
        )}

        {/* Product Tag Chip */}
        {productTag && (
          <Chip
            label={productTag}
            sx={(theme) => ({
              '& .MuiChip-label': {
                fontSize: theme.tokens.font.FontSize.Xxxs,
                // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
                fontWeight: theme.tokens.font.FontWeight.Bold,
                padding: `${theme.spacingFunction(4)} ${theme.spacingFunction(6)}`,
              },
              flexShrink: 0,
            })}
          />
        )}
      </Box>
    );
  }, [logoUrl, productName, productTag]);

  return (
    <SelectionCard
      data-testid="product-card"
      disabled={disabled}
      heading={productName}
      onClick={onClick}
      renderIcon={renderHeader}
      subheadings={subheadingsWithChip}
      sx={sx}
      sxCardBase={(theme) => ({
        alignItems: 'flex-start',
        flexDirection: 'column',
        minHeight: '280px',
        padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(20)}`,
        position: 'relative',
      })}
      sxCardBaseIcon={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
      }}
    />
  );
});

const StyledLogoBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.tokens.color.Neutrals[20]}`,
  borderRadius: theme.tokens.alias.Radius.Default,
  height: '48px',
  overflow: 'hidden',
  padding: theme.spacingFunction(8),
  width: '48px',
}));
