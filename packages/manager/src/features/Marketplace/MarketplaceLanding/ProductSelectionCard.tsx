import { Box, Chip, Typography } from '@linode/ui';
import { truncate } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

export interface ProductCardData {
  /**
   * Company name displayed below the product name
   */
  companyName: string;
  /**
   * Product description text
   */
  description: string;
  /**
   * URL or path to the product logo image
   */
  logoUrl: string;
  /**
   * Product name/title
   */
  productName: string;
  /**
   * Product tag chip displayed in top right corner (e.g., "New", "30 days free trial")
   */
  productTag?: string;
  /**
   * Bottom left type chip label (e.g., "SaaS and APIs")
   */
  type: string;
}

export interface ProductSelectionCardProps {
  /**
   * Product data to display
   */
  data: ProductCardData;
  /**
   * If true, the card will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Callback fired when the card is clicked
   */
  onClick?: () => void;
}

/**
 * A reusable product selection card component for displaying marketplace products.
 * Built on top of SelectionCard for consistency.
 */
export const ProductSelectionCard = React.memo(
  (props: ProductSelectionCardProps) => {
    const { data, disabled = false, onClick } = props;
    const { type, companyName, description, logoUrl, productName, productTag } =
      data;

    const subheadings = React.useMemo(
      () => [
        // Company name as first subheading
        <Typography
          key="company"
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Secondary.Default,
            font: theme.font.semibold,
            fontSize: theme.tokens.font.FontSize.Xxxs, // Must come after font
          })}
        >
          {companyName}
        </Typography>,
        // Description
        <Typography
          key="description"
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Primary.Default,
            fontSize: theme.tokens.font.FontSize.Xs,
            marginTop: theme.spacingFunction(12),
            paddingBottom: theme.spacingFunction(36), // Always space for type chip at bottom
          })}
          variant="body1"
        >
          {truncate(description, 200)}
        </Typography>,
        // Type chip (as last element with absolute positioning at bottom)
        <Box
          key="category"
          sx={(theme) => ({
            bottom: theme.spacingFunction(16),
            left: theme.spacingFunction(20),
            position: 'absolute',
          })}
        >
          <Chip
            label={type}
            size="small"
            sx={(theme) => ({
              backgroundColor: theme.tokens.alias.Background.Informativesubtle,
            })}
          />
        </Box>,
      ],
      [companyName, description, type]
    );

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
                  font: theme.font.bold,
                  fontSize: theme.tokens.font.FontSize.Xxxs, // Must come after font
                  padding: `${theme.spacingFunction(4)} ${theme.spacingFunction(6)}`,
                },
                backgroundColor:
                  theme.tokens.component.Badge.Positive.Subtle.Background,
                color: theme.tokens.component.Badge.Positive.Subtle.Text,
                flexShrink: 0,
              })}
            />
          )}
        </Box>
      );
    }, [logoUrl, productName, productTag]);

    return (
      <SelectionCard
        disabled={disabled}
        heading={productName}
        onClick={onClick}
        renderIcon={renderHeader}
        subheadings={subheadings}
        sxCardBase={(theme) => ({
          alignItems: 'flex-start',
          flexDirection: 'column',
          minHeight: '280px',
          padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(20)}`,
          position: 'relative',
          gap: theme.spacingFunction(12),
        })}
        sxCardBaseIcon={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      />
    );
  }
);

export const StyledLogoBox = styled(Box)({
  height: '48px',
  maxWidth: '96px',
  overflow: 'hidden',
  width: 'auto',
});
