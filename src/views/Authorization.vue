<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import shieldImage from '@/assets/image/duanpai.png'
import { commonSendCodeApi, mallAuthApi } from '@/api'
import { passwordRules } from '@/utlis'
import { setAppLocale, supportedLocales } from '@/i18n'

defineOptions({ name: 'AuthorizationView' })

type LoginMode = 'password' | 'verifyCode'

const route = useRoute()
const { t } = useI18n()

watch(
  () => route.query.lang,
  (lang) => {
    if (typeof lang !== 'string') return

    const selectedLocale = supportedLocales.find((item) => item.code === lang)
    if (selectedLocale) setAppLocale(selectedLocale.code)
  },
  { immediate: true },
)

const formRef = ref<FormInstance>()
const mode = ref<LoginMode>('password')
const email = ref('')
const password = ref('')
const verificationCode = ref('')
const googleCode = ref('')
const authorizationSucceeded = ref(false)
const showSuccess = computed(
  () => authorizationSucceeded.value || (import.meta.env.DEV && route.query.preview === 'success'),
)
const secondsLeft = ref(3)
const codeSecondsLeft = ref(0)
const isSendingCode = ref(false)
let countdownTimer: number | undefined
let codeCountdownTimer: number | undefined

watch(
  showSuccess,
  (showSuccess) => {
    window.clearInterval(countdownTimer)
    if (!showSuccess) return

    secondsLeft.value = 3
    countdownTimer = window.setInterval(() => {
      secondsLeft.value = Math.max(0, secondsLeft.value - 1)
      if (secondsLeft.value === 0) {
        window.clearInterval(countdownTimer)
        gotoApp(false)
      }
    }, 1000)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.clearInterval(countdownTimer)
  window.clearInterval(codeCountdownTimer)
})

