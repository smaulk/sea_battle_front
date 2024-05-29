import { GameStatus } from "@/enums/GameStatus.ts";
import GameService from "@/services/GameService.ts";
import BotController from "@/services/BotController.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { config } from "@/config.ts";
import { getColRowData, getRandomInt } from "@/helpers";
import ShotController from "@/services/ShotController.ts";
import { ShotData } from "@/interfaces/ShotData.ts";


export class GameHandlerService {

  private gameService: GameService;
  private userController: ShotController;
  private botController: BotController;

  //Флаг, для проверки, может ли нажимать на клетку пользователь
  private isCanClick: boolean = true;

  constructor(gameService: GameService, userController: ShotController, botController: BotController) {
    this.gameService = gameService;
    this.userController = userController;
    this.botController = botController;
  }

  /**
   * Игровой переключатель.
   * Ожидает ходы пользователя и запускает ходы бота.
   */
  public async gameHandler(event: Event): Promise<GameStatus | null> {
    if (!this.isCanClick) return null;

    const userShot: boolean = this.takeShotUser(event.target as HTMLDivElement);
    if (userShot) return this.getGameStatus();

    return await this.takeShotBot();
  }

  /**
   * Ход пользователя
   * @param cellElem HTML элемент клетки
   * @return boolean Говорит, попал ли пользователь, или нет
   */
  private takeShotUser(cellElem: HTMLDivElement): boolean{
    //Проверка, что клетка существует
    const cellData = getColRowData(cellElem);
    if (!cellData) return false;
    //Проверка, если пользователь кликал на клетку
    const clickedCell = this.gameService.checkClickedCells(cellData);
    if (clickedCell !== null) return false;
    const shotData: ShotData = this.botController.shot(cellData);
    this.gameService.hitOnRivalCell(cellData, shotData);

    return !!shotData.shot;
  }


  private async takeShotBot(): Promise<GameStatus> {
    return new Promise((resolve) => {
      this.disableClicks();
      setTimeout(async () => {
        const cellData: ColRowData = this.botController.getCellToShot();
        const shotData: ShotData = this.userController.shot(cellData);
        this.botController.setBotShotData(cellData, shotData);
        this.gameService.hitOnSelfCell(cellData, shotData);

        if (shotData.shot) {
          const gameInfo = this.getGameStatus();
          if (gameInfo) {
            this.disableClicks();
            resolve(gameInfo);
          } else {
            const result = await this.takeShotBot();
            resolve(result);
          }
        } else {
          this.enableClicks();
          resolve(GameStatus.InProgress);
        }
      }, this.getBotWaitTime());
    });
  }


  private getBotWaitTime(): number {
    return config.minBotWaitTimeMS + getRandomInt(config.maxBotWaitTimeMS - config.minBotWaitTimeMS);
  }

  private enableClicks(): void {
    this.isCanClick = true
  }

  private disableClicks(): void {
    this.isCanClick = false
  }


  /**
   * Получение статуса игры.
   */
  public getGameStatus(): GameStatus {
    //Если все корабли противника уничтожены
    if (this.botController.isAllDestroyed) {
      this.disableClicks()
      return GameStatus.UserWin;
    }
    //Если все корабли пользователя уничтожены.
    else if (this.userController.isAllDestroyed) {
      this.disableClicks()
      return GameStatus.RivalWin;
    }
    return GameStatus.InProgress;
  }

}