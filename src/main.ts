import App from "@/App.vue";
import "@/assets/main.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsLeftRightToLine,
  faEraser,
  faEye,
  faFileArrowUp,
  faFileLines,
  faImages,
  faInfinity,
  faLayerGroup,
  faSave,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createPinia } from "pinia";
import { createApp } from "vue";

library.add(
  faFileLines,
  faImages,
  faInfinity,
  faSave,
  faEraser,
  faArrowsLeftRightToLine,
  faEye,
  faFileArrowUp,
  faXmark,
  faLayerGroup
);

const pinia = createPinia();

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(pinia);
app.mount("#app");
