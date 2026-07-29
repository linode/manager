import { Box, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import LeftArrowIcon from 'src/assets/icons/arrow-left.svg';
import { Link } from 'src/components/Link';

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
  const cmTheme = useTheme();
  const starIconStyle: React.CSSProperties & { '--color-a': string } = {
    '--color-a':
      cmTheme.palette.mode === 'light'
        ? cmTheme.tokens.color.Neutrals[100]
        : cmTheme.tokens.color.Neutrals[10],
  };

  return (
    <Paper
      sx={{
        background:
          cmTheme.palette.mode === 'light'
            ? `linear-gradient(140deg, ${cmTheme.tokens.color.Ultramarine[20]} 0%, ${cmTheme.tokens.color.Ultramarine[30]} 100%)`
            : `linear-gradient(140deg, ${cmTheme.tokens.color.Ultramarine[100]} 0%, ${cmTheme.tokens.color.Ultramarine[90]} 100%)`,
        borderWidth: 0,
        overflow: 'hidden',
        px: 3.25,
        paddingTop: 3,
        paddingBottom: 2.2,
        position: 'relative',
      }}
      variant="outlined"
    >
      <Stack gap="0px">
        <Stack
          alignItems="flex-start"
          direction="row"
          gap={0}
          height={28}
          justifyContent="space-between"
        >
          <Stack alignItems="center" direction="row" gap={1.1}>
            {card.icon && (
              <Box
                component={card.icon}
                height={20}
                style={starIconStyle}
                width={20}
              />
            )}
            <Typography
              color="text.primary"
              content={card.title}
              fontSize={18}
              fontWeight={700}
            >
              {card.title}
            </Typography>
          </Stack>

          <Link to={card.to}>
            <LeftArrowIcon
              height={28}
              style={{ transform: 'rotate(180deg)' }}
              width={28}
            />
          </Link>
        </Stack>

        <Typography color="text.primary" fontSize={16} lineHeight={1.4}>
          {card.description}
        </Typography>
      </Stack>
    </Paper>
  );
};
