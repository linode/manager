import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  clearErrors,
  setErrors
} from 'src/store/globalErrors/globalErrors.actions';
import { State } from 'src/store/globalErrors/types';
import { ThunkDispatch } from 'src/store/types';

interface DispatchProps {
  clearErrors: (params: State) => void;
  setErrors: (
    params: State
  ) => void;
}

export interface StateProps {
  globalErrors: State
}

/* tslint:disable-next-line */
export interface ReduxState extends State { }

export type Props = DispatchProps & StateProps

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps?: (ownProps: TOuter, errors: State) => TInner
) =>
  connect<StateProps | State, DispatchProps, TOuter, ApplicationState>(
    (state, ownProps) => {
      if (mapAccountToProps) {
        return mapAccountToProps(ownProps, state.globalErrors);
      }
      return {
        globalErrors: state.globalErrors
      };
    },
    (dispatch: ThunkDispatch) => ({
      clearErrors: (params) => dispatch(clearErrors(params)),
      setErrors: (params) => dispatch(setErrors(params))
    })
  );
