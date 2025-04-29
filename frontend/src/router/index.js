import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/books/:id',
      name: 'book',
      component: () => import('../views/BookView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/LogoutView.vue'),
    },
    {
      path: '/selector',
      name: 'selector',
      component: () => import('../views/SelectorView.vue'),
    },
    {
      path: '/v1/library',
      name: 'library1',
      component: () => import('../views/LibraryView.vue'),
      props: {
        version: 'v1'
      }
    },
    {
      path: '/v1/reader/:id',
      name: 'reader1',
      component: () => import('../views/Reader1View.vue'),
      props: true
    },
    {
      path: '/v2/library',
      name: 'library2',
      component: () => import('../views/LibraryView.vue'),
      props: {
        version: 'v2'
      }
    },
    {
      path: '/v2/reader/:id',
      name: 'reader2',
      component: () => import('../views/Reader2View.vue'),
      props: true
    },
    {
      path: '/v3/library',
      name: 'library3',
      component: () => import('../views/LibraryView.vue'),
      props: {
        version: 'v3'
      }
    },
    {
      path: '/v3/reader/:id',
      name: 'reader3',
      component: () => import('../views/Reader3View.vue'),
      props: true
    },
    {
      path: '/v4/library',
      name: 'library4',
      component: () => import('../views/LibraryView.vue'),
      props: {
        version: 'v4'
      }
    },
    {
      path: '/v4/reader/:id',
      name: 'reader4',
      component: () => import('../views/Reader4View.vue'),
      props: true
    },
  ],
})

export default router
