<template>
  <TheMapper ref="mapper" />
  <GenericModal v-model="isModalOpen">
    <TheEditor
      @unsavedChange="hasUnsavedChanges = $event"
      @save="onSaveEditor"
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
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import { isMobile } from "is-mobile";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { isOpen, face } = storeToRefs(useEditorStore());
const { elements } = storeToRefs(useDiagramStore());
const { faces } = storeToRefs(useFacesStore());

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

const onSaveEditor = () => {
  const el = elements.value.find(
    (element) => element.prop("name") === face.value
  );

  if (!el) return;

  el.prop("images", faces.value.find((f) => f.name === face.value)?.images);
};
</script>
