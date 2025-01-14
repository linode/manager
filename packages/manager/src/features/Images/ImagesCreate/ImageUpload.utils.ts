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

/**
 * We extend the image upload payload to contain the file
 * so we can use react-hook-form to manage all of the form state.
 */
export interface ImageUploadFormData extends ImageUploadPayload {
  file: File;
}

/**
 * We extend the image upload schema to contain the file
 * so we can use react-hook-form to validate all of the
 * form state at once.
 */
export const ImageUploadSchema = uploadImageSchema.shape({
  file: mixed().required('Image is required.'),
});

/**
 * We use navigation state to pre-fill the upload form
 * when the user "retries" an upload.
 */
export interface ImageUploadNavigationState {
  imageDescription?: string;
  imageLabel?: string;
}
