import type { CreateStreamPayload } from '@linode/api-v4';
import type { CreateDestinationForm } from 'src/features/DataStream/Shared/types';

export interface CreateStreamForm
  extends Omit<CreateStreamPayload, 'destinations'> {
  destinations: (number | undefined)[];
}

export interface CreateStreamAndDestinationForm {
  destination: CreateDestinationForm;
  stream: CreateStreamForm;
}
