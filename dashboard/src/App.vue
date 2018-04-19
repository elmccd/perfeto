<template>
  <div id="app">
    <div class="page">
      <router-view/>

      <SiteFooter/>
    </div>
  </div>
</template>

<script>
  import SiteFooter from "./components/SiteFooter";

  export default {
    components: { SiteFooter },
  }
</script>

<style lang="scss">
  @import '~tabler-ui/dist/assets/css/dashboard.css';

  .page {
    min-height: 100vh;
  }
</style>
