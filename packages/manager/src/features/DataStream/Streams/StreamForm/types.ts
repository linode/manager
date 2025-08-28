import type { CreateStreamPayload } from '@linode/api-v4';
import type { DestinationFormType } from 'src/features/DataStream/Shared/types';

export interface StreamFormType
  extends Omit<CreateStreamPayload, 'destinations'> {
  destinations: (number | undefined)[];
}

export interface StreamAndDestinationFormType {
  destination: DestinationFormType;
  stream: StreamFormType;
}
