/**
 * Уровень сложности игры
 */
export enum DifficultyLevel {
  Easy = 'easy',
  Normal = 'normal',
}

export const DifficultyLevelRU = {
  [DifficultyLevel.Easy]: 'Легко',
  [DifficultyLevel.Normal]: 'Нормально',
};