import { createRouter, createWebHistory } from 'vue-router'
import PingView from '../views/PingView.vue';
import ClientsList from "@/views/ClientsList.vue";
import MainLayout from "@/views/MainLayout.vue";
import ClientDetails from "@/views/ClientDetails.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/home',
        name: 'Home',
        component: MainLayout,
        meta: {
            requiresAuth: true // This route does not require authentication
        },
        children: [
            {
                path: '',
                name: 'ClientList',
                component: ClientsList,
                meta: {
                    breadcrumbs: [
                        { label: 'Clienți', path: '/home' },
                    ],
                },
            },
            {
              path: "/client-details/:id",
              name: "ClientDetails",
              component: ClientDetails,
              props: true,
              meta: {
                  breadcrumbs: [
                      { label: 'Clienți', path: '/home' },
                      { label: 'Detalii client', path: '/client-details' },
                  ],
              },
          },
        ]
    },
    {
        path: '/clients',
        name: 'ClientsList',
        component: ClientsList,
        // meta: {
        //     requiresAuth: true // This route does not require authentication
        // }
    },
 

    // {
    //   path: '/',
    //   name: 'home',
    //   component: PingView
    // },
    {
      path: '/ping',
      name: 'ping',
      component: PingView
    }
  ]
})

export default router
