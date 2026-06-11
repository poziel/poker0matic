<script setup lang="ts">
  import { appVersion } from '@/utils/version'

  defineProps<{
    modelValue: boolean
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>

<template>
  <v-dialog
    max-width="440"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="ui-modal" flat>
      <div class="ui-modal-head">
        <h2>About</h2>
        <p>Refinimo — real-time collaborative planning poker.</p>
      </div>

      <div class="ui-modal-body">
        <p class="about-line about-version">Version v{{ appVersion }}</p>

        <p class="about-line">Thanks to the services and projects that help power Refinimo.</p>

        <ul class="about-credit-list">
          <li>
            <a href="https://www.dicebear.com/" rel="noopener noreferrer" target="_blank">DiceBear</a>
            for generated avatar styles and player identities.
          </li>

          <li>
            <a href="https://gravatar.com/" rel="noopener noreferrer" target="_blank">Gravatar</a>
            for globally recognized avatar images.
          </li>

          <li>
            <a href="https://www.magnific.com/author/anggara-putra" rel="noopener noreferrer" target="_blank">Anggara Putra</a>
            on Magnific for the playing-card suit artwork:

            <a href="https://www.magnific.com/icon/diamond_6446503" rel="noopener noreferrer" target="_blank">diamond</a>,
            <a href="https://www.magnific.com/icon/spade_6446523" rel="noopener noreferrer" target="_blank">spade</a>,
            <a href="https://www.magnific.com/icon/heart_6446511" rel="noopener noreferrer" target="_blank">heart</a>,
            and
            <a href="https://www.magnific.com/icon/spade_6446497" rel="noopener noreferrer" target="_blank">club</a>
            icons.
          </li>

          <li>
            <a href="https://github.com/infinitered/nsfwjs" rel="noopener noreferrer" target="_blank">NSFWJS</a>
            by Infinite Red, with

            <a href="https://www.tensorflow.org/js" rel="noopener noreferrer" target="_blank">TensorFlow.js</a>,
            for client-side custom avatar image checks.
          </li>

          <li>
            <a href="https://github.com/advanced-cropper/vue-advanced-cropper" rel="noopener noreferrer" target="_blank">Vue Advanced Cropper</a>
            for custom avatar image cropping.
          </li>

          <li>
            <a href="https://vuetifyjs.com/" rel="noopener noreferrer" target="_blank">Vuetify</a>
            and

            <a href="https://pictogrammers.com/library/mdi/" rel="noopener noreferrer" target="_blank">Material Design Icons</a>
            for the interface foundation.
          </li>

          <li>
            <a href="https://firebase.google.com/products/realtime-database" rel="noopener noreferrer" target="_blank">Firebase Realtime Database</a>
            for the live room synchronization layer.
          </li>
        </ul>
      </div>

      <div class="ui-modal-foot">
        <v-btn
          class="ui-btn ui-btn-primary"
          variant="flat"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
