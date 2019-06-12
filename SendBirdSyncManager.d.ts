
import SendBird from 'sendbird';

export = SendBirdSyncManager;
export as namespace SendBirdSyncManager;

type GroupChannel = SendBird.GroupChannel;
type UserMessage = SendBird.UserMessage;
type FileMessage = SendBird.FileMessage;
type AdminMessage = SendBird.AdminMessage;
type Message = UserMessage | FileMessage | AdminMessage;

declare const SendBirdSyncManager: SendBirdSyncManagerStatic;

declare enum LogLevelEnum { NONE = 0, ERROR = 1 }
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
  NONE = 'none'
}
interface SyncManagerOptions {
  messageCollectionCapacity: number;
  messageResendPolicy: MessageResendPolicy;
}
interface SyncManagerOptionsStatic {
  new (): SyncManagerOptions
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
  new (query: SendBird.GroupChannelListQuery): ChannelCollection;
  Action: ChannelEventAction;
  CollectionHandler: ChannelCollectionHandlerStatic;
}
interface ChannelCollection {
  channels: Array<GroupChannel>;
  query: SendBird.GroupChannelListQuery;

  fetch(): Promise<void>;
  fetch(callback: ErrorCallback): void;
  remove(): void;
  setCollectionHandler(handler:ChannelCollectionHandler): void;
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
  new (channel: GroupChannel, filter?: MessageFilter, viewpointTimestamp?: number): MessageCollection;
  Action: MessageEventAction;
  CollectionHandler: MessageCollectionHandlerStatic;
  
  create(channelUrl: string, filter: MessageFilter, callback: MessageCollectionCallback): void;
  create(channelUrl: string, filter: MessageFilter, viewpointTimestamp: number, callback: MessageCollectionCallback): void;
  create(channelUrl: string, filter: MessageFilter): Promise<GroupChannel>;
  create(channelUrl: string, filter: MessageFilter, viewpointTimestamp: number): Promise<GroupChannel>;
}
interface MessageCollection {
  channel: GroupChannel;
  filter: MessageFilter;
  limit: number;
  messages: Array<Message>;
  messageCount: number;

  fetch(direction: 'prev' | 'next'): Promise<void>;
  fetch(direction: 'prev' | 'next', callback: ErrorCallback): void;
  resetViewpointTimestamp(viewpointTimestamp: number): void;
  remove(): void;
  
  handleSendMessageResponse(err: Error, message: Message): void;

  appendMessage(message:Message): void; // DEPRECATED
  updateMessage(message:Message): void; // DEPRECATED
  deleteMessage(message:Message): void; // DEPRECATED

  setCollectionHandler(handler: MessageCollectionHandler): void;
  removeCollectionHandler(): void;
}
declare enum MessageEventAction {
  INSERT = 'insert',
  UPDATE = 'update',
  REMOVE = 'remove',
  CLEAR = 'clear'
}
interface MessageCollectionHandlerStatic {
  new (): MessageCollectionHandler;
}
interface MessageCollectionHandler {
  onMessageEvent(action: MessageEventAction, messages: Array<Message>): void;
}

// callback
type ErrorCallback = (err: Error) => void;
type MessageCollectionCallback = (err: Error, collection: MessageCollection) => void;