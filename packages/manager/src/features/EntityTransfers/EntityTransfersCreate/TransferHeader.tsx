import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {}

export type CombinedProps = Props;

export const TransferHeader: React.FC<Props> = props => {
  return (
    <Typography>
      To transfer ownership of an entity make your selections below then click
      Generate Transfer Token.
    </Typography>
  );
};

export default React.memo(TransferHeader);
