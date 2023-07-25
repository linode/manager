import FormControl, {
  FormControlProps as _FormControlProps,
} from '@mui/material/FormControl';

import RenderGuard from 'src/components/RenderGuard';

/* tslint:disable-next-line:no-empty-interface */
export type FormControlProps = _FormControlProps;

export default RenderGuard(FormControl);
