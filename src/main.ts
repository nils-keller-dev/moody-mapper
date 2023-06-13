import App from "@/App.vue";
import "@/assets/main.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsLeftRightToLine,
  faEraser,
  faEye,
  faFileArrowUp,
  faInfinity,
  faLayerGroup,
  faSave,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createPinia } from "pinia";
import { createApp } from "vue";

library.add(
  faArrowsLeftRightToLine,
  faEraser,
  faEye,
  faFileArrowUp,
  faInfinity,
  faLayerGroup,
  faSave,
  faXmark
);

const pinia = createPinia();

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(pinia);
app.mount("#app");
