<script setup>
import { Icon } from "@iconify/vue";

import { ref } from "vue";

const open = ref(true);
</script>

<template>
  <div class="flex flex-col p-2 border rounded-md">
    <div
      @click="open = !open"
      class="flex flex-row items-center gap-2 cursor-pointer"
      :class="{ 'border-b mb-1 pb-1': open }"
    >
      <Icon v-if="!open" icon="mdi:plus" />
      <Icon v-else icon="mdi:minus" />
      <slot name="header">header</slot>
    </div>
    <div v-show="open">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped></style>
