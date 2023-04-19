<template>
  <TheMapper ref="mapper" />
  <GenericModal v-model="isModalOpen">
    <TheEditor
      @unsavedChange="hasUnsavedChanges = $event"
      @save="mapper?.refreshNodes()"
    />
  </GenericModal>
  <GenericModal :modelValue="isMobile()" :isClosable="false">
    <p>The Moody Mapper is currently not supported on mobile devices.</p>
    <p>
      See
      <a href="https://github.com/tsomic/moody" target="_blank">
        the GitHub repository
      </a>
      for more information on how to use this tool.
    </p>
  </GenericModal>
</template>

<script setup lang="ts">
import GenericModal from "@/components/GenericModal.vue";
import TheEditor from "@/components/TheEditor.vue";
import TheMapper from "@/components/TheMapper.vue";
import { useEditorStore } from "@/stores/editor";
import { isMobile } from "is-mobile";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { isOpen } = storeToRefs(useEditorStore());
const hasUnsavedChanges = ref(false);

const mapper = ref<typeof TheMapper | null>(null);

const isModalOpen = computed({
  get() {
    return isOpen.value;
  },
  set(newValue) {
    if (!newValue && hasUnsavedChanges.value) {
      if (
        confirm("You have unsaved changes that will be lost. Proceed anyways?")
      ) {
        isOpen.value = false;
        hasUnsavedChanges.value = false;
      }
    } else {
      isOpen.value = false;
    }
  },
});
</script>
