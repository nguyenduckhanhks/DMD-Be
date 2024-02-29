import scheduleUploadOrderLabelToCloud from './schedule-upload-order-label-to-cloud';

export default async function cronjob() {
  if (process.env.RUN_CRONJOB === '1') {
    console.log('start cronjob');
    scheduleUploadOrderLabelToCloud();
  }
}
