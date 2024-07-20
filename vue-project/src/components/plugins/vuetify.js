import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {ro} from 'vuetify/locale'


export const sistemaLightTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#40BFB4',
        'primary-darken-1': '#2D807C', // Darken primary color
        secondary: '#3777BB',
        'secondary-darken-1': '#265E8A', // Darken secondary color
        error: '#B00020',
        info: '#57C0DA',
        success: '#6DBE5C',
        warning: '#FBBC28',
        danger: '#B00020',
        black: '#000000',
    },
}

export const sistemaDarkTheme = {
    dark: true,
    colors: {
        background: '#000000', // Dark background
        surface: '#444444', // Dark surface
        primary: '#40BFB4', // Retain primary color for contrast
        'primary-darken-1': '#2D807C', // Darken primary color
        secondary: '#3777BB', // Retain secondary color for contrast
        'secondary-darken-1': '#265E8A', // Darken secondary color
        error: '#B00020', // Red error color remains the same for visibility
        info: '#57C0DA', // Blue info color remains the same for visibility
        success: '#6DBE5C', // Green success color remains the same for visibility
        warning: '#FBBC28', // Yellow warning color remains the same for visibility
        danger: '#B00020', // Red danger color remains the same for visibility
        black: '#FFFFFF', // Use white color for 'black' in the dark theme for better readability
    },
}

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'sistemaLightTheme',
        themes: {
            sistemaLightTheme,
            sistemaDarkTheme,
        },
    },
    locale: {
        locale: 'ro',
        fallback: 'ro',
        messages: {ro},
    },
    components,
    directives,
})

export default vuetify