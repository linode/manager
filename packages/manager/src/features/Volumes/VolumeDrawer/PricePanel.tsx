import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import DisplayPrice from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';

const getPrice = (size: number) => {
  return size * 0.1;
};

const getClampedPrice = (newSize: number, currentSize: number) =>
  newSize >= currentSize
    ? newSize <= MAX_VOLUME_SIZE
      ? getPrice(newSize)
      : getPrice(MAX_VOLUME_SIZE)
    : getPrice(currentSize);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
}));

interface Props {
  value: number;
  currentSize: number;
}

const PricePanel = ({ currentSize, value }: Props) => {
  const classes = useStyles();
  const price = getClampedPrice(value, currentSize);

  return (
    <div className={classes.root}>
      <DisplayPrice price={price} interval="mo" />
    </div>
  );
};

export default PricePanel;
