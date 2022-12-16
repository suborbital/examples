<script setup>
import { ref, onMounted, watch } from "vue";

import { Suborbital } from "@suborbital/se2";
let suborbital;
const se2UriConfig = {
  adminUri: "https://api.stg.suborbital.network",
  execUri: "https://edge.stg.suborbital.network",
  builderUri: "https://builder.stg.suborbital.network",
};

const requestData = ref(null);
const logEntries = ref([]);

const editor = ref(false);
const editorAvailable = ref(true);
const updating = ref(false);
let update_in_progress = false;

const config = ref(null);
const language = ref("");
const languages = ref([]);

const username = ref("");

onMounted(() => {
  // Get username on mount
  const uname = localStorage.getItem("DEMO_USERNAME");
  if (uname) username.value = uname;

  // Automatically update the requestData
  let logRefresh;
  watch(updating, (on) => {
    const freq = config.value.updateFreq ?? 1000;

    if (on) {
      logRefresh = setInterval(updateRequestData, Math.floor(freq));
      console.log(`Dashboard updates every ${freq}ms`);
      updateRequestData();
    } else {
      clearInterval(logRefresh);
    }
  });

  // Pause updates when the editor is open
  watch(editor, () => {
    updating.value = !editor.value;
  });

  // Fetch configuration
  fetch("/api/config")
    .then((r) => r.json())
    .then((r) => {
      if (!r.plugin) r.plugin = "default_plugin";
      config.value = r;
      languages.value = r.languages;
      language.value = r.languages[0].identifier;

      // Set up the Suborbital SDK
      suborbital = new Suborbital(config.value.token, se2UriConfig);
      // Start polling the requestData
      updating.value = true;

      console.log(`Configuration loaded (${config.value.env})`);
    });
});

async function updateRequestData() {
  if (update_in_progress) return;

  try {
    update_in_progress = true;

    const res = await fetch("/api/data");
    const { data, logs } = await res.json();

    requestData.value = data;

    // Logs disabled
    if (logs === null) {
      logEntries.value = [];
    } else {
      logEntries.value.push(...logs);

      // follow log when not scrolled
      setTimeout(updateLogScroll, 50);
    }

    return data;
  } finally {
    update_in_progress = false;
  }
}

function updateLogScroll() {
  const logel = document.querySelector(".logdata");
  if (logel.scrollTopMax - logel.scrollTop < 0.5 * logel.clientHeight) {
    logel.scrollTop = logel.scrollTopMax;
  }
}

function getEditorUrl() {
  const { session, ident, env, namespace, plugin } = config.value;

  return suborbital.builder.getEditorUrl({
    token: session,
    environment: env,
    userId: username.value,
    namespace,
    name: plugin,
    language: language.value,
  });
}

const editorSrc = ref("");
function closeEditor() {
  editor.value = false;
  editorSrc.value = "";
}
async function controlEditor(done = false) {
  // Update module details on the backend and fetch a session token
  // If we have not yet deployed the module (done=true) but already
  // have a session token we can skip this
  if (!config.value.session || done) {
    const updatePlugin = await fetch("/api/plugin", {
      method: "POST",
      body: JSON.stringify({
        plugin: config.value.plugin,
        user: username.value,
        done,
      }),
    });

    // Updated config
    config.value = await updatePlugin.json();
  }

  // Manage editor iframe
  if (done) {
    // Remove
    editorSrc.value = "";
    // Close the editor when done editing
    editor.value = false;
  } else {
    // Load
    editorSrc.value = getEditorUrl();
    // Give the iframe a bit of a head start before we open the editor popup
    setTimeout(() => (editor.value = true), 100);
  }
}

async function selectLang(langId) {
  editorAvailable.value = false;
  console.log("editor disabled");
  language.value = langId;

  // Updated session config
  config.value = await fetch("/api/plugin", {
    method: "POST",
    body: JSON.stringify({
      plugin: "default_" + langId + "_plugin",
      user: username.value,
    }),
  }).then((r) => r.json());
  console.log("editor enabled");
  editorAvailable.value = true;
}
function logout() {
  window.location.href = "/";
}
</script>

