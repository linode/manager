import { uploadImageSchema } from '@linode/validation';
import { mixed } from 'yup';

import { sendImageUploadEvent } from 'src/utilities/analytics/customEventAnalytics';
import { readableBytes } from 'src/utilities/unitConversions';

import type { ImageUploadPayload } from '@linode/api-v4';

export const recordImageAnalytics = (
  action: 'fail' | 'start' | 'success',
  file: File
) => {
  const readableFileSize = readableBytes(file.size).formatted;
  sendImageUploadEvent(action, readableFileSize);
};

export interface ImageUploadFormData extends ImageUploadPayload {
  file: File;
}

export const ImageUploadSchema = uploadImageSchema.shape({
  file: mixed().required('Image is required.'),
});

export interface ImageUploadNavigationState {
  imageDescription?: string;
  imageLabel?: string;
}
