import * as React from 'react';
import QRCode from 'qrcode.react';
import Typography from 'src/components/core/Typography';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { styled } from '@mui/material/styles';

interface Props {
  secret: string;
  secretLink: string;
}

export const QRCodeForm = (props: Props) => {
  const { secret, secretLink } = props;
  return (
    <React.Fragment>
      <StyledInstructions variant="h3" data-qa-copy>
        Scan this QR code to add your Linode account to your 2FA app:
      </StyledInstructions>
      <StyledQRCodeContainer>
        <QRCode
          size={200}
          level="H" // QR code error checking level ("High"); gives a higher resolution code
          value={secretLink}
          data-qa-qr-code
        />
      </StyledQRCodeContainer>
      <StyledInstructions variant="h3" data-qa-copy>
        If your 2FA app does not have a scanner, you can use this secret key:
      </StyledInstructions>
      <CopyableTextField value={secret} label="Secret Key" hideLabel />
    </React.Fragment>
  );
};

const StyledInstructions = styled(Typography, {
  label: 'StyledInstructions',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledQRCodeContainer = styled('div', {
  label: 'StyledQRCodeContainer',
})(({ theme }) => ({
  margin: `${theme.spacing(2)} 0`,
  border: `5px solid #fff`,
  display: 'inline-block',
}));
