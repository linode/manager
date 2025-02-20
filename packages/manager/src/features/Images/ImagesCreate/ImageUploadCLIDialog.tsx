import { Typography as FontTypography } from '@linode/design-language-system';
import { Dialog, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Link } from 'src/components/Link';
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
        sx={{ font: FontTypography.Code }}
        value={command}
      />
      <Typography sx={{ paddingTop: 2 }}>
        For more information, please see{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-the-linode-cli">
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
