
import SendBird from 'sendbird';

export = SendBirdSyncManager;
export as namespace SendBirdSyncManager;

type GroupChannel = SendBird.GroupChannel;
type UserMessage = SendBird.UserMessage;
type FileMessage = SendBird.FileMessage;
type AdminMessage = SendBird.AdminMessage;
type Message = UserMessage | FileMessage | AdminMessage;

declare const SendBirdSyncManager: SendBirdSyncManagerStatic;

interface SendBirdSyncManagerStatic {
  sendBird: SendBird.SendBirdInstance;
  ChannelCollection: ChannelCollectionStatic;
  MessageCollection: MessageCollectionStatic;
  
  setup(userId: string): Promise<void>;
  setup(userId: string, callback:(err: Error) => void): void;
  getInstance(): SendBirdSyncManagerInstance;
}
interface SendBirdSyncManagerInstance {
  currentUserId: string;

  resumeSync(): void;
  pauseSync(): void;
  clearCache(): Promise<void>;
  clearCache(callback:(err: Error) => void): void;
}

// ChannelManager
interface ChannelCollectionStatic {
  new (query:SendBird.GroupChannelListQuery): ChannelCollection;
  Action: ChannelEventAction;
  CollectionHandler: ChannelCollectionHandlerStatic;
}
interface ChannelCollection {
  channels: Array<GroupChannel>;
  query: SendBird.GroupChannelListQuery;

  fetch(): Promise<void>;
  fetch(callback:(err: Error) => void): void;
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
  new (channel:GroupChannel, filter:MessageFilter, viewpointTimestamp?:number): MessageCollection;
  Action: MessageEventAction;
  CollectionHandler: MessageCollectionHandlerStatic;
}
interface MessageCollection {
  channel: GroupChannel;
  filter: MessageFilter;
  limit:number;
  messages: Array<Message>;

  fetch(direction: 'prev' | 'next'): Promise<void>;
  fetch(direction: 'prev' | 'next', callback: (err: Error) => void): void;
  resetViewpointTimestamp(viewpointTimestamp: number): void;
  remove(): void;
  
  appendMessage(message:Message): void;
  replaceMessage(message:Message): void;

  setCollectionHandler(handler:MessageCollectionHandler): void;
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
