import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsLeftRightToLine,
  faCrop,
  faEraser,
  faEye,
  faFileArrowUp,
  faFileLines,
  faImages,
  faInfinity,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

library.add(
  faFileLines,
  faImages,
  faInfinity,
  faSave,
  faEraser,
  faArrowsLeftRightToLine,
  faEye,
  faCrop,
  faFileArrowUp
);

const pinia = createPinia();

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(pinia);
app.mount("#app");
