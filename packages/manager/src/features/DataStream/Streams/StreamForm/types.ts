import type { CreateStreamPayload } from '@linode/api-v4';
import type { DestinationFormType } from 'src/features/DataStream/Shared/types';

export interface StreamAndDestinationFormType {
  destination: DestinationFormType;
  stream: CreateStreamPayload;
}
