import React from 'react';

import { Link } from 'src/components/Link';

import { Box, Paper, Typography } from '../../components';
import styles from './PromoCard.module.css';

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

const getTileShapeStyle = (tile: PromoTileStyle, tileColor: string) => {
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
    <Paper className={styles.promoCard}>
      <Box className={styles.outerBox}>
        <Box
          className={styles.promoBox}
          style={{
            transform: `translate(calc(-50% + ${card.pattern.offsetX}px), calc(-50% + ${card.pattern.offsetY}px)) scale(${card.pattern.scale})`,
          }}
        >
          {tiledBackground.map((tile, index) => (
            <Box className={styles.boxTitle} key={`${card.title}-${index}`}>
              <Box style={getTileShapeStyle(tile, 'var(--tile-color)')} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Card Definitinion */}
      <Box className={styles.boxGrid}>
        <Box className={styles.boxH3}>
          <Typography className={styles.typographyH3}>{card.title}</Typography>
        </Box>

        <Box className={styles.boxDescription}>
          <Typography className={styles.typographyDescription}>
            {card.description}
          </Typography>
        </Box>

        <Box align-items="flex-end" className={styles.boxEnd}>
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
