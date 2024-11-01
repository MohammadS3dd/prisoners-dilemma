<script setup>
import { computed, ref, useTemplateRef, watch } from "vue";
import { algorithmFuncs, calculateScores, getRandomItem } from "./algorithms";
const speed = ref(50);
const unknownSpoilerBlock = ref([true, true]);
const endScrollRef = useTemplateRef("endScrollRef");
const props = defineProps({
  run: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update"]);
const run = ref(props.run);
const canStart = computed(() => {
  if (!run.value.p1 && !run.value.p2) false;
  if (run.value.p1.type === "human" && run.value.p1.name.length === 0)
    return false;
  if (run.value.p1.type === "computer" && !run.value.p1.algorithm) return false;
  if (run.value.p2.type === "human" && run.value.p1.name.length === 0)
    return false;
  if (run.value.p2.type === "computer" && !run.value.p1.algorithm) return false;
  return true;
});
const handleStartClicked = () => {
  if (canStart.value) run.value.state = "running";
};
watch(
  run,
  (newVal, oldVal) => {
    emit("update", run.value);
  },
  { deep: true }
);

const playerToTurn = computed(() => {
  if (run.value.p1.history.length > run.value.p2.history.length) return "p2";
  return "p1";
});
const nextPlayerToTurn = computed(() => {
  return playerToTurn.value === "p1" ? "p2" : "p1";
});
const matchEnded = computed(
  () => run.value.p2.history.length >= run.value.maxTurn
);
const turnCount = computed(() => run.value.p1.history.length);
const handlePlayerMove = (player, move) => {
  if (playerToTurn.value === player) run.value[player].history.push(move);
};

const maskedMoves = computed(() => {
  let player1History = run.value.p1.history;
  let player2History = run.value.p2.history;
  if (player1History.length > player2History.length) {
    player1History = player1History.slice(0, player2History.length);
  } else if (player2History.length > player1History.length) {
    player2History = player2History.slice(0, player1History.length);
  }
  return {
    p1: player1History,
    p2: player2History,
  };
});

const secretAlgorithms = {
  p1: getRandomItem(algorithmFuncs.slice(0, -1)),
  p2: getRandomItem(algorithmFuncs.slice(0, -1)),
};
const handleComputerMove = (player) => {
  if (playerToTurn.value === player && run.value[player].type === "computer") {
    let func = algorithmFuncs.find(
      (f) => f.name === run.value[player].algorithm
    );
    if (run.value[player].algorithm === "Unknown ???")
      func = secretAlgorithms[player];

    run.value[player].history.push(
      func.turn(
        maskedMoves.value[player],
        maskedMoves.value[nextPlayerToTurn.value]
      )
    );
    endScrollRef.value?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }
};

watch(
  run,
  () => {
    if (matchEnded.value && run.value.state === "running") {
      setTimeout(() => {
        run.value.state = "game-ended";
        run.value.winner = scores.value.p1 > scores.value.p2 ? "p1" : "p2";
        if (scores.value.p1 === scores.value.p2) {
          if (run.value.p1.history[0]) {
            run.value["everyone"] = { name: "everyone" };
            run.value.winner = "everyone";
          } else {
            run.value["no one"] = { name: "no one" };
            run.value.winner = "no one";
          }
        }
        console.log("ended");
      }, 1000);
      return;
    }
    if (
      !matchEnded.value &&
      run.value.state === "running" &&
      run.value[playerToTurn.value].type === "computer"
    ) {
      setTimeout(() => {
        if (matchEnded.value || run.value.state !== "running") return;
        handleComputerMove(playerToTurn.value);
      }, speed.value);
    }
  },
  { deep: true }
);

const scores = computed(() => {
  return calculateScores(run.value.p1.history, run.value.p2.history);
});
</script>

<template>
  <div class="flex flex-col w-full">
    <template v-if="run.state === 'start-settings'">
      <div class="flex w-full">
        <div class="flex flex-col border-r w-full">
          <div>Player 1</div>
          <div class="items-center grid grid-cols-3 p-2 w-full">
            <div class="col-span-1">against:</div>
            <div class="flex items-center gap-3">
              <div
                class="p-2 border rounded-lg cursor-pointer"
                @click="run.p1.type = 'computer'"
                :class="{ 'ring ring-blue-600 ': run.p1.type === 'computer' }"
              >
                Computer
              </div>
              <div
                class="p-2 border rounded-lg cursor-pointer"
                @click="run.p1.type = 'human'"
                :class="{ 'ring ring-blue-600 ': run.p1.type === 'human' }"
              >
                Human
              </div>
            </div>
          </div>
          <div
            v-if="run.p1.type === 'computer'"
            class="items-center grid grid-cols-3 p-2 w-full"
          >
            <div class="col-span-1">Algorithm:</div>
            <form class="mx-auto max-w-sm">
              <label
                for="years"
                class="block mb-2 font-medium text-gray-900 text-sm"
                >Select an option</label
              >
              <select
                v-model="run.p1.algorithm"
                id="years"
                size="5"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 dark:focus:border-blue-500 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-500 w-full text-gray-900 text-sm"
              >
                <option
                  v-for="(item, index) in algorithmFuncs"
                  :value="item.name"
                  :key="index"
                >
                  {{ item.name }}
                </option>
              </select>
            </form>
          </div>
          <div v-else class="items-center grid grid-cols-3 p-2 w-full">
            <div class="col-span-1">Name:</div>
            <div class="flex items-center">
              <input
                v-model="run.p1.name"
                type="text"
                id="default-input"
                default="Player 1"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-gray-700 text-sm"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col p-2 w-full">
          <div>Player 2</div>
          <div class="items-center grid grid-cols-3 p-2 w-full">
            <div class="col-span-1">against:</div>
            <div class="flex items-center gap-3">
              <div
                class="p-2 border rounded-lg cursor-pointer"
                @click="run.p2.type = 'computer'"
                :class="{ 'ring ring-blue-600 ': run.p2.type === 'computer' }"
              >
                Computer
              </div>
              <div
                class="p-2 border rounded-lg cursor-pointer"
                @click="run.p2.type = 'human'"
                :class="{ 'ring ring-blue-600 ': run.p2.type === 'human' }"
              >
                Human
              </div>
            </div>
          </div>
          <div
            v-if="run.p2.type === 'computer'"
            class="items-center grid grid-cols-3 p-2 w-full"
          >
            <div class="col-span-1">Algorithm:</div>
            <form class="mx-auto max-w-sm">
              <label
                for="years"
                class="block mb-2 font-medium text-gray-900 text-sm"
                >Select an option</label
              >
              <select
                v-model="run.p2.algorithm"
                id="years"
                size="5"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 dark:focus:border-blue-500 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-500 w-full text-gray-900 text-sm"
              >
                <option
                  v-for="(item, index) in algorithmFuncs"
                  :value="item.name"
                  :key="index"
                >
                  {{ item.name }}
                </option>
              </select>
            </form>
          </div>
          <div v-else class="items-center grid grid-cols-3 p-2 w-full">
            <div class="col-span-1">Name:</div>
            <div class="flex items-center">
              <input
                v-model="run.p2.name"
                type="text"
                id="default-input"
                default="Player 2"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-gray-700 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center pt-4 gap-2 w-full">
        <div class="flex items-center gap-2">
          <div class="col-span-1">number of turns</div>
          <div class="flex items-center">
            <input
              v-model="run.maxTurn"
              type="text"
              id="default-input"
              default="Player 2"
              class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-gray-700 text-sm"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="col-span-1">delay (ms)</div>
          <div class="flex items-center">
            <input
              v-model="speed"
              type="text"
              id="default-input"
              default="Player 2"
              class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-gray-700 text-sm"
            />
          </div>
        </div>
        <button
          @click="handleStartClicked"
          type="button"
          :disabled="!canStart"
          class="focus:z-10 border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-75 px-5 py-2.5 border rounded-lg focus:ring-4 focus:ring-gray-100 font-medium text-gray-700 text-sm hover:text-blue-700 focus:outline-none"
        >
          Play
        </button>
      </div>
    </template>
    <template v-else-if="run.state === 'running' || run.state === 'game-ended'">
      <div class="flex flex-col w-full">
        <div class="flex flex-row items-center">
          <div
            class="flex flex-row items-center w-full overflow-x-scroll"
            ref="gameSpaceRef"
          >
            <div
              v-if="run.p1.history.length > 0"
              class="flex flex-col gap-2 p-4"
              v-for="(_, index) in run.p1.history.length"
              :key="index"
            >
              <div
                class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
                :class="{
                  'bg-green-100 border-green-200':
                    run.p1.history[index] && index < run.p2.history.length,
                  'bg-red-100 border-red-200':
                    run.p1.history[index] === false &&
                    index < run.p2.history.length,
                  'hidden-choice':
                    index === run.p1.history.length - 1 &&
                    run.p1.history.length > run.p2.history.length,
                }"
              >
                <svg
                  v-if="
                    index === run.p1.history.length - 1 &&
                    run.p1.history.length > run.p2.history.length
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
                  />
                </svg>
                <svg
                  v-else-if="
                    run.p1.history[index] === true &&
                    index < run.p2.history.length
                  "
                  class="text-green-600 current-color"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="32"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="m323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5L373 188.8l139 128V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2m22.8 124.4l-51.7 40.2c-31.5 24.6-77.2 18.2-100.8-14.2c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48v224h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8zM16 128c-8.8 0-16 7.2-16 16v208c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V128zm32 192a16 16 0 1 1 0 32a16 16 0 1 1 0-32m496-192v224c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V144c0-8.8-7.2-16-16-16zm32 208a16 16 0 1 1 32 0a16 16 0 1 1-32 0"
                  />
                </svg>
                <svg
                  v-else-if="run.p1.history[index] === false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  class="text-red-600 current-color"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    color="currentColor"
                  >
                    <path
                      d="M7 9.01s1.41-.127 2.196.498m0 0l-.263.835c-.104.329.167.657.543.657c.396 0 .657-.357.453-.665a3.6 3.6 0 0 0-.733-.827M17 9.011s-1.41-.128-2.196.497m0 0l.263.835c.104.329-.167.657-.543.657c-.396 0-.657-.357-.453-.665a3.6 3.6 0 0 1 .733-.827"
                    />
                    <path
                      d="M8 3.936L2 2l1.686 5.225c.117.363.175.545.17.717s-.086.383-.25.803a9 9 0 1 0 16.786 0c-.162-.42-.243-.63-.248-.803c-.005-.172.053-.354.17-.717L22 2l-6 1.936m-8 0A9 9 0 0 0 6.343 5M8 3.936A8.96 8.96 0 0 1 12 3a8.96 8.96 0 0 1 4 .936m0 0A9 9 0 0 1 17.657 5"
                    />
                    <path d="M9 16c.836.628 1.874 1 3 1a4.98 4.98 0 0 0 3-1" />
                  </g>
                </svg>
              </div>
              <div
                class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
                :class="{
                  'bg-green-100 border-green-200': run.p2.history[index],
                  'bg-red-100 border-red-200': run.p2.history[index] === false,
                }"
              >
                <svg
                  v-if="run.p2.history[index] === true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="32"
                  viewBox="0 0 640 512"
                  class="text-green-600 current-color"
                >
                  <path
                    fill="currentColor"
                    d="m323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5L373 188.8l139 128V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2m22.8 124.4l-51.7 40.2c-31.5 24.6-77.2 18.2-100.8-14.2c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48v224h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8zM16 128c-8.8 0-16 7.2-16 16v208c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V128zm32 192a16 16 0 1 1 0 32a16 16 0 1 1 0-32m496-192v224c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V144c0-8.8-7.2-16-16-16zm32 208a16 16 0 1 1 32 0a16 16 0 1 1-32 0"
                  />
                </svg>
                <svg
                  v-else-if="
                    run.p2.history[index] === true &&
                    index < run.p2.history.length
                  "
                  class="text-green-600 current-color"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="32"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="m323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5L373 188.8l139 128V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2m22.8 124.4l-51.7 40.2c-31.5 24.6-77.2 18.2-100.8-14.2c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48v224h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8zM16 128c-8.8 0-16 7.2-16 16v208c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V128zm32 192a16 16 0 1 1 0 32a16 16 0 1 1 0-32m496-192v224c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V144c0-8.8-7.2-16-16-16zm32 208a16 16 0 1 1 32 0a16 16 0 1 1-32 0"
                  />
                </svg>
                <svg
                  v-else-if="run.p2.history[index] === false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  class="text-red-600 current-color"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    color="currentColor"
                  >
                    <path
                      d="M7 9.01s1.41-.127 2.196.498m0 0l-.263.835c-.104.329.167.657.543.657c.396 0 .657-.357.453-.665a3.6 3.6 0 0 0-.733-.827M17 9.011s-1.41-.128-2.196.497m0 0l.263.835c.104.329-.167.657-.543.657c-.396 0-.657-.357-.453-.665a3.6 3.6 0 0 1 .733-.827"
                    />
                    <path
                      d="M8 3.936L2 2l1.686 5.225c.117.363.175.545.17.717s-.086.383-.25.803a9 9 0 1 0 16.786 0c-.162-.42-.243-.63-.248-.803c-.005-.172.053-.354.17-.717L22 2l-6 1.936m-8 0A9 9 0 0 0 6.343 5M8 3.936A8.96 8.96 0 0 1 12 3a8.96 8.96 0 0 1 4 .936m0 0A9 9 0 0 1 17.657 5"
                    />
                    <path d="M9 16c.836.628 1.874 1 3 1a4.98 4.98 0 0 0 3-1" />
                  </g>
                </svg>
              </div>
            </div>
            <div
              v-if="!matchEnded && run[playerToTurn].type === 'human'"
              class="flex flex-col gap-2 p-4"
            >
              <div
                class="flex flex-col justify-center items-center gap-1 border-slate-300 p-2 rounded-lg w-20 h-20"
              >
                <template v-if="playerToTurn === 'p1'">
                  <div
                    @click="handlePlayerMove('p1', true)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    <svg
                      class="text-green-600 current-color"
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="32"
                      viewBox="0 0 640 512"
                    >
                      <path
                        fill="currentColor"
                        d="m323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5L373 188.8l139 128V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2m22.8 124.4l-51.7 40.2c-31.5 24.6-77.2 18.2-100.8-14.2c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48v224h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8zM16 128c-8.8 0-16 7.2-16 16v208c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V128zm32 192a16 16 0 1 1 0 32a16 16 0 1 1 0-32m496-192v224c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V144c0-8.8-7.2-16-16-16zm32 208a16 16 0 1 1 32 0a16 16 0 1 1-32 0"
                      />
                    </svg>
                  </div>
                  <div
                    @click="handlePlayerMove('p1', false)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      class="text-red-600 current-color"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        color="currentColor"
                      >
                        <path
                          d="M7 9.01s1.41-.127 2.196.498m0 0l-.263.835c-.104.329.167.657.543.657c.396 0 .657-.357.453-.665a3.6 3.6 0 0 0-.733-.827M17 9.011s-1.41-.128-2.196.497m0 0l.263.835c.104.329-.167.657-.543.657c-.396 0-.657-.357-.453-.665a3.6 3.6 0 0 1 .733-.827"
                        />
                        <path
                          d="M8 3.936L2 2l1.686 5.225c.117.363.175.545.17.717s-.086.383-.25.803a9 9 0 1 0 16.786 0c-.162-.42-.243-.63-.248-.803c-.005-.172.053-.354.17-.717L22 2l-6 1.936m-8 0A9 9 0 0 0 6.343 5M8 3.936A8.96 8.96 0 0 1 12 3a8.96 8.96 0 0 1 4 .936m0 0A9 9 0 0 1 17.657 5"
                        />
                        <path
                          d="M9 16c.836.628 1.874 1 3 1a4.98 4.98 0 0 0 3-1"
                        />
                      </g>
                    </svg>
                  </div>
                </template>
              </div>
              <div
                class="flex flex-col justify-center items-center gap-1 border-slate-300 p-2 rounded-lg w-20 h-20"
              >
                <template v-if="playerToTurn === 'p2'">
                  <div
                    @click="handlePlayerMove('p2', true)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    <svg
                      class="text-green-600 current-color"
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="32"
                      viewBox="0 0 640 512"
                    >
                      <path
                        fill="currentColor"
                        d="m323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5L373 188.8l139 128V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2m22.8 124.4l-51.7 40.2c-31.5 24.6-77.2 18.2-100.8-14.2c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48v224h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8zM16 128c-8.8 0-16 7.2-16 16v208c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V128zm32 192a16 16 0 1 1 0 32a16 16 0 1 1 0-32m496-192v224c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V144c0-8.8-7.2-16-16-16zm32 208a16 16 0 1 1 32 0a16 16 0 1 1-32 0"
                      />
                    </svg>
                  </div>
                  <div
                    @click="handlePlayerMove('p2', false)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      class="text-red-600 current-color"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        color="currentColor"
                      >
                        <path
                          d="M7 9.01s1.41-.127 2.196.498m0 0l-.263.835c-.104.329.167.657.543.657c.396 0 .657-.357.453-.665a3.6 3.6 0 0 0-.733-.827M17 9.011s-1.41-.128-2.196.497m0 0l.263.835c.104.329-.167.657-.543.657c-.396 0-.657-.357-.453-.665a3.6 3.6 0 0 1 .733-.827"
                        />
                        <path
                          d="M8 3.936L2 2l1.686 5.225c.117.363.175.545.17.717s-.086.383-.25.803a9 9 0 1 0 16.786 0c-.162-.42-.243-.63-.248-.803c-.005-.172.053-.354.17-.717L22 2l-6 1.936m-8 0A9 9 0 0 0 6.343 5M8 3.936A8.96 8.96 0 0 1 12 3a8.96 8.96 0 0 1 4 .936m0 0A9 9 0 0 1 17.657 5"
                        />
                        <path
                          d="M9 16c.836.628 1.874 1 3 1a4.98 4.98 0 0 0 3-1"
                        />
                      </g>
                    </svg>
                  </div>
                </template>
              </div>
            </div>
            <div ref="endScrollRef"></div>
          </div>
          <div class="flex flex-col justify-between items-center gap-2 pb-3">
            <div
              class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
            >
              {{ scores.p1 }}
            </div>
            <div
              class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
            >
              {{ scores.p2 }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="run.state === 'game-ended'">
      <div
        class="flex w-full h-20 justify-center items-center font-bold text-lg"
      >
        <span> Game is Over !!! {{ run[run.winner].name }} won ! </span>
      </div>
      <div
        class="flex flex-col w-full h-20 justify-center items-center text-lg"
      >
        <div class="flex p-2" v-if="run.p1.algorithm === 'Unknown ???'">
          {{ run.p1.name }} algorithm is
          <div
            class="bg-gray-500 mx-2 rounded-lg"
            @click="unknownSpoilerBlock[0] = false"
            :class="{
              'bg-transparent text-gray-900': !unknownSpoilerBlock[0],
              'text-transparent cursor-pointer animate-pulse':
                unknownSpoilerBlock[0],
            }"
          >
            {{ secretAlgorithms.p1.name }}
          </div>
        </div>
        <div class="flex p-2" v-if="run.p2.algorithm === 'Unknown ???'">
          {{ run.p2.name }} algorithm is
          <div
            class="bg-gray-500 mx-2 rounded-lg"
            @click="unknownSpoilerBlock[1] = false"
            :class="{
              'bg-transparent text-gray-900': !unknownSpoilerBlock[1],
              'text-transparent cursor-pointer animate-pulse':
                unknownSpoilerBlock[1],
            }"
          >
            {{ secretAlgorithms.p2.name }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.hidden-choice {
}
</style>
