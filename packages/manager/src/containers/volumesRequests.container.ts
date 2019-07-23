import { connect } from 'react-redux';
import {
  AttachVolumeParams,
  CloneVolumeParams,
  ResizeVolumeParams,
  UpdateVolumeParams,
  VolumeId
} from 'src/store/volume/volume.actions';
import {
  attachVolume,
  cloneVolume,
  createVolume,
  CreateVolumeRequest,
  deleteVolume,
  detachVolume,
  resizeVolume,
  updateVolume
} from 'src/store/volume/volume.requests';

export interface VolumesRequests {
  createVolume: (request: CreateVolumeRequest) => Promise<Linode.Volume>;
  updateVolume: (params: UpdateVolumeParams) => Promise<Linode.Volume>;
  deleteVolume: (volumeId: VolumeId) => Promise<{}>;
  attachVolume: (params: AttachVolumeParams) => Promise<Linode.Volume>;
  detachVolume: (volumeId: VolumeId) => Promise<{}>;
  cloneVolume: (params: CloneVolumeParams) => Promise<Linode.Volume>;
  resizeVolume: (params: ResizeVolumeParams) => Promise<Linode.Volume>;
}

export default connect(
  undefined,
  {
    createVolume,
    updateVolume,
    deleteVolume,
    attachVolume,
    detachVolume,
    cloneVolume,
    resizeVolume
  }
);
