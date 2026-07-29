import { Paper, Stack } from '@linode/ui';
import React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';

export interface LearnItem {
  href: string;
  label: string;
}

interface LearnCardProps {
  items: LearnItem[];
}

export const LearnCard = ({ items }: LearnCardProps) => {
  return (
    <Stack
      alignItems="flex-start"
      direction="column"
      gap={2}
      sx={{ border: 'none', p: 0, background: 'transparent' }}
    >
      {items.map((item) => (
        <Paper
          key={item.label}
          sx={(theme) => ({
            '& .learnCardLink': {
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              color: theme.tokens.alias.Content.Icon.Secondary.Default,
            },
            '& .learnCardLink > span svg': {
              color: theme.tokens.alias.Content.Icon.Primary.Default,
            },
            '& .learnCardLink > span': {
              marginLeft: 0,
              position: 'static',
              top: 0,
              transform: 'none',
            },
            '& .learnCardLink:hover': {
              color: theme.tokens.alias.Content.Icon.Primary,
            },
            '& .learnCardLink:hover > span svg': {
              color: theme.tokens.alias.Content.Icon.Primary,
            },
            borderRadius: 0,
            border: 'none',
            padding: '11px 20px 11px 12px',
            width: '100%',
          })}
          variant="outlined"
        >
          <Stack alignItems="center" direction="row" gap={0.8}>
            <DocsIcon height={19} marginTop={0.13} width={19} />

            <Link className="learnCardLink" external to={item.href}>
              {item.label}
            </Link>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
