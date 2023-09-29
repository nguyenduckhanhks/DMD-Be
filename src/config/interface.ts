export enum RPCAction {}
export enum WorkerAction {}
export enum RabbitMqQueueName {
  ANALYTICS_MQ_QUEUE = "analytics_queue",
}


export enum CancelStatus {
  None,
  Cancelling,
  Canceled,
  Pending
}