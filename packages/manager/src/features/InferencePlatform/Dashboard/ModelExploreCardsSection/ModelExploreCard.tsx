import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

import { Box, Paper, Stack, Typography } from '../../components';
import styles from './ModelExploreCard.module.css';

export interface ModelExploreCardData {
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
    <Paper className={styles.paper}>
      <Stack className={styles.stackZero}>
        <Stack
          alignItems="flex-start"
          className={styles.stackFlex}
          direction="row"
        >
          <Stack
            alignItems="center"
            className={styles.stackRow}
            direction="row"
          >
            {card.icon && (
              <Box className={styles.boxIcon} component={card.icon} />
            )}
            <Typography className={styles.typographyTitle}>
              {card.title}
            </Typography>
          </Stack>

          <Link accessibleAriaLabel={`Explore ${card.title}`} to={card.to}>
            <LeftArrowIcon
              height={28}
              style={{ transform: 'rotate(180deg)' }}
              width={28}
            />
          </Link>
        </Stack>

        <Typography className={styles.typographyDescription}>
          {card.description}
        </Typography>
      </Stack>
    </Paper>
  );
};
