import MainView from "@/views/MainView.vue";
import GameView from "@/views/GameView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

export default [
  {
    name: 'main',
    path: '/',
    component: MainView,
  },
  {
    name: 'game',
    path: '/game',
    component: GameView,
  },
  {
    name: '404',
    path: '/:pathMatch(.*)*',
    component: NotFoundView,
  },
];