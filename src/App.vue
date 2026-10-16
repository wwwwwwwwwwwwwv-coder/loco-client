<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import jaJP from 'ant-design-vue/es/locale/ja_JP'
import koKR from 'ant-design-vue/es/locale/ko_KR'
import zhTW from 'ant-design-vue/es/locale/zh_TW'
import { useI18n } from 'vue-i18n'
import { type SupportedLocale } from './i18n'

const { locale } = useI18n()

const antLocales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-TW': zhTW,
}

const antLocale = computed(() => antLocales[locale.value as SupportedLocale])

const antTheme = {
  token: {
    controlHeightLG: 50,
  },
}
</script>

<template>
  <a-config-provider :locale="antLocale" :theme="antTheme">
    <router-view />
  </a-config-provider>
</template>
