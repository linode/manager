import { Box, Divider, IconButton, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { pluralize } from 'src/utilities/pluralize';

import type { Theme } from '@mui/material/styles';
import type { ExtendedType } from 'src/utilities/extendType';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '&:hover': {
      color: theme.tokens.color.Neutrals[70],
    },
    alignItems: 'flex-start',
    color: theme.tokens.color.Neutrals[50],
    marginTop: -4,
    padding: 0,
  },
  numberInput: {
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  price: {
    '& h3': {
      color: `${theme.palette.text.primary} !important`,
      fontFamily: theme.font.normal,
    },
  },
  root: {
    '& $textField': {
      width: 53,
    },
  },
  typeHeader: {
    fontFamily: theme.font.bold,
    fontSize: '16px',
    paddingBottom: theme.spacing(0.5),
  },
  typeSubheader: {
    fontSize: '14px',
  },
}));

export interface Props {
  nodeCount: number;
  onRemove: () => void;
  poolType: ExtendedType | null;
  price?: null | number; // Can be undefined until a Region is selected.
  updateNodeCount: (count: number) => void;
}

export const NodePoolSummary = React.memo((props: Props) => {
  const { classes } = useStyles();
  const { nodeCount, onRemove, poolType, price, updateNodeCount } = props;

  // This should never happen but TS wants us to account for the situation
  // where we fail to match a selected type against our types list.
  if (poolType === null) {
    return null;
  }

  return (
    <>
      <Divider dark spacingBottom={12} spacingTop={24} />
      <Box
        className={classes.root}
        data-testid="node-pool-summary"
        display="flex"
        flexDirection="column"
      >
        <Box display="flex" justifyContent="space-between">
          <div>
            <Typography className={classes.typeHeader}>
              {poolType.formattedLabel} Plan
            </Typography>
            <Typography className={classes.typeSubheader}>
              {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
              GB Storage
            </Typography>
          </div>
          <IconButton
            className={classes.button}
            data-testid="remove-pool-button"
            onClick={onRemove}
            size="large"
            title={`Remove ${poolType.label} Node Pool`}
          >
            <Close />
          </IconButton>
        </Box>
        <div className={classes.numberInput}>
          <EnhancedNumberInput
            min={1}
            setValue={updateNodeCount}
            value={nodeCount}
          />
        </div>
        <div className={classes.price}>
          {price ? (
            <DisplayPrice fontSize="14px" interval="month" price={price} />
          ) : undefined}
        </div>
      </Box>
    </>
  );
});
