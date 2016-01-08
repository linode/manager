import { callback, set_token } from '../actions/authentication';
import { client_id, client_secret } from '../secrets';

export default function oauth_callback(store, nextState, replace) {
  store.dispatch(callback(nextState.location.query));
  const state = store.getState();

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "https://login.alpha.linode.com/oauth/token");
  let data = new FormData();
  data.append("client_id", client_id);
  data.append("client_secret", client_secret);
  data.append("code", state.authentication.exchange_code);
  xhr.onload = () => {
      let json = JSON.parse(xhr.response);
      store.dispatch(set_token(json.access_token, json.scopes));
  };
  xhr.send(data);

  replace({}, "/");
}
