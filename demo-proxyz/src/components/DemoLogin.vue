<script setup>
import { ref, onMounted, watch } from "vue";

const username = ref("");

onMounted(() => {
  // Restore username
  const uname = localStorage.getItem("DEMO_USERNAME");
  if (uname) username.value = uname;
});

function login() {
  localStorage.setItem("DEMO_USERNAME", username.value);
  window.location.href = "/home";
}
</script>

<template>
  <v-no-ssr>
    <v-app>
      <v-card class="mx-auto" min-width="400"
        ><v-layout>
          <v-app-bar color="grey-lighten-2">
            <v-app-bar-title
              ><v-img src="/logo.svg" alt="Proxyz" height="32"
            /></v-app-bar-title>
          </v-app-bar>

          <v-main>
            <v-container class="pa-16">
              <v-form @keyup.enter="login()">
                <v-text-field
                  v-model="username"
                  label="Username"
                  autofocus
                ></v-text-field>
                <v-text-field type="password" label="Password"></v-text-field>
                <v-btn color="black" size="large" @click="login">Sign in</v-btn>
              </v-form>
            </v-container>
          </v-main>
        </v-layout>
      </v-card>
    </v-app>
  </v-no-ssr>
</template>

<style>
/* Center login */
.v-application__wrap {
  display: grid;
  place-items: center;
}
</style>
