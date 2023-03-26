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
      >
      </canvas>
      <canvas class="w-full" ref="pixels"></canvas>
      <canvas class="hidden" ref="imageData"></canvas>
    </div>
    <div class="h-8" ref="coordinates"></div>
    <div class="flex gap-2.5">
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
      <BaseButton tooltip="R̲esize" icon="fa-crop" @click="resize" />
      <!-- <button @click="alert('WIP')" title="Switch L̲ayer (WIP)">
      <span class="ti-layers"></span>
    </button> -->
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
      <!-- <button @click="download" title="Download (Control+S)">
      <span class="ti-download"></span>
    </button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import BaseButton from "./BaseButton.vue";

type PixelData = Array<Array<number>>;

const PIXEL_SIZE = 25;
const INITIAL_WIDTH = 32;
const INITIAL_HEIGHT = 16;

const currentWidth = ref(INITIAL_WIDTH);
const currentHeight = ref(INITIAL_HEIGHT);
const dataHistory = ref<Array<PixelData>>([]);
const currentDataIndex = ref(0);
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

const canvasWidth = computed(() => currentWidth.value * PIXEL_SIZE);
const canvasHeight = computed(() => currentHeight.value * PIXEL_SIZE);

onMounted(() => {
  setup();
});

const setup = () => {
  if (!pixels.value || !grid.value || !imageData.value) return;
  pixelsCtx.value = pixels.value.getContext("2d");
  gridCtx.value = grid.value.getContext("2d");
  imageDataCtx.value = imageData.value.getContext("2d");

  init();
};

// HISTORY
const currentData = computed(() => dataHistory.value[currentDataIndex.value]);

function addHistory(data: PixelData) {
  dataHistory.value = dataHistory.value.slice(0, currentDataIndex.value + 1);
  currentDataIndex.value = dataHistory.value.push(data) - 1;
}

function historyPrevious() {
  if (currentDataIndex.value > 0) {
    currentDataIndex.value--;
    fillCanvasFromData();
  }
}

function historyNext() {
  if (currentDataIndex.value < dataHistory.value.length - 1) {
    currentDataIndex.value++;
    fillCanvasFromData();
  }
}
// HISTORY END

const onMouseOut = () => {
  if (!coordinates.value) return;
  coordinates.value.innerHTML = "";
};

function init(width = INITIAL_WIDTH, height = INITIAL_HEIGHT) {
  if (!imageData.value || !pixels.value || !grid.value) return;
  currentWidth.value = imageData.value.width = width;
  currentHeight.value = imageData.value.height = height;

  pixels.value.width = grid.value.width = canvasWidth.value;
  pixels.value.height = grid.value.height = canvasHeight.value;

  wipePixelCanvas();
  drawGrid();
}

function drawGrid() {
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

  const halfWidth = canvasWidth.value / 2;
  gridCtx.value.moveTo(halfWidth, 0);
  gridCtx.value.lineTo(halfWidth, gridCtx.value.canvas.height);

  const halfHeight = canvasHeight.value / 2;
  gridCtx.value.moveTo(0, halfHeight);
  gridCtx.value.lineTo(gridCtx.value.canvas.width, halfHeight);

  gridCtx.value.stroke();
}

function getEmptyData() {
  return Array.from({ length: currentWidth.value }, () =>
    Array.from({ length: currentHeight.value }, () => 0)
  );
}

function wipePixelCanvas() {
  if (!pixelsCtx.value) return;

  const data = getEmptyData();

  wipeCanvas(pixelsCtx.value, canvasWidth.value, canvasHeight.value);
  addHistory(data);
}

function mirror() {
  const data = JSON.parse(JSON.stringify(currentData.value));
  data.slice(0, data.length / 2).forEach((_, index: number) => {
    data[data.length - index - 1] = [...data[index]];
  });

  addHistory(data);
  fillCanvasFromData();
}

function preview() {
  if (!grid.value || !pixels.value) return;

  grid.value.classList.toggle("hidden");
  pixels.value.classList.toggle("invert");
}

