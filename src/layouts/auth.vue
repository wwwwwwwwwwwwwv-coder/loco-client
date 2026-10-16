<script setup lang="ts">
import { computed } from 'vue'
import { DownOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { setAppLocale, supportedLocales, type SupportedLocale } from '@/i18n'

const { locale } = useI18n()

const currentLocaleLabel = computed(
  () => supportedLocales.find((item) => item.code === locale.value)?.label ?? 'English',
)

const setLocale = (code: SupportedLocale) => {
  setAppLocale(code)
}

const handleLocaleMenuClick: MenuProps['onClick'] = ({ key }) => {
  setLocale(key as SupportedLocale)
}
</script>

<template>
  <header
    class="app-header h-60px flex items-center justify-between border-b border-black/8 bg-white/96 px-22px max-sm:border-b-0 max-sm:bg-#154b93 max-sm:px-24px max-sm:border-b-1 max-sm:border-b-#132a66"
  >
    <RouterLink to="/" class="flex-inline items-center gap-14px">
      <span class="flex max-sm:h-40px max-sm:w-40px items-center rounded-8px bg-white p-4px">
        <img src="/logo.png" alt="LOCO PAY" class="h-40px max-sm:w-32px" />
      </span>
      <span class="hidden text-20px font-500 text-white tracking-0 max-sm:inline">LOCO PAY</span>
    </RouterLink>

    <a-dropdown trigger="click" placement="bottomRight">
      <button
        class="flex items-center gap-8px border-0 bg-transparent px-0 py-4px text-14px text-#30343b font-500 cursor-pointer max-sm:text-white"
        type="button"
      >
        <GlobalOutlined class="text-20px max-sm:text-24px" />

        <span class="max-sm:hidden">{{ currentLocaleLabel }}</span>
        <DownOutlined class="text-10px max-sm:hidden" />
      </button>

      <template #overlay>
        <a-menu :selected-keys="[locale]" @click="handleLocaleMenuClick">
          <a-menu-item v-for="item in supportedLocales" :key="item.code">
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </header>
  <main
    class="auth-box min-h-[calc(100vh-60px)] p-40px max-sm:p-10px flex items-center justify-center"
  >
    <slot></slot>
  </main>
</template>

<style lang="less" scoped>
@media (max-width: 639.9px) {
  .auth-box {
    background:
      linear-gradient(172deg, #003ea833 1%, #004fcc33 45%, #0060e833 98%),
      linear-gradient(0deg, rgba(2, 41, 97, 0.87), rgba(2, 41, 97, 0.87)), rgba(255, 255, 255, 0.1);
  }
}

@media (min-width: 640px) {
  .auth-box {
    background: url('@/assets/image/bg.jpg') no-repeat top center;
    background-size: cover;
  }
}
</style>
