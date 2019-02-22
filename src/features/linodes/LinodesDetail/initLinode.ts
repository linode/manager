import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { getLinode } from 'src/store/linodes/linode.requests';
import { GetLinodeRequest } from 'src/store/linodes/linodes.actions';

interface OutterProps {
  linodeId: number;
}

/**
 * Get the Linode on mount and on linodeId change.
 */

export default compose<OutterProps, {}>(
  connect(
    undefined,
    { getLinode }
  ),
  lifecycle<OutterProps & { getLinode: GetLinodeRequest }, void>({
    componentDidMount() {
      const { linodeId, getLinode } = this.props;
      getLinode({ linodeId });
    },
    componentDidUpdate(prevProps) {
      const { linodeId: prevLinodeId } = prevProps;
      const { linodeId } = this.props;
      if (linodeId !== prevLinodeId) {
        getLinode({ linodeId });
      }
    }
  })
);
