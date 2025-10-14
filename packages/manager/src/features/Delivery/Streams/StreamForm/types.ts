import type { CreateStreamPayload, StreamDetailsType } from '@linode/api-v4';
import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

export interface StreamFromType extends Omit<CreateStreamPayload, 'details'> {
  details: StreamDetailsType;
}

export interface StreamAndDestinationFormType {
  destination: DestinationFormType;
  stream: StreamFromType;
}
