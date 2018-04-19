<template>
  <div class="container">
    <div class="row">
      <div class="col col-login mx-auto">
        <!--<div class="text-center mb-6">-->
        <!--<img src="~tabler-ui/dist/demo/brand/tabler.svg" class="h-6" alt="">-->
        <!--</div>-->
        <form class="card" action="/api/auth" method="post" @submit.prevent="login">
          <div class="card-alert alert alert-danger mb-0" v-if="error">
            {{error}}
          </div>
          <div class="card-body p-6">
            <div class="card-title">Login to your account</div>
            <div class="form-group">
              <label class="form-label">Email address</label>
              <input v-model="email" name="email" type="email" class="form-control" placeholder="Enter email">
            </div>
            <div class="form-group">
              <label class="form-label">
                Password
                <a href="./forgot-password.html" class="float-right small">I forgot password</a>
              </label>
              <input v-model="password" name="password" type="password" class="form-control" placeholder="Password">
            </div>
            <div class="form-group">
              <label class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input"/>
                <span class="custom-control-label">Remember me</span>
              </label>
            </div>
            <div class="form-footer">
              <button type="submit" class="btn btn-primary btn-block">Sign in</button>
            </div>
          </div>
        </form>
        <!--<div class="text-center text-muted">-->
        <!--Don't have account yet? <a href="./register.html">Sign up</a>-->
        <!--</div>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: null,
      }
    },
    methods: {
      login() {
        fetch("/api/auth", {
          method: "POST",
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          })
        })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          if (data.ok) {
            this.error = '';
            this.$store.dispatch('logIn', data.user);
            this.$store.commit('setToken', data.token);
            localStorage.setItem('token', data.token);
            this.$router.push('dashboard');

          } else {
            this.error = data.error || 'Unhandled authentication error';
          }
        })
        .catch((err) => {
          this.error = 'Failed to authenticate';
          console.log('fail to authenticate', err);
        });
      }
    }
  }
</script>