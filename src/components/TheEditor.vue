<template>
  <div class="text-white">
    <input
      value="filename"
      ref="fileName"
      class="mb-2.5 bg-[#fff1] rounded b-0"
    />
    <label>.png</label>
    <div class="relative">
      <canvas
        class="w-full absolute"
        ref="grid"
        @contextmenu.prevent
        @mousedown="onPixelClick"
        @mouseout="onMouseOut"
        @mousemove="onPointerMove($event.clientX, $event.clientY)"
        @touchstart.prevent="onPixelClick($event.touches[0])"
        @touchmove="
          onPointerMove($event.touches[0].clientX, $event.touches[0].clientY)
        "
      />
      <canvas class="w-full" ref="pixels" />
      <canvas class="hidden" ref="imageData" />
    </div>
    <div class="h-8" ref="coordinates" />
    <div class="flex gap-2.5 float-left">
      <BaseButton
        tooltip="W̲ipe canvas"
        icon="fa-eraser"
        @click="wipePixelCanvas"
      />
      <BaseButton
        tooltip="M̲irror from left to right"
        icon="fa-arrows-left-right-to-line"
        @click="mirror"
      />
      <BaseButton tooltip="P̲review" icon="fa-eye" @click="preview" />
    </div>
    <div class="flex gap-2.5 float-right">
      <BaseButton @click="layer" tooltip="Switch L̲ayer" icon="fa-layer-group" />
      <BaseButton
        tooltip="Upload (Control+U)"
        icon="fa-file-arrow-up"
        @click="uploadInput?.click()"
      />
      <input
        class="hidden"
        ref="uploadInput"
        type="file"
        @change="upload"
        accept="image/png, image/jpeg"
      />
      <BaseButton @click="save" tooltip="Save (Control+S)" icon="fa-save" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEditorStore } from "@/stores/editor";
import { useFilesStore } from "@/stores/files";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import BaseButton from "./BaseButton.vue";

const { face } = storeToRefs(useEditorStore());

type PixelData = Array<Array<number>>;

const PIXEL_SIZE = 25;
const IMAGE_WIDTH = 32;
const IMAGE_HEIGHT = 16;

const CANVAS_WIDTH = IMAGE_WIDTH * PIXEL_SIZE;
const CANVAS_HEIGHT = IMAGE_HEIGHT * PIXEL_SIZE;

const dataHistory = ref<Array<PixelData>>([]);
const currentHistoryIndex = ref(0);
const isButtonDown = ref(false);
const holdValue = ref(1);
const holdData = ref<PixelData>([]);
const previousPointerPosition = ref({ x: 0, y: 0 });

const pixels = ref<HTMLCanvasElement | null>(null);
const grid = ref<HTMLCanvasElement | null>(null);
const imageData = ref<HTMLCanvasElement | null>(null);
const uploadInput = ref<HTMLInputElement | null>(null);
const fileName = ref<HTMLInputElement | null>(null);
const coordinates = ref<HTMLDivElement | null>(null);

const pixelsCtx = ref<CanvasRenderingContext2D | null>();
const gridCtx = ref<CanvasRenderingContext2D | null>();
const imageDataCtx = ref<CanvasRenderingContext2D | null>();

const faces = computed(() => useFilesStore().faces[face.value]);
const currentLayer = ref(0);

onMounted(() => {
  if (!pixels.value || !grid.value || !imageData.value || !fileName.value)
    return;

  pixelsCtx.value = pixels.value.getContext("2d");
  gridCtx.value = grid.value.getContext("2d");
  imageDataCtx.value = imageData.value.getContext("2d");

  pixels.value.width = grid.value.width = CANVAS_WIDTH;
  pixels.value.height = grid.value.height = CANVAS_HEIGHT;
  imageData.value.width = IMAGE_WIDTH;
  imageData.value.height = IMAGE_HEIGHT;

  fileName.value.value = face.value;

  wipePixelCanvas();
  drawGrid();
  layer();
});

const loadImage = async (file: File) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    convertImgToData(img);
    fillCanvasFromData();
  };
};

// HISTORY
const currentData = computed(
  () => dataHistory.value[currentHistoryIndex.value]
);

