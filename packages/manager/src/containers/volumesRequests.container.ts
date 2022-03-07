import { Volume } from '@linode/api-v4/lib/volumes';
import { connect } from 'react-redux';
import {
  AttachVolumeParams,
  CloneVolumeParams,
  ResizeVolumeParams,
  UpdateVolumeParams,
  VolumeId,
} from 'src/store/volume/volume.actions';
import {
  attachVolume,
  cloneVolume,
  createVolume,
  CreateVolumeRequest,
  deleteVolume,
  detachVolume,
  getAllVolumes,
  getVolumesPage,
  resizeVolume,
  updateVolume,
} from 'src/store/volume/volume.requests';

export interface VolumesRequests {
  createVolume: (request: CreateVolumeRequest) => Promise<Volume>;
  updateVolume: (params: UpdateVolumeParams) => Promise<Volume>;
  deleteVolume: (volumeId: VolumeId) => Promise<{}>;
  attachVolume: (params: AttachVolumeParams) => Promise<Volume>;
  detachVolume: (volumeId: VolumeId) => Promise<{}>;
  cloneVolume: (params: CloneVolumeParams) => Promise<Volume>;
  resizeVolume: (params: ResizeVolumeParams) => Promise<Volume>;
  getAllVolumes: () => Promise<Volume[]>;
  getVolumesPage: (params?: any, filters?: any) => Promise<Volume[]>;
}

export default connect(undefined, {
  createVolume,
  updateVolume,
  deleteVolume,
  attachVolume,
  detachVolume,
  cloneVolume,
  resizeVolume,
  getAllVolumes,
  getVolumesPage,
});
