import { APIError } from '@linode/api-v4/lib/types';

export interface FileAttachment {
  name: string;
  file: File | null;
  /* Used to keep track of initial upload status */
  uploading: boolean;
  /* Used to ensure that the file doesn't get uploaded again */
  uploaded: boolean;
  /* Each file needs to keep track of its own errors because each request hits the same endpoint */
  errors?: APIError[];
}
