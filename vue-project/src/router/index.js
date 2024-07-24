import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue';
import PingView from '../views/PingView.vue';
import SignUp from '@/components/SignUp.vue';
import Login from '../components/Login.vue';
import ProductManagement from '../components/ProductManagement.vue';
import ClientForm from '@/components/ClientForm.vue';
import ProductManipulation from '../components/ProductManipulation.vue';
import ClientsManagement from '../components/ClientManagement.vue';
import ProductCategorySelection from '@/components/ProductCategorySelection.vue';
import ProductSelection from '@/components/ProductSelection.vue';
import ClientDetails from '@/components/ClientDetails.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/ping',
      name: 'Ping',
      component: PingView
    },
    {
      path: '/sign-up',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/login',
      name: 'Login',
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
      component: ProductManipulation
    },
    {
      path: '/clients',
      name: 'ClientsManagement',
      component: ClientsManagement
    },
    {
      path: '/select-category/:clientId',
      name: 'ProductCategorySelection',
      component: ProductCategorySelection,
      props: true
    },
    {
      path: '/select-products/:clientId/:categoryName',
      name: 'ProductSelection',
      component: ProductSelection,
      props: true
    },
    {
      path: '/product-category-selection/:clientId/:clientEmail',
      name: 'ProductCategorySelection',
      component: ProductCategorySelection,
      props: true
    },
    {
      path: '/product-selection/:categoryName/:clientId/:clientEmail',
      name: 'ProductSelection',
      component: ProductSelection,
      props: true
    },
    {
      path: '/clients/:clientId',
      name: 'ClientDetails',
      component: ClientDetails, // Add route for ClientDetails.vue
      props: true
    },
    {
      path: '/product-selection/:clientId/:offerId?',
      name: 'ProductSelection',
      component: ProductSelection,
      props: true
    },
  ]
})

export default router;
