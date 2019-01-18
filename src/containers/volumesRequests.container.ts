import { connect } from 'react-redux';
import { UpdateVolumeParams, VolumeId } from 'src/store/volume/volume.actions';
import { createVolume, CreateVolumeRequest, deleteVolume, updateVolume } from 'src/store/volume/volume.requests';


 export interface VolumesRequests {
  createVolume: (request: CreateVolumeRequest) => Promise<Linode.Volume>,
  updateVolume: (params: UpdateVolumeParams) => Promise<Linode.Volume>,
  deleteVolume: (volumeId: VolumeId) => Promise<Linode.Volume>
}

 export default connect(undefined, {
  createVolume,
  updateVolume,
  deleteVolume
});