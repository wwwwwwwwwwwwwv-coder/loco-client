<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import {
  BankOutlined,
  CheckOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import countyJson from '@/assets/json/country.json'
import { registerApi, sendCodeApi } from '@/api'
import { passwordReg, passwordRules } from '@/utlis'
import Auth from '@/layouts/auth.vue'

const { t, locale } = useI18n()
const route = useRoute()

const formRef = ref<FormInstance>()
const captchaSeconds = ref(0)
let captchaTimer: number | undefined

// 注册步骤
const steps = ref(1)

const formState = reactive({
  country: undefined as string | undefined,
  userLoginEmail: '',
  verifyCode: '',
  legalEntityType: '',
  userPassword: '',
  confirmPassword: '',
  referralCode: '',
  agreement: false,
})

const features = computed(() => [
  { icon: 'Thunderbolt', text: t('featureFast') },
  { icon: 'SafetyCertificate', text: t('featureEncrypted') },
  { icon: 'User', text: t('featureClients') },
  { icon: 'Idcard', text: t('featureFunds') },
])

const compliance = computed(() => [t('amlMonitor'), t('accountVerify'), t('amlStandard')])

const accountTypes = computed(() => [
  {
    value: 'individual' as const,
    icon: UserOutlined,
    title: t('personalAccount'),
    tags: t('personalTags').split(','),
  },
  {
    value: 'company' as const,
    icon: BankOutlined,
    title: t('businessAccount'),
    tags: t('businessTags').split(','),
  },
])

const languageCode = computed(() => {
  return locale.value.split('-')[0]
})

const validateCode = async () => {
  if (formState.verifyCode.length !== 6) {
    return Promise.reject(t('codeRequired'))
  }

  return Promise.resolve()
}

const validatePwd = async (_rule: Rule, value: string) => {
  if (!passwordReg.test(value)) {
    return Promise.reject(t('passwordPattern'))
  }
  return Promise.resolve()
}

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject(t('confirmRequired'))
  }

  if (value !== formState.userPassword) {
    return Promise.reject(t('passwordMismatch'))
  }

  return Promise.resolve()
}

const validateAgreement = async (_rule: Rule, value: boolean) => {
  if (!value) {
    return Promise.reject(t('agreementRequired'))
  }

  return Promise.resolve()
}

const rules = computed<Record<string, Rule[]>>(() => ({
  country: [{ required: true, message: t('countryRegion'), trigger: 'change' }],
  userLoginEmail: [
    { required: true, message: t('emailRequired'), trigger: ['blur', 'change'] },
    { type: 'email', message: t('emailInvalid'), trigger: ['blur', 'change'] },
  ],
  verifyCode: [{ validator: validateCode, trigger: ['blur', 'change'] }],
  legalEntityType: [{ required: true, message: t('accountType'), trigger: 'change' }],
  userPassword: [
    { required: true, message: t('passwordRequired'), trigger: 'blur' },
    { validator: validatePwd, trigger: ['blur', 'change'] },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: ['blur', 'change'] }],
  referralCode: [
    { required: true, message: t('referralPlaceholder'), trigger: ['blur', 'change'] },
  ],
  agreement: [{ validator: validateAgreement, trigger: 'change' }],
}))

// 倒计时
const startCaptchaTimer = () => {
  console.log('startCaptchaTimer')
  captchaSeconds.value = 59
  window.clearInterval(captchaTimer)
  captchaTimer = window.setInterval(() => {
    captchaSeconds.value -= 1
    if (captchaSeconds.value <= 0) {
      window.clearInterval(captchaTimer)
    }
  }, 1000)
}

const sendCode = () => {
  formRef.value
    ?.validateFields('userLoginEmail')
    .then(async () => {
      const params = {
        email: formState.userLoginEmail,
        operateType: 'register',
        type: 'email',
      }
      await sendCodeApi(params)
      startCaptchaTimer()
      await message.success(t('codeSent'))
    })
    .catch((error) => {
      console.log('error', error)
    })
}

