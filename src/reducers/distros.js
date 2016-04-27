import { UPDATE_DISTROS } from '../actions/distros';

const default_state = {
    distros: [ ]
};

export default function distros(state=default_state, action) {
    switch (action.type) {
    case UPDATE_DISTROS:
        return {
            ...state,
            distros: [
                ...state.distros,
                ...action.response.distributions
            ]
        };
    default:
        return state;
    }
}
