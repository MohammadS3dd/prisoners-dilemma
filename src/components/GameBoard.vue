<script setup>
import { ref, watch } from "vue";

const count = ref(0);

const games = ref([
  {
    id: 0,
    p1: {
      name: "Player 1",
      algorithm: "Random",
      type: "human",
      history: [],
    },
    p2: {
      name: "Player 2",
      algorithm: "Random",
      type: "human",
      history: [],
    },
    winner: null,
    state: "start-settings",
    turn: "p1",
    maxTurn: 8,
  },
]);

const addGame = () => {
  games.value.push({
    id: games.value.length + 1,
    p1: {
      name: "Player 1",
      algorithm: "Random",
      type: "human",
      history: [],
    },
    p2: {
      name: "Player 2",
      algorithm: "Random",
      type: "human",
      history: [],
    },
    winner: null,
    state: "start-settings",
    turn: "p1",
    maxTurn: 8,
  });
};

watch(
  games,
  () => {
    console.log("1");
    if (games.value[games.value.length - 1].state === "game-ended") {
      console.log("2");
      addGame();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="flex flex-col bg-slate-50 p-6 w-full h-screen overflow-y-auto">
    <h1 class="font-bold text-2xl text-slate-700 mb-4">Prisoners dilemma</h1>
    <GameRunContainer class="mb-4" v-for="(run, index) in games" :key="index">
      <template #header>
        <span class="font-bold"> Game {{ run.id }} </span>
        <div class="flex">
          <div>
            {{ run.p1.name }}
            <span v-if="run.p1.type !== 'human'">
              ({{ run.p1.algorithm }})
            </span>
          </div>
          <span class="px-2"> vs </span>
          <div>
            {{ run.p2.name }}
            <span v-if="run.p2.type !== 'human'">
              ({{ run.p2.algorithm }})
            </span>
          </div>
        </div>
        <div v-if="run.winner">Winner : {{ run[run.winner].name || "?" }}</div>
      </template>
      <GameRun :run="run" @update="run = $event" />
    </GameRunContainer>
  </div>
</template>

<style scoped></style>
