import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'; // Adjust the path if necessary
import PingView from '../views/PingView.vue';
import SignUp from '@/components/SignUp.vue';
import Login from '../components/Login.vue';
import ProductManagement from '../components/ProductManagement.vue';
import ClientForm from '@/components/ClientForm.vue';
import ProductManipulation from '../components/ProductManipulation.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/ping',
      name: 'ping',
      component: PingView
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUp  // Fixed typo here
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/product-management',
      name: 'ProductManagement',
      component: ProductManagement
    },
    {
      path: '/add-client',
      name: 'AddClient',
      component: ClientForm
    },
    {
      path: '/product-manipulation',
      name: 'ProductManipulation',
      component: ProductManipulation,
    },
    {
      path: '/product-manipulation',
      name: 'ProductManipulation',
      component: ProductManipulation, 
    }
  ]
})

export default router;
