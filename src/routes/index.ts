import Main from "@/views/MainView.vue";
import Game from "@/views/GameView.vue";
import NotFound from "@/views/NotFoundView.vue";

export default [
  {
    name: 'Main',
    path: '/',
    component: Main,
  },
  {
    name: 'Game',
    path: '/game',
    component: Game,
  },

  {
    name: '404',
    path: '/:pathMatch(.*)*',
    component: NotFound,
  },
];