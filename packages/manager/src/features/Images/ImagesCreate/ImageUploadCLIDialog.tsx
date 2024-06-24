import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { sendCLIClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { wrapInQuotes } from 'src/utilities/stringUtils';

import type { ImageUploadFormData } from './ImageUpload.utils';

interface ImageUploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageUploadCLIDialog = (props: ImageUploadSuccessDialogProps) => {
  const { isOpen, onClose } = props;

  const form = useFormContext<ImageUploadFormData>();

  const { description, label, region } = form.getValues();

  const cliLabel = formatForCLI(label, 'label');
  const cliDescription = formatForCLI(description ?? '', 'description');
  const cliRegion = formatForCLI(region, 'region');

  const command = `linode-cli image-upload --label ${cliLabel} --description ${cliDescription} --region ${cliRegion} FILE`;

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      open={isOpen}
      title="Upload Image with the Linode CLI"
    >
      <CopyableTextField
        CopyTooltipProps={{
          onClickCallback: () => sendCLIClickEvent('Image Upload'),
        }}
        expand
        hideLabel
        label="CLI Command"
        noMarginTop
        sx={{ fontFamily: 'UbuntuMono, monospace, sans-serif' }}
        value={command}
      />
      <Typography sx={{ paddingTop: 2 }}>
        For more information, please see{' '}
        <Link to="https://www.linode.com/docs/guides/linode-cli">
          our guide on using the Linode CLI
        </Link>
        .
      </Typography>
    </Dialog>
  );
};

const formatForCLI = (value: string, fallback: string) => {
  return value ? wrapInQuotes(value) : `[${fallback.toUpperCase()}]`;
};
