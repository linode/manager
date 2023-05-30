import QRCode from 'qrcode.react';
import * as React from 'react';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {},
  instructions: {
    marginTop: theme.spacing(2),
  },
  qrcodeContainer: {
    margin: `${theme.spacing(2)} 0`,
    border: `5px solid #fff`,
    display: 'inline-block',
  },
}));

interface Props {
  secret: string;
  secretLink: string;
}

export const QRCodeForm = (props: Props) => {
  const { classes } = useStyles();
  const { secret, secretLink } = props;
  return (
    <React.Fragment>
      <Typography variant="h3" data-qa-copy className={classes.instructions}>
        Scan this QR code to add your Linode account to your 2FA app:
      </Typography>
      <div className={classes.qrcodeContainer}>
        <QRCode
          size={200}
          level="H" // QR code error checking level ("High"); gives a higher resolution code
          value={secretLink}
          data-qa-qr-code
        />
      </div>
      <Typography variant="h3" data-qa-copy className={classes.instructions}>
        If your 2FA app does not have a scanner, you can use this secret key:
      </Typography>
      <CopyableTextField
        className={classes.root}
        value={secret}
        label="Secret Key"
        hideLabel
      />
    </React.Fragment>
  );
};
