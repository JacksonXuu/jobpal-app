<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

onLaunch(() => {
  console.log('App Launch')
  const authStore = useAuthStore()
  authStore.init()
})
</script>

<style lang="scss">
@import '@/uni.scss';

html, body, uni-page, uni-page-body {
  height: 100%;
  margin: 0;
}

page {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  color: $text-primary;
  background-color: $bg-color;
}
</style>
