import { Badge, RadioButton } from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import { Box, Notice, Paper, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import type { NodeBalancerType } from '@linode/api-v4';

export interface Props {
  disabled?: boolean;
  error?: string;
  tierChange: (tier: NodeBalancerType) => void;
  tierSelected: NodeBalancerType;
}

export const PREMIUM_NON_PREMIUM_NB_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/nodebalancer#premium-and-non-premium-nodebalancers';

const cardBaseSx = {
  alignContent: 'flex-start',
  alignItems: 'center',
  display: 'flex',
  gap: `${Spacing.S4} 0`,
};

const cardHeadingSx = {
  display: 'contents',
  fontSize: Font.FontSize.Xs,
};

const cardIconSx = {
  alignItems: 'center',
  svg: { fontSize: Font.FontSize.L },
};

const cardSubheadingSx = {
  paddingLeft: Spacing.S8,
  flexBasis: '100%',
};

export const NodeBalancerTierPanel = (props: Props) => {
  const { disabled, error, tierChange, tierSelected } = props;

  return (
    <Paper>
      <Stack spacing={Spacing.S16}>
        <Typography variant="h2">NodeBalancer Tier</Typography>
        <Stack spacing={Spacing.S12}>
          <Typography>
            Choose the NodeBalancer that best aligns with your application's
            performance, scale, and protocol requirements.{' '}
            <Link
              pendoId="NodeBalancers Create-Docs Tiers"
              to={PREMIUM_NON_PREMIUM_NB_LINK}
            >
              Learn more
            </Link>
            .
          </Typography>
          {error && <Notice text={error} variant="error" />}
          <Box
            role="radiogroup"
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}
          >
            <Grid container spacing={Spacing.S16}>
              <SelectionCard
                checked={tierSelected === 'common'}
                data-pendo-id="NodeBalancers Create-Basic"
                disabled={disabled}
                gridSize={{ xs: 12, sm: 6, md: 5 }}
                heading={
                  <Typography
                    sx={(theme) => ({
                      font: theme.font.bold,
                    })}
                  >
                    Basic
                  </Typography>
                }
                onClick={() => {
                  tierChange('common');
                }}
                renderIcon={() => (
                  <RadioButton
                    checked={tierSelected === 'common'}
                    disabled={disabled}
                    style={{
                      padding: `${Spacing.S4} 0 ${Spacing.S4} ${Spacing.S8} `,
                      margin: 0,
                    }}
                  />
                )}
                subheadings={[
                  'For general purpose workloads',
                  'Shared infrastructure for load balancing',
                  'Supports up to 1,000 backend nodes',
                  'Handles up to 10,000 concurrent connections',
                  'Supports TCP, HTTP, and HTTPS configurations',
                ]}
                sxCardBase={cardBaseSx}
                sxCardBaseHeading={cardHeadingSx}
                sxCardBaseIcon={cardIconSx}
                sxCardBaseSubheading={cardSubheadingSx}
              />
              <SelectionCard
                checked={tierSelected === 'premium'}
                data-pendo-id="NodeBalancers Create-Premium"
                disabled={disabled}
                gridSize={{ xs: 12, sm: 6, md: 5 }}
                heading={
                  <>
                    <Typography
                      sx={(theme) => ({
                        font: theme.font.bold,
                      })}
                    >
                      Premium
                    </Typography>
                    <Badge
                      style={{ marginLeft: Spacing.S8 }}
                      type="new"
                      variant="solid"
                    />
                  </>
                }
                onClick={() => {
                  tierChange('premium');
                }}
                renderIcon={() => (
                  <RadioButton
                    checked={tierSelected === 'premium'}
                    disabled={disabled}
                    style={{
                      padding: `${Spacing.S4} 0 ${Spacing.S4} ${Spacing.S8} `,
                      margin: 0,
                    }}
                  />
                )}
                subheadings={[
                  'For demanding workloads',
                  'Dedicated infrastructure for consistent performance',
                  'Supports up to 2,000 backend nodes',
                  'Handles up to 100,000 concurrent connections',
                  'Supports TCP, HTTP, and HTTPS configurations',
                ]}
                sxCardBase={cardBaseSx}
                sxCardBaseHeading={{
                  ...cardHeadingSx,
                  '& .cardSubheadingTitle': { columnGap: 0 },
                }}
                sxCardBaseIcon={cardIconSx}
                sxCardBaseSubheading={cardSubheadingSx}
              />
            </Grid>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};
