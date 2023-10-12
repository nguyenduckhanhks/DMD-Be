import { Environment } from "./config/environment";
import scheduleUploadOrderLabelToCloud from "./cronjob-service/schedule-upload-order-label-to-cloud";

export default async function cronjob() {
  if (Environment.RUN_CRONJON) {
    scheduleUploadOrderLabelToCloud();
  }
}