const addHistory = (data: PixelData) => {
  dataHistory.value = dataHistory.value.slice(0, currentHistoryIndex.value + 1);
  currentHistoryIndex.value = dataHistory.value.push(data) - 1;
};

const historyPrevious = () => {
  if (currentHistoryIndex.value > 0) {
    currentHistoryIndex.value--;
    fillCanvasFromData();
  }
};

const historyNext = () => {
  if (currentHistoryIndex.value < dataHistory.value.length - 1) {
    currentHistoryIndex.value++;
    fillCanvasFromData();
  }
};
// HISTORY END

const onMouseOut = () => {
  if (!coordinates.value) return;
  coordinates.value.innerHTML = "";
};

const drawGrid = () => {
  if (!gridCtx.value) return;

  gridCtx.value.beginPath();
  gridCtx.value.strokeStyle = "#eee";
  currentData.value.forEach((column, x) => {
    column.forEach((_, y) => {
      gridCtx.value?.rect(
        x * PIXEL_SIZE,
        y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    });
  });
  gridCtx.value.stroke();

  gridCtx.value.beginPath();
  gridCtx.value.strokeStyle = "#bbb";

  const halfWidth = CANVAS_WIDTH / 2;
  gridCtx.value.moveTo(halfWidth, 0);
  gridCtx.value.lineTo(halfWidth, gridCtx.value.canvas.height);

  const halfHeight = CANVAS_HEIGHT / 2;
  gridCtx.value.moveTo(0, halfHeight);
  gridCtx.value.lineTo(gridCtx.value.canvas.width, halfHeight);

  gridCtx.value.stroke();
};

const getEmptyData = () => {
  return Array.from({ length: IMAGE_WIDTH }, () =>
    Array.from({ length: IMAGE_HEIGHT }, () => 0)
  );
};

const wipePixelCanvas = () => {
  if (!pixelsCtx.value) return;

  const data = getEmptyData();

  wipeCanvas(pixelsCtx.value, CANVAS_WIDTH, CANVAS_HEIGHT);
  addHistory(data);

  holdData.value = JSON.parse(JSON.stringify(currentData.value));
};

const mirror = () => {
  const data = JSON.parse(JSON.stringify(currentData.value));
  data.slice(0, data.length / 2).forEach((_, index: number) => {
    data[data.length - index - 1] = [...data[index]];
  });

  addHistory(data);
  fillCanvasFromData();
};

const preview = () => {
  if (!grid.value || !pixels.value) return;

  grid.value.classList.toggle("hidden");
  pixels.value.classList.toggle("invert");
};

const save = () => {
  if (!imageData.value) return;
  fillCanvasFromData(imageDataCtx.value, 1);

  imageData.value.toBlob(async (blob) => {
    // @ts-ignore
    const writable = await faces.value[currentLayer.value].createWritable();
    writable.write(blob);
    writable.close();
  });
};

const upload = () => {
  if (!uploadInput.value || !fileName.value) return;
  if (uploadInput.value.files?.length === 1) {
    const file = uploadInput.value.files[0];
    fileName.value.value = file.name.substring(0, file.name.lastIndexOf("."));
    loadImage(file);
  }
  uploadInput.value.value = "";
};

const layer = async () => {
  currentLayer.value = (currentLayer.value + 1) % faces.value.length;
  loadImage(await faces.value[currentLayer.value].getFile());
};

const convertImgToData = (img: HTMLImageElement) => {
  if (!imageDataCtx.value) return;

  imageDataCtx.value.drawImage(img, 0, 0);

  const data = getEmptyData();

  data.forEach((column, x) => {
    column.forEach((_, y) => {
      const redData = imageDataCtx.value?.getImageData(x, y, 1, 1).data[0];
      data[x][y] = Number(redData) < 255 ? 1 : 0;
    });
  });
  addHistory(data);

  wipeCanvas(imageDataCtx.value, IMAGE_WIDTH, IMAGE_HEIGHT);
};

const wipeCanvas = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  context.fillStyle = "white";
  context.rect(0, 0, width, height);
  context.fill();
};

