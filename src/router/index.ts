import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'register' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        title: 'Register',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Login',
      },
    },
    {
      path: '/authorization',
      name: 'authorization',
      component: () => import('@/views/Authorization.vue'),
      meta: {
        title: 'Authorization',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: { name: 'register' },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${String(to.meta.title)} | Loco Pay` : 'Loco Pay'
})

export default router