<template>
  <v-no-ssr>
    <v-app>
      <v-menu activator="#language-dropdown">
        <v-list density="compact">
          <v-list-subheader>LANGUAGE SELECT</v-list-subheader>
          <v-list-item
            v-for="(item, i) in languages"
            :key="i"
            :value="item.identifier"
            active-color="primary"
            @click="selectLang(item.identifier)"
          >
            <template v-slot:prepend>
              <v-icon :icon="'mdi-language-' + item.identifier"></v-icon>
            </template>
            <v-list-item-title>{{ item.pretty }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip location="left" activator="#language-dropdown">
        <span>Select SE2 language toolchain to use</span>
      </v-tooltip>
      <v-dialog
        v-model="editor"
        dark
        fullscreen
        :scrim="false"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="closeEditor()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Suborbital SE2 processing:</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="controlEditor(true)"> Done </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <iframe class="editor" :src="editorSrc"></iframe>
        </v-card>
      </v-dialog>

      <div class="d-flex flex-row-reverse align-center ma-2" style="gap: 16px">
        <v-btn icon="mdi-logout" @click="logout()" size="small"></v-btn>
        <v-chip>
          <v-icon class="mr-2">mdi-account-box</v-icon>
          {{ username }}
        </v-chip>
      </div>
      <v-card class="ma-2">
        <v-layout>
          <v-app-bar color="grey-lighten-2">
            <template v-slot:prepend>
              <v-btn
                :icon="updating ? 'mdi-pause' : 'mdi-play'"
                @click="updating = !updating"
                v-show="config"
              ></v-btn>
            </template>

            <v-app-bar-title
              ><v-img src="/logo.svg" alt="Proxyz" height="32"
            /></v-app-bar-title>

            <template v-slot:append>
              <v-btn
                id="language-dropdown"
                :icon="'mdi-language-' + language"
                v-show="config"
              ></v-btn>
              <v-btn
                icon="mdi-database-plus"
                @click="controlEditor()"
                v-show="config"
                :disabled="!editorAvailable"
              ></v-btn>
            </template>
          </v-app-bar>

          <v-main>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Start</th>
                  <th class="text-left">Method</th>
                  <th class="text-left">Status</th>
                  <th class="text-left">Host</th>
                  <th class="text-left">URI</th>
                  <th class="text-left">Tags</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in requestData"
                  :key="r.id"
                  :class="
                    r.tags?.includes('kinda-sus')
                      ? 'bg-red-lighten-5'
                      : undefined
                  "
                >
                  <td>
                    <svg
                      v-show="r.tags?.includes('kinda-sus')"
                      class="sus"
                      viewBox="0 0 325 419"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M79.7571 125.995L80.2438 325.519C39.8523 327.466 29.1462 325.519 17.9534 300.7C8.99912 280.845 12.1136 198.992 12.1136 198.992C12.1136 198.992 12.8923 141.568 31.5794 129.888C50.2665 118.209 71.4842 122.426 79.7571 125.995Z"
                        fill="#EE1B24"
                        stroke="black"
                        stroke-width="22"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M238.202 27.4392C222.24 17.0639 149.3 0.11443 118.511 23.2057C90.7696 44.0118 82.7194 63.6158 76.9466 106.335C67.6139 175.397 65.2001 249.09 70.4981 327.678C76.4015 415.244 100.015 406.389 118.709 407.373C137.403 408.357 162 403.437 162.984 372.937C163.771 348.536 169.871 326.694 186.597 326.694H232.84C207.259 326.694 199.978 349.323 208.243 372.937C213.753 388.679 231.665 393.551 243.663 392.615C266.442 390.837 276.228 380.808 283.019 349.323C293.841 299.145 295.809 267.942 295.809 193.869C295.809 95.4795 253.596 37.4455 238.202 27.4392Z"
                        fill="#EE1B24"
                        stroke="black"
                        stroke-width="22"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M273.994 78.4739C249.654 72.5242 200.767 70.4743 176.768 76.6279C161.823 80.4599 150.308 85.3658 145.386 100.627C139.232 119.702 150.34 155.445 168.769 173.238C186.614 190.468 234.101 192.509 276.455 174.469C309.684 160.316 310.915 146.778 313.376 128.933C315.485 113.645 301.685 85.2428 273.994 78.4739Z"
                        fill="#5CB5D1"
                        stroke="black"
                        stroke-width="22"
                      ></path>
                    </svg>
                  </td>
                  <td>
                    {{ r.request_start }} +{{
                      Math.floor(r.request_time * 1000)
                    }}ms
                  </td>
                  <td>{{ r.method }}</td>
                  <td>{{ r.status }}</td>
                  <td>{{ r.host }}</td>
                  <td>{{ r.uri }}</td>
                  <td>{{ r.tags?.join(", ") }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-main>
        </v-layout>
      </v-card>
      <v-card class="mt-4 pa-4" v-if="logEntries.length">
        <pre class="logdata">
          <p v-for="(logln, index) in logEntries" :key="index" v-html="logln"></p>
        </pre>
      </v-card>
    </v-app>
  </v-no-ssr>
</template>

<style>
.editor {
  width: 100%;
  height: 100%;
}
.sus {
  height: 42px;
  width: 32px;
  position: fixed;
  z-index: 991;
  margin-top: -21px;
  margin-left: -36px;
}
.logdata {
  max-height: 16em;
  overflow-y: scroll;
  white-space: pre-wrap;
}

table {
  table-layout: fixed;
}

table th:nth-of-type(1) {
  width: 1%;
}
table th:nth-of-type(2) {
  width: 25%;
}
table th:nth-of-type(3) {
  width: 10%;
}
table th:nth-of-type(4) {
  width: 10%;
}
table th:nth-of-type(7) {
  width: 10%;
}
</style>
