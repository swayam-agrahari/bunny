<template>
  <div className="main">
    <player />
  </div>
  <app-footer />
</template>

<script>
import Player from '@/components/Player.vue';
import AppFooter from "@/components/AppFooter.vue";

export default {
  name: 'HomeView',
  components: {
    Player,
    AppFooter
  }
}
</script>
<style>
.main {
  display: flex;
  height: calc(100% - 200px);
}
</style>
