import { Link } from 'react-router-dom';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { styled } from '@mui/material/styles';

export const StyledBucketRow = styled(TableRow, {
  label: 'StyledBucketRow',
})(({ theme }) => ({
  backgroundColor: theme.bg.white,
}));

export const StyledBucketNameWrapper = styled('div', {
  label: 'StyledBucketNameWrapper',
})(() => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  wordBreak: 'break-all',
}));

export const StyledBucketLabelLink = styled(Link, {
  label: 'StyledBucketLabelLink',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
}));

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
