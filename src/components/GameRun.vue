<script setup>
import { computed, ref, watch } from "vue";
import { algorithmValues } from "./algorithms";

const count = ref(0);
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

const turnCount = computed(() => run.value.p1.history.length);
const handlePlayerMove = (player, move) => {
  if (playerToTurn.value === player) run.value[player].history.push(move);
};
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
                class="p-2 border rounded-lg"
                @click="run.p1.type = 'computer'"
                :class="{ 'ring ring-blue-600 ': run.p1.type === 'computer' }"
              >
                Computer
              </div>
              <div
                class="p-2 border rounded-lg"
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
                id="years"
                size="5"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 dark:focus:border-blue-500 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-500 w-full text-gray-900 text-sm"
              >
                <option
                  v-for="(item, index) in algorithmValues"
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
                class="p-2 border rounded-lg"
                @click="run.p2.type = 'computer'"
                :class="{ 'ring ring-blue-600 ': run.p2.type === 'computer' }"
              >
                Computer
              </div>
              <div
                class="p-2 border rounded-lg"
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
                id="years"
                size="5"
                class="block border-gray-300 bg-gray-50 p-2.5 border focus:border-blue-500 dark:focus:border-blue-500 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-500 w-full text-gray-900 text-sm"
              >
                <option
                  v-for="(item, index) in algorithmValues"
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
      <div class="flex justify-center items-center pt-4 w-full">
        <button
          @click="handleStartClicked"
          type="button"
          :disabled="!canStart"
          class="focus:z-10 border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-75 mb-2 px-5 py-2.5 border rounded-lg focus:ring-4 focus:ring-gray-100 font-medium text-gray-700 text-sm hover:text-blue-700 me-2 focus:outline-none"
        >
          Play
        </button>
      </div>
    </template>
    <template v-else-if="run.state === 'running'">
      <div class="flex flex-col w-full">
        <div class="flex flex-row items-center">
          <div class="flex flex-row items-center w-full overflow-x-scroll">
            <div
              v-if="run.p1.history.length > 0"
              class="flex flex-col gap-2 p-4"
              v-for="(_, index) in run.p1.history.length"
              :key="index"
            >
              <div
                class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
                :class="{
                  'bg-green-300': run.p1.history[index],
                  'bg-red-300': run.p1.history[index] === false,
                }"
              ></div>
              <div
                class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
                :class="{
                  'bg-green-300': run.p2.history[index],
                  'bg-red-300': run.p2.history[index] === false,
                }"
              ></div>
            </div>
            <div class="flex flex-col gap-2 p-4">
              <div
                class="flex flex-col justify-center items-center gap-1 border-slate-300 p-2 rounded-lg w-20 h-20"
              >
                <template v-if="playerToTurn === 'p1'">
                  <div
                    @click="handlePlayerMove('p1', true)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    true
                  </div>
                  <div
                    @click="handlePlayerMove('p1', false)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    false
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
                    true
                  </div>
                  <div
                    @click="handlePlayerMove('p2', false)"
                    class="flex justify-center items-center border-slate-300 hover:bg-slate-100 p-1 border rounded-lg w-full cursor-pointer"
                  >
                    false
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-between items-center gap-2">
            <div
              class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
            ></div>
            <div
              class="flex justify-center items-center border-slate-300 p-2 border rounded-lg w-20 h-20"
            ></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
