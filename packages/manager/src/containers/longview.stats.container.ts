import { path, pathOr } from 'ramda';
import { connect } from 'react-redux';
import {
  LongviewNotification,
  LongviewResponse,
} from 'src/features/Longview/request.types';
import { ApplicationState } from 'src/store';
import { getClientStats } from 'src/store/longviewStats/longviewStats.requests';
import { ThunkDispatch } from 'src/store/types';

export interface LVClientData {
  longviewClientData: LongviewResponse['DATA'];
  longviewClientDataLoading: boolean;
  longviewClientDataError?: LongviewNotification[];
  longviewClientLastUpdated?: number;
}

export interface DispatchProps {
  getClientStats: (
    api_key: string,
    lastUpdated?: number
  ) => Promise<LongviewResponse['DATA']>;
}

export type Props = DispatchProps & LVClientData;

/**
 *
 * @param supplyClientID callback function that should return the Longview Client
 * ID for the stats you'd like to work with
 *
 * @example
 *
 * import withLongviewStats, { Props as LVDataProps }
 *
 * interface Props {
 *  clientID: number;
 *  apiKey: string;
 * }
 *
 * type CombinedProps = Props & LVDataProps;
 *
 * const MyComponent: React.FC<CombinedProps> = props => {
 *   React.useEffect(() => {
 *       props.getClientStats(props.apiKey)
 *   }, [])
 *
 *   return (
 *      <div>hello world</div>
 *   )
 * }
 *
 * export default withLongviewStats<Props>((ownProps) => ownProps.clientID)(MyComponent)
 */
const connected = <OwnProps extends {}>(
  supplyClientID: (ownProps: OwnProps) => number
) =>
  connect<LVClientData, DispatchProps, OwnProps, ApplicationState>(
    (state, ownProps) => {
      const { longviewStats } = state;

      const foundClient = longviewStats[supplyClientID(ownProps)];

      return {
        longviewClientData: pathOr({}, ['data'], foundClient),
        longviewClientDataLoading: pathOr(true, ['loading'], foundClient),
        longviewClientDataError: path(['error'], foundClient),
        longviewClientLastUpdated: path(['lastUpdated'], foundClient),
      };
    },
    (dispatch: ThunkDispatch, ownProps: OwnProps) => ({
      getClientStats: (api_key, lastUpdated) =>
        dispatch(
          getClientStats({
            clientID: supplyClientID(ownProps),
            api_key,
            lastUpdated,
          })
        ),
    })
  );

export default connected;
