import type { CreateStreamPayload } from '@linode/api-v4';
import type { CreateDestinationForm } from 'src/features/DataStream/Shared/types';

export interface CreateStreamForm
  extends CreateDestinationForm,
    CreateStreamPayload {}