const resize = () => {
  const width = window.prompt(
    "input the desired width",
    currentWidth.value.toString()
  );

  if (width) {
    const height = window.prompt(
      "input the desired height",
      currentHeight.value.toString()
    );
    if (height) {
      init(Number(width), Number(height));
    }
  }
};

function download() {
  if (!imageData.value) return;
  fillCanvasFromData(imageDataCtx.value, 1);

  const anchor = document.createElement("a");
  anchor.href = imageData.value.toDataURL("image/png");
  anchor.download = fileName.value?.value || "";
  anchor.click();
}

function upload() {
  if (!uploadInput.value || !fileName.value) return;
  if (uploadInput.value.files?.length === 1) {
    const file = uploadInput.value.files[0];
    fileName.value.value = file.name.substring(0, file.name.lastIndexOf("."));
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      init(img.width, img.height);
      convertImgToData(img);
      fillCanvasFromData();
    };
  }
  uploadInput.value.value = "";
}

function convertImgToData(img: HTMLImageElement) {
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

  wipeCanvas(imageDataCtx.value, currentWidth.value, currentHeight.value);
}

function wipeCanvas(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.fillStyle = "white";
  context.rect(0, 0, width, height);
  context.fill();
}

function fillCanvasFromData(context = pixelsCtx.value, pixelSize = PIXEL_SIZE) {
  const data = currentData.value;
  data.forEach((column, x) => {
    column.forEach((_, y) => {
      fillPixel(x, y, data[x][y], false, context, pixelSize);
    });
  });
}

function fillPixel(
  x: number,
  y: number,
  value: number,
  writeToHistory = false,
  context = pixelsCtx.value,
  pixelSize = PIXEL_SIZE
) {
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
}

function onPixelClick(event: MouseEvent | Touch) {
  const rect = pixels.value?.getBoundingClientRect();
  if (!rect) return;

  const x = getPixelValueForPosition(event.clientX - rect.left);
  const y = getPixelValueForPosition(event.clientY - rect.top);

  previousPointerPosition.value = { x, y };

  const pixelData = Math.abs(currentData.value[x][y] - 1);
  fillPixel(x, y, pixelData, true);
  holdValue.value = pixelData;
}

function setCoordinatesDisplay(x: number, y: number) {
  if (!coordinates.value) return;
  coordinates.value.innerHTML = `${x}, ${y}`;
}

function getPixelValueForPosition(x: number) {
  return (
    Math.ceil(
      x / PIXEL_SIZE / ((pixels.value?.offsetWidth || NaN) / canvasWidth.value)
    ) - 1
  );
}

//Bresenham's line algorithm
function drawLine(x0: number, y0: number, x1: number, y1: number) {
  const deltaX = Math.abs(x1 - x0);
  const deltaY = Math.abs(y1 - y0);
  const slopeX = x0 < x1 ? 1 : -1;
  const slopeY = y0 < y1 ? 1 : -1;
  let err = deltaX - deltaY;

  while (x0 !== x1 || y0 !== y1) {
    fillPixel(x0, y0, holdValue, false);

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
}

function onPointerMove(xPos: number, yPos: number) {
  const rect = pixels.value?.getBoundingClientRect();
  if (!rect) return;

  const x = getPixelValueForPosition(xPos - rect.left);
  const y = getPixelValueForPosition(yPos - rect.top);
  if (x >= currentWidth.value || y >= currentHeight.value || x < 0 || y < 0)
    return;

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
}

document.onmousedown = document.ontouchstart = () => {
  isButtonDown.value = true;
  holdData.value = JSON.parse(JSON.stringify(currentData.value));
};

document.onmouseup = document.ontouchend = () => {
  isButtonDown.value = false;
  if (JSON.stringify(holdData) !== JSON.stringify(currentData.value)) {
    currentDataIndex.value = Math.max(0, currentDataIndex.value - 1);
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
      download();
    } else if (e.key === "u") {
      uploadInput.value?.click();
    }
  }

  if (e.key === "p") {
    preview();
  } else if (e.key === "m") {
    mirror();
  } else if (e.key === "r") {
    resize();
  } else if (e.key === "w") {
    wipePixelCanvas();
  }
};
</script>
