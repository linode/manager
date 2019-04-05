import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';
import { GetLinodeRequest } from 'src/store/linodes/linodes.actions';

interface OuterProps {
  linodeId: number;
}

/**
 * Get the Linode on mount and on linodeId change.
 */

export default compose<OuterProps, {}>(
  connect(
    undefined,
    { getLinode: _getLinode }
  ),
  lifecycle<OuterProps & { getLinode: GetLinodeRequest }, void>({
    componentDidMount() {
      const { linodeId, getLinode } = this.props;
      getLinode({ linodeId });
    },
    componentDidUpdate(prevProps) {
      const { linodeId: prevLinodeId } = prevProps;
      const { linodeId } = this.props;
      if (linodeId !== prevLinodeId) {
        _getLinode({ linodeId });
      }
    }
  })
);
