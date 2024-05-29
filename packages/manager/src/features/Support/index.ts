import { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface FileAttachment {
  /* Each file needs to keep track of its own errors because each request hits the same endpoint */
  errors?: FormattedAPIError[];
  file: File | null;
  name: string;
  /* Used to ensure that the file doesn't get uploaded again */
  uploaded: boolean;
  /* Used to keep track of initial upload status */
  uploading: boolean;
}
