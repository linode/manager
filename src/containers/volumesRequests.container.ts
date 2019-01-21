import { connect } from 'react-redux';
import { AttachVolumeParams, UpdateVolumeParams, VolumeId } from 'src/store/volume/volume.actions';
import { attachVolume, createVolume, CreateVolumeRequest, deleteVolume, detachVolume, updateVolume } from 'src/store/volume/volume.requests';

 export interface VolumesRequests {
  createVolume: (request: CreateVolumeRequest) => Promise<Linode.Volume>,
  updateVolume: (params: UpdateVolumeParams) => Promise<Linode.Volume>,
  deleteVolume: (volumeId: VolumeId) => Promise<{}>,
  attachVolume: (params: AttachVolumeParams) => Promise<Linode.Volume>
  detachVolume: (volumeId: VolumeId) => Promise<{}>
}

 export default connect(undefined, {
  createVolume,
  updateVolume,
  deleteVolume,
  attachVolume,
  detachVolume
});