const submitRegister = async () => {
  const params = {
    userLoginEmail: formState.userLoginEmail,
    verifyCode: formState.verifyCode,
    country: formState.country,
    userPassword: passwordRules(formState.userPassword),
    confirmPassword: passwordRules(formState.confirmPassword),
    referralCode: formState.referralCode,
    legalEntityType: formState.legalEntityType,
    sourceFrom: 'H5',
  }
  await registerApi(params)
  steps.value = 2
}

onBeforeUnmount(() => {
  window.clearInterval(captchaTimer)
})

onMounted(() => {
  if (!!route.query.c) formState.referralCode = (route.query.c ?? '') as string
})
</script>

<template>
  <Auth>
    <!--    注册流程-->
    <div
      v-if="steps === 1"
      class="mx-auto grid w-[min(1000px,100%)] grid-cols-[minmax(420px,548px)_minmax(520px,692px)] overflow-hidden rounded-22px shadow-[0_24px_72px_rgba(15,23,42,0.18)] max-sm:block max-sm:w-full max-sm:overflow-visible max-sm:rounded-16px max-sm:shadow-none"
    >
      <section
        class="hidden px-24px py-34px text-white max-sm:block max-[390px]:min-h-388px max-[390px]:px-18px"
      >
        <div class="text-center">
          <p
            class="m-0 inline-flex h-58px items-center gap-9px rounded-full border border-white/28 bg-white/12 px-18px text-18px text-white/82 font-900"
          >
            <SafetyCertificateOutlined />
            {{ t('globalFinance') }}
          </p>
          <p class="m-0 mt-26px text-20px text-white/58">
            {{ t('hasAccount') }}
            <RouterLink to="/login" class="text-#5f83ff no-underline">
              {{ t('signIn') }}
            </RouterLink>
          </p>
          <h1 class="m-0 mt-28px text-40px text-white font-950">{{ t('registerTitle') }}</h1>
          <p class="mx-auto mb-0 mt-28px max-w-506px text-20px text-white/62">
            {{ t('brandIntro') }}
          </p>
        </div>
      </section>

      <aside
        class="flex flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,rgba(22,76,148,0.98),rgba(12,67,139,0.98))] p-40px text-white max-sm:hidden"
      >
        <div class="relative z-1">
          <div class="flex items-center gap-14px text-24px font-900">
            <span class="flex h-40px w-40px items-center rounded-8px bg-white p-4px">
              <img src="/logo.png" alt="LOCO PAY" class="w-auto" />
            </span>
            <span>LOCO PAY</span>
          </div>

          <h1 class="text-28px mt-48px">
            {{ t('globalFinance') }}
          </h1>
          <p class="mt-49px text-14px text-white/60">
            {{ t('brandIntro') }}
          </p>

          <ul class="mt-36px grid list-none gap-14px">
            <li
              v-for="item in features"
              :key="item.text"
              class="flex items-center gap-12px text-white/86"
            >
              <span
                class="w-28px h-28px bg-white/15 rounded-10px flex-inline items-center justify-center"
              >
                <img
                  :src="`/image/${item.icon}.png`"
                  :alt="item.icon"
                  style="width: 14px; height: 14px"
                />
              </span>
              <span class="text-14px">{{ item.text }}</span>
            </li>
          </ul>

          <div
            class="mt-100px rounded-14px border border-white/20 bg-white/10 p-20px backdrop-blur-8px max-[1100px]:mt-28px"
          >
            <h2 class="mb-14px flex items-center gap-8px text-14px">
              <img src="/image/SafetyCertificate.png" style="width: 15px; height: 15px" alt="" />
              {{ t('securityCompliance') }}
            </h2>
            <ul class="flex flex-col gap-8px">
              <li
                v-for="item in compliance"
                :key="item"
                class="flex items-center gap-10px text-12px text-white/70"
              >
                <CheckOutlined style="color: #7bf1a8" /> {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="relative z-1">
          <div class="flex gap-12px items-center">
            <div class="text-12px text-white">
              <span
                class="mr--6px inline-grid h-28px w-28px place-items-center rounded-full border border-2px border-white/20 bg-#1D4ED8"
              >
                G
              </span>
              <span
                class="mr--6px inline-grid h-28px w-28px place-items-center rounded-full border border-2px border-white/20 bg-#2563EB"
              >
                M
              </span>
              <span
                class="mr--6px inline-grid h-28px w-28px place-items-center rounded-full border border-2px border-white/20 bg-#3B82F6"
              >
                F
              </span>
              <span
                class="mr--6px inline-grid h-28px w-28px place-items-center rounded-full border border-2px border-white/20 bg-#60A5FA"
              >
                R
              </span>
              <span
                class="inline-grid h-28px w-28px place-items-center rounded-full border border-2px border-white/20 bg-#93C5FD"
              >
                J
              </span>
            </div>
            <strong class="text-12px font-500"
              >{{ t('userTrustNumber') }}
              <span class="text-white/55">{{ t('userTrust') }}</span></strong
            >
          </div>
          <p class="mt-12px text-#facc15 tracking-3px text-12px">
            ★★★★★ <span class="text-white/55 tracking-0">{{ t('ratingText') }}</span>
          </p>
        </div>
      </aside>

      <section class="bg-white px-40px py-30px">
        <div class="mb-26px">
          <div class="flex justify-between items-center">
            <h2 class="text-28px text-#101828 font-bold max-sm:hidden">
              {{ t('registerTitle') }}
            </h2>

            <div class="text-14px text-#9aa0aa max-sm:hidden">
              {{ t('hasAccount') }}
              <RouterLink to="/login" class="text-#315cf6">
                {{ t('signIn') }}
              </RouterLink>
            </div>
          </div>
          <p class="mt-16px text-#9aa0aa">
            {{ t('registerSubtitle') }}
          </p>
        </div>

        <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          layout="vertical"
          size="large"
          @finish="submitRegister"
        >
          <a-form-item name="country">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('countryRegion') }}
              </label>
            </div>
            <a-select
              v-model:value="formState.country"
              :placeholder="t('countryRegion')"
              showSearch
            >
              <a-select-option v-for="item in countyJson" :key="item.iso2" :value="item.iso2">
                <div class="flex items-center gap-9px">
                  <img
                    :src="item.icon"
                    style="width: 20px; height: 20px; border-radius: 20px"
                    :alt="item.name"
                  />
                  {{ locale === 'zh-CN' ? item.chineseName : item.name }}
                </div>
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item name="userLoginEmail">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('email') }}
              </label>
            </div>
            <a-input
              v-model:value="formState.userLoginEmail"
              :placeholder="t('emailPlaceholder')"
              autocomplete="email"
              size="large"
              class="design-control"
            >
              <template #suffix>
                <a-button
                  type="link"
                  size="small"
                  @click="sendCode"
                  :disabled="captchaSeconds > 0"
                  >{{
                    captchaSeconds > 0 ? `${t('getCode')}(${captchaSeconds})` : t('getCode')
                  }}</a-button
                >
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="verifyCode">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('code') }}
              </label>
            </div>
            <app-verify_code v-model="formState.verifyCode" />
          </a-form-item>

          <a-form-item name="legalEntityType">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('accountType') }}
              </label>
            </div>
            <a-radio-group
              v-model:value="formState.legalEntityType"
              class="grid w-full grid-cols-2 gap-14px max-sm:gap-18px max-[390px]:gap-10px"
            >
              <label
                v-for="item in accountTypes"
                :key="item.value"
                :class="[
                  'account-card flex min-h-96px cursor-pointer items-center gap-16px rounded-10px border border-#eceff4 bg-white transition max-sm:min-h-84px max-sm:justify-center max-sm:gap-16px max-sm:rounded-11px',
                  { active: formState.legalEntityType === item.value },
                ]"
              >
                <a-radio :value="item.value" class="sr-only" />
                <component
                  :is="item.icon"
                  class="account-icon text-22px text-#a6a9b0 max-sm:text-25px"
                />
                <span class="grid gap-10px max-sm:block">
                  <strong>
                    {{ item.title }}
                  </strong>
                  <span class="flex flex-wrap gap-10px max-sm:hidden">
                    <em
                      v-for="tag in item.tags"
                      :key="tag"
                      class="rounded-full bg-#1D2023/5 px-6px py-2px text-9px text-#1D2023/65 not-italic"
                    >
                      {{ tag }}
                    </em>
                  </span>
                </span>
              </label>
            </a-radio-group>
          </a-form-item>

          <a-form-item name="userPassword">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('password') }}
              </label>
            </div>
            <a-input-password
              v-model:value="formState.userPassword"
              :placeholder="t('passwordPlaceholder')"
              autocomplete="new-password"
              size="large"
              class="design-control"
            />
          </a-form-item>

          <a-form-item name="confirmPassword">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('confirmPassword') }}
              </label>
            </div>
            <a-input-password
              v-model:value="formState.confirmPassword"
              :placeholder="t('confirmPasswordPlaceholder')"
              autocomplete="new-password"
              size="large"
              class="design-control"
            />
          </a-form-item>

          <a-form-item name="referralCode">
            <div class="mb-6px">
              <label class="text-15px! text-#1D2023/65">
                {{ t('referralCode') }}
              </label>
            </div>
            <a-input
              v-model:value.trim="formState.referralCode"
              :placeholder="t('referralPlaceholder')"
              :disabled="!!route.query.c"
            />
          </a-form-item>

          <a-form-item name="agreement" class="agreement-item mt-18px max-sm:mt-34px">
            <a-checkbox v-model:checked="formState.agreement">
              {{ t('agreementPrefix') }}
              <a
                target="_blank"
                class="text-#375FF1"
                :href="`https://assets.gat-pay.com/images/gat-pay/agreement/用户使用条款-${languageCode}.pdf`"
                >《{{ t('userAgreement') }}》</a
              >、<a
                target="_blank"
                class="text-#375FF1"
                :href="`https://assets.gat-pay.com/images/gat-pay/agreement/用户隐私协议-${languageCode}.pdf`"
                >《{{ t('privacyPolicy') }}》</a
              >{{ t('agreementAnd')
              }}<a
                target="_blank"
                class="text-#375FF1"
                :href="`https://assets.gat-pay.com/images/gat-pay/agreement/AML协议-${languageCode}.pdf`"
                >《{{ t('riskDisclosure') }}》</a
              >
            </a-checkbox>
          </a-form-item>

          <a-button block size="large" type="primary" html-type="submit">
            {{ t('submitRegister') }}
            <span class="ml-8px">→</span>
          </a-button>
        </a-form>

        <p class="mt-16px flex justify-center gap-8px text-#1D2023/35">
          <SafetyCertificateOutlined />
          {{ t('infoProtected') }}
        </p>
      </section>
    </div>

    <!--      注册成功-->
    <div
      v-else
      class="w-440px max-sm:w-full mx-auto bg-white rounded-24px p-30px flex flex-col items-center shadow-lg"
    >
      <img src="@/assets/image/duanpai.png" style="width: 120px; height: 120px" alt="" />
      <h2 class="text-24px font-600 mt-20px">{{ t('registerSuccessTitle') }}</h2>
      <p class="text-15px mt-6px">{{ t('registerSuccessDesc') }}</p>
      <p class="text-#1D2023/45 mt-21px">{{ t('scanDownloadApp') }}</p>
      <a-qrcode value="https://www.gat-pay.com/gat-pay.apk" :size="200" />
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
          href="https://www.gat-pay.com/gat-pay.apk"
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
  </Auth>
</template>

<style scoped lang="less">
.account-card {
  padding: 18px 16px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &.active {
    border-color: #375ff1;
    background: rgba(55, 95, 241, 0.1);
  }

  .account-icon {
    color: #a6a9b0;
    font-size: 22px;
  }

  &.active .account-icon {
    color: #315cf6;
  }
}
</style>
