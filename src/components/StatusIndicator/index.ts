import StatusIndicator, {
  getStatusForDomain as _getStatusForDomain,
  getStatusForVolume as _getStatusForVolume,
  Props as _Props,
} from './StatusIndicator';
export const getStatusForVolume = _getStatusForVolume;
export const getStatusForDomain = _getStatusForDomain;
export default StatusIndicator;
export interface Props extends _Props { };