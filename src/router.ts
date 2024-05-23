import {createRouter, createWebHistory} from "vue-router";
import MainBlock from "components/main_block/MainBlock.vue";
import NotFoundBlock from "components/not_found_block/NotFoundBlock.vue";
import GameBlock from "components/game/GameBlock.vue";


const routes = [
    {
        name: 'Main',
        path: '/',
        component: MainBlock
    },
    {
        name:'Game',
        path: '/game',
        component: GameBlock,
    },

    {
        name: '404',
        path: '/:pathMatch(.*)*',
        component: NotFoundBlock,
    },
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});


export default router;



