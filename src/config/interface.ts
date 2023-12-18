export enum RPCAction {}
export enum WorkerAction {}
export enum RabbitMqQueueName {
  ANALYTICS_MQ_QUEUE = "analytics_queue",
}

export enum CancelStatus {
  None,
  Cancelling,
  Canceled,
  Pending,
}

export enum Event17TrackName {
  TRACKING_UPDATED = "TRACKING_UPDATED",
  TRACKING_STOPPED = "TRACKING_STOPPED",
}
