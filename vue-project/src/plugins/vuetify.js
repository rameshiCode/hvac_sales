// plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// import '@mdi/font/css/materialdesignicons.css'
// buttons
// import { md1 } from 'vuetify/blueprints'

export default createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'dark'
    },
    // ssr: true,
    // icons: {
    //   iconfont: 'mdi', // Specifies that mdi should be used
    // },
    // blueprint: md1,
})
// import { VBtn, VCard, VTextField } from 'vuetify/components';
// export default createVuetify({
//     components: {
//       VBtn,
//       VCard,
//       VTextField
//     }
// });

