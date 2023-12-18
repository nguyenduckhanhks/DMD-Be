import scheduleRegister17Track from "./cronjob-service/register-17track";
import scheduleUploadOrderLabelToCloud from "./cronjob-service/schedule-upload-order-label-to-cloud";

export default async function cronjob() {
  if (process.env.RUN_CRONJOB === "1") {
    console.log('start cronjob')
    scheduleUploadOrderLabelToCloud();
    scheduleRegister17Track();
  }
}
