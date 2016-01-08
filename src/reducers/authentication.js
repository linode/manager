import { CALLBACK, SET_TOKEN } from '../actions/authentication';

const default_state = {
    token: null
};

export default function authentication(state = default_state, action) {
    switch (action.type) {
    case CALLBACK:
        return {
            ...state,
            username: action.query.username,
            email: action.query.email,
            exchange_code: action.query.code
        };
    case SET_TOKEN:
        let newState = {
            ...state,
            scopes: action.scopes,
            token: action.token
        };
        delete newState.exchange_code;
        return newState;
    default:
        return state;
    }
}
