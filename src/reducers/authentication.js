import { CALLBACK, SET_TOKEN } from '../actions/authentication';

const default_state = {
    token: null
};

export default function authentication(state = default_state, action) {
    switch (action.type) {
    case SET_TOKEN:
        let newState = {
            ...state,
            scopes: action.scopes,
            username: action.username,
            email: action.email,
            token: action.token
        };
        return newState;
    default:
        return state;
    }
}
