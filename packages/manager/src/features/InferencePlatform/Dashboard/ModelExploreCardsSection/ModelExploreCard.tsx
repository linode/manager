import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

import { Box, Chip, Paper, Stack, Typography } from '../../components';
import styles from './ModelExploreCard.module.css';

export interface ModelExploreCardData {
  /** CTA label shown in the top-right chip (e.g. "Browse Models"). Defaults to "View". */
  cta?: string;
  description: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  to: string;
}

interface ModelExploreCardProps {
  card: ModelExploreCardData;
}

export const ModelExploreCard = ({ card }: ModelExploreCardProps) => {
  return (
    <Link
      accessibleAriaLabel={`Explore ${card.title}`}
      className={styles.cardLink}
      to={card.to}
    >
      <Paper className={styles.paper}>
        <Stack alignItems="center" className={styles.stackFlex} direction="row">
          {card.icon && (
            <Box className={styles.iconCircle}>
              <Box className={styles.boxIcon} component={card.icon} />
            </Box>
          )}

          <Stack className={styles.textColumn}>
            <Stack
              alignItems="flex-start"
              className={styles.headerRow}
              direction="row"
            >
              <Typography className={styles.typographyTitle}>
                {card.title}
              </Typography>

              <Chip className={styles.viewChip} component="span">
                {card.cta ?? 'View'}
                <LeftArrowIcon
                  height={20}
                  style={{ transform: 'rotate(180deg)' }}
                  width={20}
                />
              </Chip>
            </Stack>

            <Typography className={styles.typographyDescription}>
              {card.description}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Link>
  );
};
