import { VolumeRequestPayload } from 'src/services/volumes';
import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory('@@manager/volumes');

export const createVolumeActions = actionCreator.async<VolumeRequestPayload, Linode.Volume, Linode.ApiFieldError[]>(`create`);

export const getAllVolumesActions = actionCreator.async<void, Linode.Volume[], Linode.ApiFieldError[]>('get-all');