import { UPDATE_SERVICES } from '~/actions/services';

const default_state = {
    services: [ ]
};

export default function services(state=default_state, action) {
    switch (action.type) {
    case UPDATE_SERVICES:
        return {
            ...state,
            services: [
                ...state.services,
                ...action.response.services
            ]
        };
    default:
        return state;
    }
}
