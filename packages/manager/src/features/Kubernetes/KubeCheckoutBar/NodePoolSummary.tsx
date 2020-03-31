import { LinodeType } from 'linode-js-sdk/lib/linodes/types';
import * as React from 'react';
import Delete from 'src/assets/icons/trash.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import { pluralize } from 'src/utilities/pluralize';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3)
  },
  typeHeader: {
    paddingLeft: theme.spacing(),
    paddingBottom: theme.spacing(0.5),
    fontSize: '16px',
    fontWeight: 600
  },
  typeSubheader: {
    paddingLeft: theme.spacing(),
    fontSize: '14px'
  },
  unitPrice: {
    fontSize: '16px',
    fontWeight: 600,
    color: theme.color.green
  }
}));

export interface Props {
  nodeCount: number;
  poolType: LinodeType | null;
  price: number;
  updateNodeCount: (count: number) => void;
  onRemove: () => void;
}

export const NodePoolSummary: React.FC<Props> = props => {
  const { nodeCount, onRemove, poolType, price, updateNodeCount } = props;

  const classes = useStyles();

  // This should never happen but TS wants us to account for the situation
  // where we fail to match a selected type against our types list.
  if (poolType === null) {
    return null;
  }

  return (
    <Grid
      container
      alignItems="flex-start"
      direction="column"
      className={classes.root}
    >
      <Grid
        container
        direction="row"
        alignItems="center"
        justify="space-between"
        wrap="nowrap"
      >
        <Grid item>
          <Typography className={classes.typeHeader}>
            {poolType.label} Plan
          </Typography>
          <Typography className={classes.typeSubheader}>
            {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
            GB Storage
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={onRemove}>
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item>
        <EnhancedNumberInput value={nodeCount} setValue={updateNodeCount} />
      </Grid>
      <Grid item>
        <Typography className={classes.unitPrice}>${price}/month</Typography>
      </Grid>
    </Grid>
  );
};

export default React.memo(NodePoolSummary);
