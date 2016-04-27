import { UPDATE_DATACENTERS } from '../actions/datacenters';

const default_state = {
    datacenters: [ ]
};

export default function datacenters(state=default_state, action) {
    switch (action.type) {
    case UPDATE_DATACENTERS:
        return {
            ...state,
            datacenters: [
                ...state.datacenters,
                ...action.response.datacenters
            ]
        };
    default:
        return state;
    }
}
