import { styled } from '@mui/material/styles';
import QRCode from 'qrcode.react';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Typography } from 'src/components/Typography';

interface Props {
  secret: string;
  secretLink: string;
}

export const QRCodeForm = (props: Props) => {
  const { secret, secretLink } = props;
  return (
    <React.Fragment>
      <StyledInstructions data-qa-copy variant="h3">
        Scan this QR code to add your Cloud Manager account to your 2FA app:
      </StyledInstructions>
      <StyledQRCodeContainer>
        <QRCode
          data-qa-qr-code
          level="H" // QR code error checking level ("High"); gives a higher resolution code
          size={200}
          value={secretLink}
        />
      </StyledQRCodeContainer>
      <StyledInstructions data-qa-copy variant="h3">
        If your 2FA app does not have a scanner, you can use this secret key:
      </StyledInstructions>
      <CopyableTextField hideLabel label="Secret Key" value={secret} />
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
  border: `5px solid #fff`,
  display: 'inline-block',
  margin: `${theme.spacing(2)} 0`,
}));