const rules = computed<Record<string, Rule[]>>(() => ({
  email: [
    { required: true, message: t('emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('emailInvalid'), trigger: ['blur', 'change'] },
  ],
  credential: [
    {
      required: true,
      message: mode.value === 'password' ? t('passwordRequired') : t('codeRequired'),
      trigger: 'blur',
    },
  ],
}))

const form = computed(() => ({
  email: email.value,
  credential: mode.value === 'password' ? password.value : verificationCode.value,
}))

function changeMode(nextMode: LoginMode) {
  mode.value = nextMode
  formRef.value?.clearValidate('credential')
}

const requestCode = async () => {
  if (isSendingCode.value || codeSecondsLeft.value > 0) return

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    void formRef.value?.validateFields('email').catch(() => undefined)
    return
  }

  const params = { email: form.value.email, type: 'email', operateType: 'login' }
  isSendingCode.value = true
  try {
    await commonSendCodeApi(params)
    codeSecondsLeft.value = 60
    window.clearInterval(codeCountdownTimer)
    codeCountdownTimer = window.setInterval(() => {
      codeSecondsLeft.value = Math.max(0, codeSecondsLeft.value - 1)
      if (codeSecondsLeft.value === 0) window.clearInterval(codeCountdownTimer)
    }, 1000)
    await message.success(t('codeSent'))
  } catch (error) {
    console.log(error)
  } finally {
    isSendingCode.value = false
  }
}

let authCode = ''
const submitAuthorization = async () => {
  const params = {
    loginName: form.value.email,
    type: mode.value,
    userPassword: passwordRules(form.value.credential),
    verifyCode: verificationCode.value,
    googleAuthCode: googleCode.value,
    agree: true,
    ...route.query,
  }
  const { data } = await mallAuthApi(params)
  authCode = data.authCode
  authorizationSucceeded.value = true
}

async function validateAndSubmit() {
  try {
    await formRef.value?.validate()
    await submitAuthorization()
  } catch {
    // Ant Design Vue displays the relevant field errors.
  }
}

function gotoApp(showWarning = true) {
  if (!authCode) {
    if (showWarning) message.warning(t('authorizationReturnFailed'))
    return
  }

  // mall: 7f3a9c2e-8b41-4d65-a0f2-6e9b1c5d8347 # 商城商户应用ID
  // securities: c2e8b741-5d93-4a6f-b108-9f3d7a2c6e54 #证券商户应用ID
  let link = `easyget://wallet/authorize?authCode=${encodeURIComponent(authCode)}`
  if (route.query.applicationId === 'c2e8b741-5d93-4a6f-b108-9f3d7a2c6e54') {
    link = `goldentour://wallet/authorize?authCode=${encodeURIComponent(authCode)}`
  }

  try {
    window.location.assign(link)
  } catch (error) {
    console.error('App goto failed', error)
    if (showWarning) message.warning(t('authorizationReturnFailed'))
  }
}

function handleReturnClick() {
  window.clearInterval(countdownTimer)
  secondsLeft.value = 0
  gotoApp()
}
</script>

<template>
  <main
    class="min-h-[100vh] mx-auto flex min-h-100dvh w-full max-w-520px flex-col bg-white text-#1d2023"
  >
    <template v-if="showSuccess">
      <section class="success-content flex flex-1 flex-col items-center text-center">
        <h1 class="text-26px font-600 leading-39px tracking-1px">
          {{ t('authorizationSuccess') }}
        </h1>
        <img :src="shieldImage" alt="" class="success-shield w-120px" />
      </section>
      <div class="bottom-area px-16px">
        <a-button type="primary" block class="primary-button" @click="handleReturnClick">
          {{
            secondsLeft > 0
              ? t('authorizationReturnCountdown', { seconds: secondsLeft })
              : t('authorizationReturn')
          }}
        </a-button>
      </div>
    </template>

    <template v-else>
      <section class="login-content flex-1 px-24px">
        <h1 class="page-title text-26px font-600 leading-36px">
          {{ t('authorizationTitle') }}
        </h1>

        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
          class="authorization-form"
          @finish="submitAuthorization"
        >
          <a-form-item name="email" class="form-row">
            <label for="authorization-email" class="field-label">{{ t('email') }}</label>
            <a-input
              id="authorization-email"
              v-model:value="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              :placeholder="t('authorizationEmailPlaceholder')"
              class="auth-input"
            >
              <template v-if="mode === 'verifyCode'" #suffix>
                <a-button
                  type="link"
                  class="code-button"
                  :loading="isSendingCode"
                  :disabled="codeSecondsLeft > 0"
                  @click="requestCode"
                >
                  {{ codeSecondsLeft > 0 ? `${codeSecondsLeft}${t('resendCode')}` : t('getCode') }}
                </a-button>
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="credential" class="form-row credential-row">
            <div
              class="mb-7px flex items-center gap-17px"
              role="tablist"
              :aria-label="t('authorizationLoginMode')"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="mode === 'password'"
                :class="['mode-tab', { active: mode === 'password' }]"
                @click="changeMode('password')"
              >
                {{ t('password') }}
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="mode === 'verifyCode'"
                :class="['mode-tab', { active: mode === 'verifyCode' }]"
                @click="changeMode('verifyCode')"
              >
                {{ t('code') }}
              </button>
            </div>
            <a-input-password
              v-if="mode === 'password'"
              v-model:value="password"
              autocomplete="current-password"
              :placeholder="t('authorizationInputPlaceholder')"
              class="auth-input"
            />
            <a-input
              v-else
              v-model:value="verificationCode"
              autocomplete="one-time-code"
              inputmode="numeric"
              :placeholder="t('authorizationInputPlaceholder')"
              class="auth-input"
            />
          </a-form-item>

          <a-form-item class="form-row google-row">
            <label for="authorization-google-code" class="field-label">
              {{ t('authorizationGoogleCode') }}
            </label>
            <a-input
              id="authorization-google-code"
              v-model:value="googleCode"
              :placeholder="t('authorizationGoogleOptional')"
              class="auth-input"
            />
          </a-form-item>
        </a-form>
      </section>

      <div class="bottom-area px-24px">
        <p class="consent-text mb-13px text-14px leading-23px text-#777">
          {{ t('authorizationConsent') }}
        </p>
        <a-button type="primary" block class="primary-button" @click="validateAndSubmit">
          {{ t('authorizationSubmit') }}
        </a-button>
      </div>
    </template>
  </main>
</template>

<style scoped lang="less">
@brand-blue: #2167ff;

.login-content {
  padding-top: clamp(76px, 17.8vh, 120px);

  .page-title {
    margin-bottom: 61px;
  }

  @media (max-height: 650px) {
    padding-top: 48px;

    .page-title {
      margin-bottom: 36px;
    }
  }
}

.authorization-form {
  :deep(.ant-form-item) {
    margin-bottom: 21px;
  }

  :deep(.ant-form-item-control-input) {
    min-height: 0;
  }

  .field-label,
  .mode-tab {
    display: inline-block;
    margin-bottom: 7px;
    color: #797b7d;
    font-size: 15px;
    line-height: 22px;
  }

  .mode-tab {
    margin-bottom: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #b9bbbd;

    &.active {
      color: @brand-blue;
    }
  }

  :deep(.auth-input) {
    height: 50px;
    border: 1px solid #eceef0;
    border-radius: 12px;
    box-shadow: none;
    font-size: 16px;
  }

  :deep(input.auth-input),
  :deep(.ant-input-affix-wrapper.auth-input) {
    padding: 0 12px;
  }

  :deep(.ant-input-affix-wrapper.auth-input input) {
    font-size: 16px;
  }

  :deep(.auth-input:focus),
  :deep(.auth-input:focus-within) {
    border-color: #d9dce0;
    box-shadow: none;
  }

  :deep(.ant-input-password-icon) {
    color: #9b9da0;
    font-size: 18px;
  }

  :deep(.code-button) {
    height: auto;
    padding: 0;
    color: @brand-blue;
    font-size: 15px;
  }

  :deep(.code-button:disabled) {
    color: #b9bbbd;
  }
}

.bottom-area {
  padding-bottom: max(48px, env(safe-area-inset-bottom));

  .primary-button {
    height: 50px;
    border-radius: 12px;
    background: @brand-blue;
    font-size: 16px;
    font-weight: 600;
    box-shadow: none;

    &:hover,
    &:focus {
      background: @brand-blue;
    }
  }

  @media (max-height: 650px) {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

.success-content {
  padding-top: clamp(90px, 17.7vh, 144px);

  .success-shield {
    margin-top: clamp(90px, 15.5vh, 128px);
  }
}
</style>
