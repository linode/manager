import { compose } from 'recompose';
// import initLinode from './initLinode';
import initLinodeConfigs from './initLinodeConfigs';
import initLinodeDisks from './initLinodeDisks';
import maybeRenderError from './maybeRenderError';
import maybeRenderLoading from './maybeRenderLoading';
import maybeWithExtendedLinode from './maybeWithExtendedLinode';
import { ExtendedLinode } from './types';

interface OuterProps {
  linodeId: number;
}

export interface InnerProps {
  linode: ExtendedLinode;
}

export default compose<InnerProps, OuterProps>(
  // initLinode,
  initLinodeConfigs,
  initLinodeDisks,
  maybeRenderError,
  maybeRenderLoading,
  maybeWithExtendedLinode
);
