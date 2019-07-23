import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { GetAllLinodeConfigsRequest } from 'src/store/linodes/config/config.actions';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';

interface OuterProps {
  linodeId: number;
}

/**
 * Get the Linode's configs on mount and on linodeId change.
 */

export default compose(
  connect(
    undefined,
    { getAllLinodeConfigs }
  ),
  lifecycle<
    OuterProps & { getAllLinodeConfigs: GetAllLinodeConfigsRequest },
    {}
  >({
    componentDidMount() {
      // tslint:disable-next-line:no-shadowed-variable
      const { linodeId, getAllLinodeConfigs } = this.props;
      getAllLinodeConfigs({ linodeId });
    },

    componentDidUpdate(prevProps) {
      // tslint:disable-next-line:no-shadowed-variable
      const { linodeId: prevLinodeId, getAllLinodeConfigs } = this.props;
      const { linodeId } = prevProps;

      if (linodeId === prevLinodeId) {
        return;
      }

      getAllLinodeConfigs({ linodeId });
    }
  })
);
