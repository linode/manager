import FormControl, {
  FormControlProps as _FormControlProps
} from '@material-ui/core/FormControl';
import RenderGuard from 'src/components/RenderGuard';

/* tslint:disable-next-line:no-empty-interface */
export interface FormControlProps extends _FormControlProps {}

export default RenderGuard(FormControl);
