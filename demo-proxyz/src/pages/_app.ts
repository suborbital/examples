// Custom appEntrypoint to use vuetify
// https://github.com/withastro/astro/tree/main/packages/integrations/vue/#appentrypoint
import type { App } from 'vue';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export default (app: App) => {
  app.use(
    createVuetify({
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
    })
  );
};
