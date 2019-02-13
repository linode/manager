import { compose, lifecycle } from 'recompose';
import {
  withLinodeConfigActions,
  WithLinodeConfigActions
} from 'src/store/linodes/config/config.containers';

interface OutterProps {
  linodeId: number;
}

interface LinodeConfigsState {
  configsLoading: boolean;
  configsError: Linode.ApiFieldError[];
  configsData: Linode.Config[];
}

export default compose(
  withLinodeConfigActions,
  lifecycle<OutterProps & WithLinodeConfigActions, LinodeConfigsState>({
    componentDidMount() {
      const {
        linodeId,
        linodeConfigActions: { getAllLinodeConfigs }
      } = this.props;
      getAllLinodeConfigs({ linodeId });
    },

    componentDidUpdate(prevProps) {
      const {
        linodeId: prevLinodeId,
        linodeConfigActions: { getAllLinodeConfigs }
      } = this.props;
      const { linodeId } = prevProps;

      if (linodeId === prevLinodeId) {
        return;
      }

      getAllLinodeConfigs({ linodeId });
    }
  })
);
