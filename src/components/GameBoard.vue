<script setup>
import { ref } from "vue";

const count = ref(0);

const games = ref([
  {
    id: 0,
    p1: {
      name: "Player 1",
      algorithm: "random",
    },
    p2: {
      name: "Player 2",
      algorithm: "random",
    },
    winner: null,
    state: "start-settings",
  },
]);

const addGame = () => {
  games.value.push({
    id: games.value.length + 1,
    p1: {
      name: "Player 1",
      algorithm: "random",
    },
    p2: {
      name: "Player 2",
      algorithm: "random",
    },
    winner: null,
    state: "start-settings",
  });
};
</script>

<template>
  <div class="flex flex-col bg-slate-50 p-6 w-full h-screen">
    <h1 class="font-bold text-2xl text-center text-slate-700">
      Prisoners dilemma
    </h1>
    <GameRunContainer v-for="(run, index) in games" :key="index">
      <template #header>
        <span class="font-bold"> Game {{ run.id }} </span>
        <div class="flex">
          <div>
            {{ run.p1.name }}
            <span v-if="run.p1.name !== 'Algorithm'">
              ({{ run.p1.algorithm }})
            </span>
          </div>
          <span class="px-2"> vs </span>
          <div>
            {{ run.p2.name }}
            <span v-if="run.p1.name !== 'Algorithm'">
              ({{ run.p2.algorithm }})
            </span>
          </div>
        </div>
        <div v-if="run.winner">Winner : {{ run.winner || "?" }}</div>
      </template>
      <GameRun :run="run" />
    </GameRunContainer>
  </div>
</template>

<style scoped></style>
