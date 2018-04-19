export default {
  logIn({ commit }: any, user: any) {
    commit('setUser', user);
  }
}