import header_logo from '@/assets/images/header-logo.svg';
import game_config from '../game.config.json';

//Общее количество кораблей
const countShips =
  game_config.countShipsOfSize1 + game_config.countShipsOfSize2
  + game_config.countShipsOfSize3 + game_config.countShipsOfSize4;
const config = { ...game_config, countShips };

export {
  config,
  header_logo,
}
