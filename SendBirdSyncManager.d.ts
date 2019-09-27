import SendBird from 'sendbird';

type GroupChannel = SendBird.GroupChannel;
type UserMessage = SendBird.UserMessage;
type FileMessage = SendBird.FileMessage;
type AdminMessage = SendBird.AdminMessage;
type Message = UserMessage | FileMessage | AdminMessage;

export { SendBirdSyncManager, ChannelCollection, MessageCollection };
export as namespace SendBirdSyncManager;

declare const SendBirdSyncManager: SendBirdSyncManagerStatic;
declare const ChannelCollection: ChannelCollectionStatic;
declare const MessageCollection: MessageCollectionStatic;

declare enum LogLevelEnum {
  NONE = 0,
  ERROR = 1
}
interface SendBirdSyncManagerStatic {
  sendBird: SendBird.SendBirdInstance;
  ChannelCollection: ChannelCollectionStatic;
  MessageCollection: MessageCollectionStatic;

  Options: SyncManagerOptionsStatic;
  syncManagerOptions: SyncManagerOptions;

  LogLevel: LogLevelEnum;
  loggerLevel: number;

  setup(userId: string): Promise<void>;
  setup(userId: string, options: SyncManagerOptions): Promise<void>;
  setup(userId: string, callback: ErrorCallback): void;
  setup(userId: string, options: SyncManagerOptions, callback: ErrorCallback): void;
  getInstance(): SendBirdSyncManagerInstance;
  useReactNative(AsyncStorage: object): void;
}
declare enum MessageResendPolicy {
  NONE = 'none',
  MANUAL = 'manual',
  AUTOMATIC = 'automatic'
}
interface SyncManagerOptions {
  messageCollectionCapacity: number;
  messageResendPolicy: MessageResendPolicy;
  automaticMessageResendRetryCount: number;
  maxFailedMessageCountPerChannel: number;
  failedMessageRetentionDays: number;
}
interface SyncManagerOptionsStatic {
  new (): SyncManagerOptions;
}

interface SendBirdSyncManagerInstance {
  currentUserId: string;

  resumeSync(): void;
  pauseSync(): void;
  clearCache(): Promise<void>;
  clearCache(callback: ErrorCallback): void;
  reset(): Promise<void>;
  reset(callback: ErrorCallback): void;
}

// ChannelManager
interface ChannelCollectionStatic {
  new (query: SendBird.GroupChannelListQuery): ChannelCollectionInstance;
  Action: ChannelEventAction;
  CollectionHandler: ChannelCollectionHandlerStatic;
}
interface ChannelCollectionInstance {
  channels: Array<GroupChannel>;
  query: SendBird.GroupChannelListQuery;

  fetch(): Promise<void>;
  fetch(callback: ErrorCallback): void;
  remove(): void;
  setCollectionHandler(handler: ChannelCollectionHandler): void;
  removeCollectionHandler(): void;
}
declare enum ChannelEventAction {
  INSERT = 'insert',
  UPDATE = 'update',
  MOVE = 'move',
  REMOVE = 'remove',
  CLEAR = 'clear'
}
interface ChannelCollectionHandlerStatic {
  new (): ChannelCollectionHandler;
}
interface ChannelCollectionHandler {
  onChannelEvent(action: ChannelEventAction, channels: Array<GroupChannel>): void;
}

// MessageManager
interface MessageFilter {
  messageTypeFilter: 0 | 1 | 2 | 3; // 0: ALL, 1: USER, 2: FILE, 3: ADMIN
  customTypeFilter: string;
  senderUserIdsFilter: Array<string>;
}
interface MessageCollectionStatic {
  new (channel: GroupChannel, filter?: MessageFilter, viewpointTimestamp?: number): MessageCollectionInstance;
  Action: MessageEventAction;
  FailedMessageEventActionReason: FailedMessageEventActionReason;
  CollectionHandler: MessageCollectionHandlerStatic;

  create(channelUrl: string, filter: MessageFilter, callback: MessageCollectionCallback): void;
  create(
    channelUrl: string,
    filter: MessageFilter,
    viewpointTimestamp: number,
    callback: MessageCollectionCallback
  ): void;
  create(channelUrl: string, filter: MessageFilter): Promise<GroupChannel>;
  create(channelUrl: string, filter: MessageFilter, viewpointTimestamp: number): Promise<GroupChannel>;
}
interface MessageCollectionInstance {
  channel: GroupChannel;
  filter: MessageFilter;
  limit: number;

  messages: Array<Message>; // DEPRECATED
  succeededMessages: Array<Message>;
  failedMessages: Array<Message>;
  messageCount: number;

  fetch(direction: 'prev' | 'next'): Promise<void>; // DEPRECATED
  fetch(direction: 'prev' | 'next', callback: ErrorCallback): void; // DEPRECATED

  fetchFailedMessages(): Promise<void>;
  fetchFailedMessages(callback: ErrorCallback): void;
  fetchSucceededMessages(): Promise<void>;
  fetchSucceededMessages(callback: ErrorCallback): void;

  resetViewpointTimestamp(viewpointTimestamp: number): void;
  remove(): void;

  handleSendMessageResponse(err: Error, message: Message): void;

  hasMessage(message: Message): boolean;
  appendMessage(message: Message): void;
  updateMessage(message: Message): void;
  deleteMessage(message: Message): void;

  setCollectionHandler(handler: MessageCollectionHandler): void;
  removeCollectionHandler(): void;
}
declare enum MessageEventAction {
  INSERT = 'insert',
  UPDATE = 'update',
  REMOVE = 'remove',
  CLEAR = 'clear'
}
declare enum FailedMessageEventActionReason {
  NONE = 'none',
  UPDATE_RESEND_FAILED = 'update_resend_failed',
  REMOVE_RESEND_SUCCEEDED = 'remove_resend_succeeded',
  REMOVE_RETENTION_EXPIRED = 'remove_retention_expired',
  REMOVE_EXCEEDED_MAX_COUNT = 'remove_exceeded_max_count',
  REMOVE_MANUAL_ACTION = 'remove_manual_action',
  REMOVE_UNKNOWN = 'remove_unknown'
}
interface MessageCollectionHandlerStatic {
  new (): MessageCollectionHandler;
}
interface MessageCollectionHandler {
  onPendingMessageEvent(messages: Array<Message>, action: MessageEventAction): void;
  onFailedMessageEvent(
    messages: Array<Message>,
    action: MessageEventAction,
    reason: FailedMessageEventActionReason
  ): void;
  onSucceededMessageEvent(messages: Array<Message>, action: MessageEventAction): void;
  onNewMessage(message: Message): void;

  onMessageEvent(action: MessageEventAction, messages: Array<Message>): void; // DEPRECATED
}

// callback
type ErrorCallback = (err: Error) => void;
type MessageCollectionCallback = (err: Error, collection: MessageCollection) => void;
