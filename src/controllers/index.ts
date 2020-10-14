import AuthController from "./auth";
import PeriodController from "./period";
import PoolController from "./pool";
import RewardController from "./reward";
import RewardMultipleController from "./rewardMultiple"
import SnapshotController from "./snapshot";
import VolumeController from "./volume";
import WeekController from "./week";

export const controllers = [
  SnapshotController,
  AuthController,
  RewardController,
  PeriodController,
  PoolController,
  WeekController,
  VolumeController,
  RewardMultipleController
];
