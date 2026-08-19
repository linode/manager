import React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';

import { Paper, Stack } from '../../components';
import styles from './LearnCard.module.css';

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
      className={styles.learnCardStack}
      direction="column"
      spacing="var(--token-global-spacing-s16)"
    >
      {items.map((item) => (
        <Paper className={styles.learnCardPaper} key={item.label}>
          <Stack className={styles.centerStack} direction="row">
            <DocsIcon height={19} width={19} />

            <Link className={styles.learnCardLink} external to={item.href}>
              <span>{item.label}</span>
            </Link>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
