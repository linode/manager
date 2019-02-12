import { compose } from 'recompose';
import maybeRenderError from './maybeRenderError';
import maybeRenderLoading from './maybeRenderLoading';
import maybeWithExtendedLinode, {
  ExtendedLinode
} from './maybeWithExtendedLinode';
import withLinodeConfigsState from './withLinodeConfigsState';
import withLinodeDisksState from './withLinodeDisksState';

interface OutterProps {
  linodeId: number;
}

export interface InnerProps {
  linode: ExtendedLinode;
}

export default compose<InnerProps, OutterProps>(
  /** Go get the Linode's configs { configsData, configsError? configsLoading } */
  withLinodeConfigsState,

  /** Go get the Linode's disks { disksData, disksError? disksLoading } */
  withLinodeDisksState,

  /**
   * Collect possible errors from Redux, configs request, and disks requests.
   * If any are defined, render the ErrorComponent. (early return)
   */
  maybeRenderError,

  /**
   * Collect relevant loading states from Redux, configs request, and disks requests.
   *
   * If any are true, render the loading component. (early return)
   */
  maybeRenderLoading,

  /**
   * Retrieve the Linode any it's extended information from Redux.
   * If the Linode cannot be found, render the NotFound component. (early return)
   */
  maybeWithExtendedLinode
);