const fillCanvasFromData = (
  context = pixelsCtx.value,
  pixelSize = PIXEL_SIZE
) => {
  const data = currentData.value;
  data.forEach((column, x) => {
    column.forEach((_, y) => {
      fillPixel(x, y, data[x][y], false, context, pixelSize);
    });
  });
};

const fillPixel = (
  x: number,
  y: number,
  value: number,
  writeToHistory = false,
  context = pixelsCtx.value,
  pixelSize = PIXEL_SIZE
) => {
  if (!context) return;

  if (writeToHistory) {
    const data = JSON.parse(JSON.stringify(currentData.value));
    data[x][y] = value;
    addHistory(data);
  } else {
    holdData.value[x][y] = value;
  }
  context.fillStyle = value ? "black" : "white";
  context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
};

const onPixelClick = (event: MouseEvent | Touch) => {
  const rect = pixels.value?.getBoundingClientRect();
  if (!rect) return;

  const x = getPixelValueForPosition(event.clientX - rect.left);
  const y = getPixelValueForPosition(event.clientY - rect.top);

  previousPointerPosition.value = { x, y };

  const pixelData = Math.abs(currentData.value[x][y] - 1);
  fillPixel(x, y, pixelData, true);
  holdValue.value = pixelData;
};

const setCoordinatesDisplay = (x: number, y: number) => {
  if (!coordinates.value) return;
  coordinates.value.innerHTML = `${x}, ${y}`;
};

const getPixelValueForPosition = (x: number) => {
  return (
    Math.ceil(
      x / PIXEL_SIZE / ((pixels.value?.offsetWidth || NaN) / CANVAS_WIDTH)
    ) - 1
  );
};

//Bresenham's line algorithm
const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
  const deltaX = Math.abs(x1 - x0);
  const deltaY = Math.abs(y1 - y0);
  const slopeX = x0 < x1 ? 1 : -1;
  const slopeY = y0 < y1 ? 1 : -1;
  let err = deltaX - deltaY;

  while (x0 !== x1 || y0 !== y1) {
    fillPixel(x0, y0, holdValue.value, false);

    const err2 = err * 2;
    if (err2 > -deltaY) {
      err -= deltaY;
      x0 += slopeX;
    }
    if (err2 < deltaX) {
      err += deltaX;
      y0 += slopeY;
    }
  }
};

const onPointerMove = (xPos: number, yPos: number) => {
  const rect = pixels.value?.getBoundingClientRect();
  if (!rect) return;

  const x = getPixelValueForPosition(xPos - rect.left);
  const y = getPixelValueForPosition(yPos - rect.top);
  if (x >= IMAGE_WIDTH || y >= IMAGE_HEIGHT || x < 0 || y < 0) return;

  setCoordinatesDisplay(x, y);
  if (isButtonDown.value && currentData.value[x][y] !== holdValue.value) {
    drawLine(
      x,
      y,
      previousPointerPosition.value.x,
      previousPointerPosition.value.y
    );
    previousPointerPosition.value = { x, y };
  }
};

document.onmousedown = document.ontouchstart = () => {
  isButtonDown.value = true;
  holdData.value = JSON.parse(JSON.stringify(currentData.value));
};

document.onmouseup = document.ontouchend = () => {
  isButtonDown.value = false;
  if (JSON.stringify(holdData) !== JSON.stringify(currentData.value)) {
    currentHistoryIndex.value = Math.max(0, currentHistoryIndex.value - 1);
    addHistory(JSON.parse(JSON.stringify(holdData.value)));
  }
};

// KEY PRESSES
document.onkeydown = (e) => {
  // if (e.target?.matches("input")) {
  //   return;
  // }

  if (e.metaKey || e.ctrlKey) {
    if (e.key.toLowerCase() === "z") {
      if (e.shiftKey) {
        historyNext();
      } else {
        historyPrevious();
      }
    } else if (e.key === "y") {
      historyNext();
    } else if (e.key === "s") {
      save();
    } else if (e.key === "u") {
      uploadInput.value?.click();
    }
  } else {
    if (e.key === "p") {
      preview();
    } else if (e.key === "m") {
      mirror();
    } else if (e.key === "w") {
      wipePixelCanvas();
    }
  }
};
</script>
