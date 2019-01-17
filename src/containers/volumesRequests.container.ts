import { connect } from 'react-redux';
import { UpdateVolumeParams } from 'src/store/volume/volume.actions';
import { createVolume, CreateVolumeRequest, CreateVolumeResponse, updateVolume } from 'src/store/volume/volume.requests';


 export interface VolumesRequests {
  createVolume: (p: CreateVolumeRequest) => Promise<CreateVolumeResponse>,
  updateVolume: (p: UpdateVolumeParams) => Promise<CreateVolumeResponse>,
}

 export default connect(undefined, {
  createVolume,
  updateVolume
});