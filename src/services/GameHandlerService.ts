import { GameStatus } from "@/enums/GameStatus.ts";
import GameDisplayService from "@/services/GameDisplayService.ts";
import BotController from "@/services/BotController.ts";
import { config } from "@/config.ts";
import { getColRowData, getRandomInt } from "@/helpers";
import ShotController from "@/services/ShotController.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";

/**
 * Переключатель игры, отвечает за ходы.
 */
export class GameHandlerService {

  private gameService: GameDisplayService;
  private userController: ShotController;
  private botController: BotController;

  //Флаг, для проверки, может ли нажимать на клетку пользователь
  private isCanClick: boolean = true;

  constructor(gameService: GameDisplayService, userController: ShotController, botController: BotController) {
    this.gameService = gameService;
    this.userController = userController;
    this.botController = botController;
  }

  /**
   * Ожидает ход пользователя и запускает ходы бота.
   */
  public async shot(cellElement: HTMLDivElement): Promise<GameStatus | null> {
    if (!this.isCanClick) return null;

    const userShot: boolean | null = this.takeShotUser(cellElement);
    if(userShot === null) return null;
    if (userShot) return this.getGameStatus();

    return await this.takeShotBot();
  }

  /**
   * Ход пользователя
   * @param cellElem HTML элемент клетки
   * @return boolean Говорит, попал ли пользователь, или нет
   * @return null Говорит, что пользователь не может стрелять в данную клетку
   */
  private takeShotUser(cellElem: HTMLDivElement): boolean | null{
    const cellData = getColRowData(cellElem);
    //Проверка, что клетка не существует или пользователь уже кликал на клетку
    if (!cellData || !this.gameService.checkCellIsCanShot(cellData)) return null;

    const shotData: ShotData = this.botController.shot(cellData);
    this.gameService.hitOnRivalCell(cellData, shotData);

    return !!shotData.shot;
  }

  /**
   * Ход бота.
   */
  private async takeShotBot(): Promise<GameStatus> {
    this.disableClicks();
    await this.delay(this.getBotWaitTime());

    const cellData = this.botController.getCellToShot();
    const shotData: ShotData = this.userController.shot(cellData);
    this.botController.setBotShotData(cellData, shotData);
    this.gameService.hitOnSelfCell(cellData, shotData);
    //Если бот попал
    if (shotData.shot !== ShotStatus.Miss) {
      const gameStatus = this.getGameStatus();
      if (gameStatus !== GameStatus.InProgress) return gameStatus;

      return this.takeShotBot();
    }
    else {
      this.enableClicks();
      return GameStatus.InProgress;
    }
  }

  /**
   * Задержка выполнения
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  private getGameStatus(): GameStatus {
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