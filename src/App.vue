<template>
  <div id="app">
    <v-header>
    </v-header>
    <tab>
    </tab>
    <keep-alive>
      <router-view>
      </router-view>
    </keep-alive>
    <player>
    </player>
  </div>
</template>

<script type="text/ecmascript-6">
import Tab from 'components/tab/tab'
import VHeader from 'components/header/header'
import Player from 'components/player/player'
export default {
  components: {
    Tab,
    VHeader,
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
