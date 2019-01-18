import { connect } from 'react-redux';
import { UpdateVolumeParams, VolumeId } from 'src/store/volume/volume.actions';
import { createVolume, CreateVolumeRequest, deleteVolume, updateVolume } from 'src/store/volume/volume.requests';


 export interface VolumesRequests {
  createVolume: (p: CreateVolumeRequest) => Promise<Linode.Volume>,
  updateVolume: (p: UpdateVolumeParams) => Promise<Linode.Volume>,
  deleteVolume: (p: VolumeId) => Promise<Linode.Volume>
}

 export default connect(undefined, {
  createVolume,
  updateVolume,
  deleteVolume
});