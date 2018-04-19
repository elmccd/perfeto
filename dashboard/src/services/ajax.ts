import store from "../store";
import { getCookie } from "@/services/cookies";

export default new class {
  fetch(resource: string) {
    const token = store.state.token || localStorage.getItem('token');

    return fetch(`/api/${resource}`, {
      headers: {
        'x-access-token': token,
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log('Error getting data', err);
    })

  }
}