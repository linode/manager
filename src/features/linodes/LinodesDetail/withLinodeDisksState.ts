import { compose, lifecycle } from 'recompose';
import {
  withLinodeDiskActions,
  WithLinodeDiskActions
} from 'src/store/linodes/disk/disk.containers';

interface OutterProps {
  linodeId: number;
}

interface LinodeDisksState {
  disksLoading: boolean;
  disksError: Linode.ApiFieldError[];
  disksData: Linode.Disk[];
}

export default compose(
  withLinodeDiskActions,
  lifecycle<OutterProps & WithLinodeDiskActions, LinodeDisksState>({
    componentDidMount() {
      const {
        linodeId,
        linodeDiskActions: { getAllLinodeDisks }
      } = this.props;

      getAllLinodeDisks({ linodeId });
    },

    componentDidUpdate(prevProps) {
      const {
        linodeId,
        linodeDiskActions: { getAllLinodeDisks }
      } = this.props;
      const { linodeId: prevLinodeId } = this.props;

      if (linodeId === prevLinodeId) {
        return;
      }

      getAllLinodeDisks({ linodeId });
    }
  })
);
