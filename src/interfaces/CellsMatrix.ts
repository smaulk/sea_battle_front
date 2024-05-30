/**
 *Матрица клеток, в которых содержатся id корабля либо null.
 *
 *[row][col]
 */
export type CellsMatrix = Array<Array<number | null>>;

/**
 *Матрица клеток, которая хранит информацию, был ли выстрел в клетку
 *
 *[row][col]
 */
export type BoolCellsMatrix = Array<Array<boolean>>;