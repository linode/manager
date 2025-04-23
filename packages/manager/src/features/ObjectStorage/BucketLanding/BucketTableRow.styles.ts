import { styled } from '@mui/material/styles';

import { TableCell } from 'src/components/TableCell';

export const StyledBucketRegionCell = styled(TableCell, {
  label: 'StyledBucketRegionCell',
})(() => ({
  width: '20%',
}));

export const StyledBucketSizeCell = styled(TableCell, {
  label: 'StyledBucketSizeCell',
})(() => ({
  width: '15%',
}));

export const StyledBucketObjectsCell = styled(TableCell, {
  label: 'StyledBucketObjectsCell',
})(() => ({
  width: '10%',
}));
