<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Auth from '@/layouts/auth.vue'
const basePath: BasePathType = import.meta.env.VITE_API_BASEPATH

const { t } = useI18n()
</script>

<template>
  <Auth>
    <section class="flex flex-col items-center justify-center w-full">
      <div
        class="w-440px max-sm:w-full mx-auto bg-white rounded-24px p-30px flex flex-col items-center shadow-lg"
      >
        <img src="@/assets/image/duanpai.png" style="width: 120px; height: 120px" alt="" />
        <h2 class="text-24px font-600 mt-20px">{{ t('downloadLoginTitle') }}</h2>
        <p class="text-15px mt-6px">
          {{ t('noAccount') }}
          <router-link class="text-#375FF1" to="/register">{{ t('registerNow') }}</router-link>
        </p>
        <p class="text-#1D2023/45 mt-21px">{{ t('scanDownloadApp') }}</p>
        <a-qrcode
          :value="
            basePath !== 'pro'
              ? 'http://13.250.66.194:9024/gat-pay-d.apk'
              : 'https://www.gat-pay.com/gat-pay.apk'
          "
          :size="200"
        />
        <p class="text-#1D2023/45 mt-12px">{{ t('scanQrWithPhone') }}</p>
        <div class="w-full flex justify-between gap-10px">
          <a
            class="border-1 border-#1D2023/5 rounded-14px flex-1 flex justify-center items-center gap-10px py-7px"
            href="https://apps.apple.com/us/app/gat-pay/id6751884093"
            target="_blank"
          >
            <img src="@/assets/image/apple-fill@2x.png" style="width: 24px; height: 24px" alt="" />
            <div class="flex flex-col gap-4px">
              <span class="text-#1D2023/45 text-10px">{{ t('downloadFromAppStore') }}</span>
              <strong class="text-12px">App Store</strong>
            </div>
          </a>
          <a
            class="border-1 border-#1D2023/5 rounded-14px flex-1 flex justify-center items-center gap-10px py-7px"
            href="https://play.google.com/store/apps/details?id=com.gatbank.gatpay"
            target="_blank"
          >
            <img src="@/assets/image/android_gp@2x.png" style="width: 24px; height: 24px" alt="" />
            <div class="flex flex-col gap-4px">
              <span class="text-#1D2023/45 text-10px">{{ t('downloadFromGooglePlay') }}</span>
              <strong class="text-12px">Google Play</strong>
            </div>
          </a>
        </div>
        <div class="mt-20px w-full">
          <a
            :href="
              basePath !== 'pro'
                ? 'http://13.250.66.194:9024/gat-pay-d.apk'
                : 'https://www.gat-pay.com/gat-pay.apk'
            "
            target="_blank"
            class="rounded-8px bg-#375FF1 w-full flex justify-between items-center px-24px py-12px text-white"
          >
            <div class="flex justify-center items-center gap-10px">
              <img
                src="@/assets/image/androidFilled@2x.png"
                style="width: 24px; height: 24px"
                alt=""
              />
              <div class="flex flex-col gap-1px">
                <span class="text-10px">{{ t('androidDirectDownload') }}</span>
                <strong class="text-12px font-500">{{ t('downloadApkFile') }}</strong>
              </div>
            </div>
            <img src="@/assets/image/download@2x.png" style="width: 16px; height: 16px" alt="" />
          </a>
        </div>
      </div>
      <div class="text-white mt-24px flex justify-center items-center gap-20px op-80">
        <div class="flex items-center justify-center gap-6px">
          <img src="/image/SafetyCertificate.png" style="width: 13px" alt="" />
          <span class="text-12px">{{ t('bankLevelSecurity') }}</span>
        </div>
        <div class="flex items-center justify-center gap-6px">
          <img src="/image/suo.png" style="width: 13px" alt="" />
          <span class="text-12px">{{ t('licensedCompliance') }}</span>
        </div>
        <div class="flex items-center justify-center gap-6px">
          <img src="/image/duihao.png" style="width: 13px" alt="" />
          <span class="text-12px">{{ t('protectedFunds') }}</span>
        </div>
      </div>
    </section>
  </Auth>
</template>
