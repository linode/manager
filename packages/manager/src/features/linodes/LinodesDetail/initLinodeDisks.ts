import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { GetAllLinodeConfigsRequest } from 'src/store/linodes/config/config.actions';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';

interface OuterProps {
  linodeId: number;
}

/**
 * Get the Linode's disks on mount and on linodeId change.
 */

export default compose(
  connect(
    undefined,
    { getAllLinodeDisks }
  ),
  lifecycle<OuterProps & { getAllLinodeDisks: GetAllLinodeConfigsRequest }, {}>(
    {
      componentDidMount() {
        // tslint:disable-next-line:no-shadowed-variable
        const { linodeId, getAllLinodeDisks } = this.props;

        getAllLinodeDisks({ linodeId });
      },

      componentDidUpdate(prevProps) {
        // tslint:disable-next-line:no-shadowed-variable
        const { linodeId, getAllLinodeDisks } = this.props;
        const { linodeId: prevLinodeId } = this.props;

        if (linodeId === prevLinodeId) {
          return;
        }

        getAllLinodeDisks({ linodeId });
      }
    }
  )
);
