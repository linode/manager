import { Box, Paper, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

const PROMO_TILE_COLUMNS = 6;
const PROMO_TILE_ROWS = 4;
const PROMO_TILE_COUNT = PROMO_TILE_COLUMNS * PROMO_TILE_ROWS;

export type PromoTileStyle =
  | 'empty'
  | 'full'
  | 'roundBL'
  | 'roundBR'
  | 'roundTL'
  | 'roundTR';

export interface PromoCardPattern {
  offsetX: number;
  offsetY: number;
  scale: number;
  tiles: PromoTileStyle[];
}

export interface PromoCardData {
  cta: string;
  description: string;
  pattern: PromoCardPattern;
  title: string;
  to: string;
}

interface PromoCardProps {
  card: PromoCardData;
}

const getTileShapeSx = (tile: PromoTileStyle, tileColor: string) => {
  if (tile === 'empty') {
    return { display: 'none' };
  }

  if (tile === 'full') {
    return {
      backgroundColor: tileColor,
      height: '100%',
      width: '100%',
    };
  }

  const baseRoundTile = {
    backgroundColor: tileColor,
    borderRadius: '50%',
    height: '200%',
    position: 'absolute' as const,
    width: '200%',
  };

  if (tile === 'roundTL') {
    return {
      ...baseRoundTile,
      left: '0%',
      top: '0%',
    };
  }

  if (tile === 'roundTR') {
    return {
      ...baseRoundTile,
      left: '-100%',
      top: '0%',
    };
  }

  if (tile === 'roundBL') {
    return {
      ...baseRoundTile,
      left: '0%',
      top: '-100%',
    };
  }

  if (tile === 'roundBR') {
    return {
      ...baseRoundTile,
      left: '-100%',
      top: '-100%',
    };
  }

  return {
    ...baseRoundTile,
    left: '0%',
    top: '0%',
  };
};

export const PromoCard = ({ card }: PromoCardProps) => {
  const tiledBackground = Array.from(
    { length: PROMO_TILE_COUNT },
    (_, index) => {
      return card.pattern.tiles[index] ?? 'empty';
    }
  );

  return (
    <Paper
      sx={(theme) => ({
        '& .promoCardCta': {
          backgroundColor: theme.tokens.color.Ultramarine[90], // Action Button Field
          borderRadius: '999px',
          color: theme.palette.primary.contrastText,
          display: 'inline-flex',
          font: theme.font.semibold,
          fontSize: theme.tokens.font.FontSize.S,
          lineHeight: 1,
          padding: '10px 16px 9px 16px',
          textDecoration: 'none',
          width: 'fit-content',
        },
        '& .promoCardCta:hover': {
          backgroundColor: theme.tokens.color.Ultramarine[80], // Action Button Field
        },
        background: `linear-gradient(140deg, ${
          theme.palette.mode === 'light'
            ? `${theme.tokens.color.Ultramarine[20]} 0%, ${theme.tokens.color.Ultramarine[30]} 100%` // Card background gradient - LIGHT
            : `${theme.tokens.color.Ultramarine[100]} 0%, ${theme.tokens.color.Ultramarine[90]} 100%` // Card background gradient - DARK
        })`, // Tile background colour
        border: 'none',
        borderRadius: 1,
        overflow: 'hidden',
        p: 3,
        position: 'relative',
      })}
      variant="outlined"
    >
      <Box
        sx={{
          height: '100%',
          left: 0,
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            aspectRatio: `${PROMO_TILE_COLUMNS} / ${PROMO_TILE_ROWS}`,
            display: 'grid',
            gridTemplateColumns: `repeat(${PROMO_TILE_COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${PROMO_TILE_ROWS}, minmax(0, 1fr))`,
            height: '100%',
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: `translate(calc(-50% + ${card.pattern.offsetX}px), calc(-50% + ${card.pattern.offsetY}px)) scale(${card.pattern.scale})`,
            transformOrigin: 'center',
          }}
        >
          {tiledBackground.map((tile, index) => (
            <Box
              key={`${card.title}-${index}`}
              sx={{
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={(theme) => ({
                  ...getTileShapeSx(
                    tile,
                    theme.palette.mode === 'light'
                      ? 'hsla(220, 80%, 46%, 0.05)' // Tile pattern colour - LIGHT
                      : 'hsla(220, 26%, 2%, 0.14)' // Tile pattern colour - DARK
                  ), // Tile pattern colour
                })}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Card Definitinion */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'auto auto auto',
          position: 'relative',
          rowGap: 1.5,
          zIndex: 1,
        }}
      >
        <Box sx={{ alignItems: 'flex-start', display: 'flex', minHeight: 20 }}>
          <Typography padding={0} variant="h3">
            {card.title}
          </Typography>
        </Box>

        <Box sx={{ alignItems: 'flex-start', display: 'flex', minHeight: 38 }}>
          <Typography color="text.secondary" margin={0}>
            {card.description}
          </Typography>
        </Box>

        <Box sx={{ alignItems: 'flex-end', display: 'flex', minHeight: 39 }}>
          <Link
            className="promoCardCta"
            external={card.to.startsWith('http')}
            hideIcon
            to={card.to}
          >
            {card.cta}
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};
