import { API_ROOT } from './constants';

export default function get(token, url) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", `${API_ROOT}${url}`);
  xhr.setRequestHeader("Authorization", `token ${token}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      var result = JSON.parse(xhr.responseText);
      resolve(result);
    };
    xhr.onerror = () => {
      reject(JSON.parse(xhr.responseText));
    };
    xhr.send();
  });
}
