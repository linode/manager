import { CALLBACK, SET_TOKEN } from '../actions/authentication';
import { getStorage, setStorage } from '~/storage';

const token = getStorage("authentication/oauth-token");

const default_state = { token };

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
        setStorage("authentication/oauth-token", action.token);
        return newState;
    default:
        return state;
    }
}
