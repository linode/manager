import { TransferEntities } from '@linode/api-v4/lib/entity-transfers/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  entities: {
    marginBottom: theme.spacing(2),
  },
  label: {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  token: {
    marginBottom: theme.spacing(3),
  },
}));

export interface Props {
  entities?: TransferEntities;
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export const TransferDetailsDialog: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { entities, isOpen, onClose, token } = props;

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      open={isOpen}
      title="Service Transfer Details"
    >
      <div className={classes.token}>
        <Typography className={classes.label}>Token: </Typography>
        {token}
      </div>
      <Typography className={classes.label}>Linode IDs:</Typography>
      <div className={classes.entities}>
        {entities?.linodes.map((entity, idx) => {
          return (
            <Typography data-testid={idx} key={idx}>
              {entity}
            </Typography>
          );
        })}
      </div>
    </Dialog>
  );
};

export default React.memo(TransferDetailsDialog);
