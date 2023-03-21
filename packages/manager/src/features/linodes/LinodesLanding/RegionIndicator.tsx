import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles({
  regionIndicator: {
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
});

interface Props {
  region: string;
}

const RegionIndicator = (props: Props) => {
  const { region } = props;
  const classes = useStyles();
  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <div className={classes.regionIndicator}>
      {actualRegion?.label ?? region}
    </div>
  );
};

export default RegionIndicator;
