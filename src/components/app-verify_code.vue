<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue?: string
    length?: number
    disabled?: boolean
    autofocus?: boolean
  }>(),
  {
    modelValue: '',
    length: 6,
    disabled: false,
    autofocus: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  complete: [value: string]
}>()

const normalizedValue = computed(() => props.modelValue.replace(/\D/g, '').slice(0, props.length))

const digits = computed(() => {
  const value = normalizedValue.value

  return Array.from({ length: props.length }, (_, index) => value[index] ?? '')
})

const isComplete = computed(() => normalizedValue.value.length === props.length)

const focusInput = (index: number) => {
  document.querySelector<HTMLInputElement>(`[data-verify-code-index="${index}"]`)?.focus()
}

const blurActiveInput = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

const getSafeIndex = (index: number) => Math.max(0, Math.min(index, props.length - 1))

const getNextFocusIndex = (value: string) => {
  if (value.length >= props.length) {
    return props.length - 1
  }

  return value.length
}

const updateValue = async (value: string) => {
  const nextValue = value.replace(/\D/g, '').slice(0, props.length)

  emit('update:modelValue', nextValue)
  emit('change', nextValue)

  if (nextValue.length === props.length) {
    emit('complete', nextValue)
  }

  await nextTick()

  if (nextValue.length === props.length) {
    blurActiveInput()
    return
  }

  focusInput(getNextFocusIndex(nextValue))
}

const replaceAt = (value: string, index: number, digit: string) => {
  const chars = value.split('')
  chars[getSafeIndex(index)] = digit

  return chars.join('')
}

const handleInput = async (index: number, value: string) => {
  if (props.disabled) {
    return
  }

  const inputDigits = value.replace(/\D/g, '')

  if (!inputDigits) {
    return
  }

  const currentValue = normalizedValue.value

  if (inputDigits.length > 1) {
    await updateValue(currentValue + inputDigits)
    return
  }

  const targetValue = isComplete.value
    ? replaceAt(currentValue, index, inputDigits)
    : currentValue + inputDigits

  await updateValue(targetValue)
}

const handleKeydown = async (index: number, event: KeyboardEvent) => {
  if (props.disabled) {
    return
  }

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    await handleInput(index, event.key)
    return
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    const nextValue = normalizedValue.value.slice(0, Math.max(0, normalizedValue.value.length - 1))
    await updateValue(nextValue)
    return
  }

  if (event.key === 'Delete') {
    event.preventDefault()
    await updateValue(replaceAt(normalizedValue.value, index, '').replace(/\D/g, ''))
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusInput(getSafeIndex(index - 1))
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusInput(getSafeIndex(index + 1))
  }
}

const handlePaste = async (event: ClipboardEvent) => {
  if (props.disabled) {
    return
  }

  const pastedDigits = event.clipboardData?.getData('text').replace(/\D/g, '') ?? ''

  if (!pastedDigits) {
    return
  }

  event.preventDefault()

  const nextValue =
    pastedDigits.length >= props.length ? pastedDigits : normalizedValue.value + pastedDigits

  await updateValue(nextValue)
}

onMounted(() => {
  if (props.modelValue !== normalizedValue.value) {
    emit('update:modelValue', normalizedValue.value)
  }

  if (props.autofocus) {
    focusInput(getNextFocusIndex(normalizedValue.value))
  }
})

watch(normalizedValue, (value) => {
  if (props.modelValue !== value) {
    emit('update:modelValue', value)
  }
})

defineExpose({
  focus: () => focusInput(getNextFocusIndex(normalizedValue.value)),
  clear: () => updateValue(''),
})
const getInputAriaLabel = (index: number) => `Verification code digit ${index + 1}`
</script>

<template>
  <a-form-item-rest>
    <div class="flex w-350px max-sm:w-full justify-between">
      <a-input
        v-for="(_, index) in digits"
        :id="`verify_code_${index}`"
        :key="index"
        :aria-label="getInputAriaLabel(index)"
        :autocomplete="`verify_code_${index}`"
        :data-verify-code-index="index"
        :disabled="disabled"
        :maxlength="1"
        :value="digits[index]"
        class="rounded-9px text-center text-20px font-900 w-50px h-50px"
        inputmode="numeric"
        @input="handleInput(index, ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste($event)"
      />
    </div>
  </a-form-item-rest>
</template>
