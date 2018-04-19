type User = any;

type State = any;

export default {
  setUser(state: State, user: User) {
    state.user = user;
  },
  logout(state: State) {
    state.user = null;
  },
  setToken(state: State, token: string) {
    state.token = token;
  },
}