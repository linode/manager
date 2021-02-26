import { TransferEntities } from '@linode/api-v4/lib/entity-transfers/types';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import InformationDialog from 'src/components/InformationDialog';

const useStyles = makeStyles((theme: Theme) => ({
  token: {
    marginBottom: theme.spacing(3),
  },
  label: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  entities: {
    marginBottom: theme.spacing(2),
  },
}));

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  entities?: TransferEntities;
}

export const TransferDetailsDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { isOpen, onClose, token, entities } = props;

  return (
    <InformationDialog
      title="Transfer Details"
      fullWidth
      open={isOpen}
      onClose={onClose}
    >
      <div className={classes.token}>
        <Typography className={classes.label}>Transfer Token: </Typography>
        {token}
      </div>
      <Typography className={classes.label}>Linode IDs:</Typography>
      <div className={classes.entities}>
        {entities?.linodes.map((entity, idx) => {
          return (
            <Typography key={idx} data-testid={idx}>
              {entity}
            </Typography>
          );
        })}
      </div>
    </InformationDialog>
  );
};

export default React.memo(TransferDetailsDialog);
