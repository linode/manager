import { connect } from 'react-redux';
import {
  createVolume,
  CreateVolumeRequest,
  CreateVolumeResponse
} from 'src/store/volume/volume.requests';

 export interface VolumesRequests {
  createVolume: (p: CreateVolumeRequest) => Promise<CreateVolumeResponse>,
}

 export default connect(undefined, {
  createVolume
});