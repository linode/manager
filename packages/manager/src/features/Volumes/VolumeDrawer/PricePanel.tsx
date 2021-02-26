import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import DisplayPrice from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';

type ClassNames = 'root';

const getPrice = (size: number) => {
  return size * 0.1;
};

const getClampedPrice = (newSize: number, currentSize: number) =>
  newSize >= currentSize
    ? newSize <= MAX_VOLUME_SIZE
      ? getPrice(newSize)
      : getPrice(MAX_VOLUME_SIZE)
    : getPrice(currentSize);

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(4),
    },
  });

interface Props {
  value: number;
  currentSize: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PricePanel: React.FC<CombinedProps> = ({
  currentSize,
  value,
  classes,
}) => {
  const price = getClampedPrice(value, currentSize);

  return (
    <div className={classes.root}>
      <DisplayPrice price={price} interval="mo" />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(PricePanel);
