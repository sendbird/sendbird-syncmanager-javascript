
# SendBird SyncManager for Web

SendBird SyncManager is chat data sync management library for SendBird. SyncManager offers an event-based data management framework so that each view would see a single spot by subscribing data event. And it stores the data into IndexedDB or equivalent storage engine which implements local caching for faster loading.

## How It Works

### Initialization

```js
// change the path if you put the project into other path
import SendBirdSyncManager from 'path/to/SendBirdSyncManager';

const sb = new SendBird({ appId: YOUR_APP_ID });
...

// sb doesn't have to be connected to initialize SyncManager.
SendBirdSyncManager.sendBird = sb;
SendBirdSyncManager.setup(USER_ID, () => {
  // do your job here
});
```

### Collection

Collection is a component to manage data related to a single view. `ChannelCollection` and `MessageCollection` are attached to channel list view and message list view (or chat view) accordingly. The main purpose of Collection is,

- To listen data event and deliver it as view event.
- To fetch data from cache or SendBird server and deliver the data as view event.

To meet the purpose, each collection has event subscriber and data fetcher. Event subscriber listens data event so that it could apply data update into view, and data fetcher loads data from cache or server and sends the data to event handler.

#### ChannelCollection

Channel is quite mutable data where chat is actively going - channel's last message and unread message count may update very often. Even the position of each channel is changing drastically since many apps sort channels by the most recent message. For that reason, `ChannelCollection` depends mostly on server sync. Here's the process `ChannelCollection` synchronizes data:

1. It loads channels from cache and the view shows them for fast-loading.
2. Then it fetches the most recent channels from SendBird server and merges with the channels in view.
3. It fetches from SendBird server every time `fetch()` is called in order to view previous channels.

> Note: Channel data sync mechanism could change later.

`ChannelCollection` requires `sb.GroupChannelListQuery` instance as it binds the query into the collection. Then the collection filters data with the query. Here's the code to create new `ChannelCollection` instance.

```js
const query = sb.GroupChannel.createMyGroupChannelListQuery();
// ...setup your query here

const collection = new SendBirdSyncManager.ChannelCollection(query);
```

If the view is closed, which means the collection is obsolete and no longer used, remove collection explicitly.

```js
collection.remove();
```

As aforementioned, `ChannelCollection` provides event handler. Event handler is named as `CollectionHandler` and it receives `action` and `channel` when an event has come. The `action` is a keyword to notify what happened to the channel, and the `channel` is the target `sb.BaseChannel` instance. You can create an instance and implement the event handler and add it to the collection.

```js
const ChannelEventAction = SendBirdSyncManager.ChannelCollection.Action;
const collectionHandler = new SendBirdSyncManager.ChannelCollection.CollectionHandler();
collectionHandler.onChannelEvent = (action, channel) => {
  // apply each event to view here
  switch(action) {
    case ChannelEventAction.INSERT: {
      break;
    }
    case ChannelEventAction.UPDATE: {
      break;
    }
    case ChannelEventAction.REMOVE: {
      break;
    }
    case ChannelEventAction.MOVE: {
      break;
    }
    case ChannelEventAction.CLEAR: {
      break;
    }
  }
};
collection.setCollectionHandler(collectionHandler);

// you can cancel event subscription by calling removeCollectionHandler() like:
collection.removeCollectionHandler();
```

And data fetcher. Fetched channels would be delivered to event subscriber. Event fetcher determines the `action` automatically so you don't have to consider duplicated data in view.

```js
collection.fetch(err => {
  // This callback is optional and useful to catch the moment of loading ended.
});
```

#### MessageCollection

Message is relatively static data and SyncManager supports full-caching for messages. `MessageCollection` conducts background sync so that it synchronizes all the messages until it reaches to the end. Background sync does NOT affect view directly but sync local cache. For view update, explicitly call `fetch()` which fetches data from cache and sends the data into collection handler.

Background sync ceases if the sync is done or sync request is failed.

> Note: Background sync is not in actual background process as JavaScript runs single-threaded. But it does the work concurrently as if it is doing in background.

For various viewpoint support, `MessageCollection` sets starting point of view (or `viewpointTimestamp`) at creation. The `viewpointTimestamp` is a timestamp to start background sync in both previous and next direction (and also the point where a user sees at first). Here's the code to create `MessageCollection`.

```js
const filter = {
  messageTypeFilter: messageTypeFilter,
  customTypeFilter: customTypeFilter,
  senderUserIdsFilter: senderUserIdsFilter
};
const viewpointTimestamp = getLastReadTimestamp();
// or new Date().getTime() if you want to see the most recent messages

const collection = new SendBirdSyncManager.MessageCollection(channel, filter, viewpointTimestamp);
```

You can dismiss collection when the collection is obsolete and no longer used.

```js
collection.remove();
```

`MessageCollection` has event handler that you can implement and add to the collection. Event handler is named as `CollectionHandler` and it receives `action` and `message` when an event has come. The `action` is a keyword to notify what happened to the channel, and the `item` is the target `sb.BaseMessage` instance.

```js
const MessageEventAction = SendBirdSyncManager.MessageCollection.Action;
const collectionHandler = new SendBirdSyncManager.MessageCollection.CollectionHandler();
collectionHandler.onMessageEvent = (action, message) => {
  // apply each event to view here
  switch(action) {
    case MessageEventAction.INSERT: {
      break;
    }
    case MessageEventAction.UPDATE: {
      break;
    }
    case MessageEventAction.REMOVE: {
      break;
    }
    case MessageEventAction.CLEAR: {
      break;
    }
  }
};
collection.setCollectionHandler(collectionHandler);

// you can cancel event subscription by calling unsubscribe() like:
collection.removeCollectionHandler();
```

`MessageCollection` has data fetcher by direction: `prev` and `next`. It fetches data from cache only and never request to server. If no more data is available in a certain direction, it subscribes the background sync internally and fetches the synced messages right after the sync progresses.

```js
collection.fetch('prev', err => {
  // Fetching from cache is done
});
collection.fetch('next', err => {
  // Fetching from cache is done
});
```

Fetched messages would be delivered to event handler. Event fetcher determines the `action` automatically so you don't have to consider duplicated data in view.

#### Handling uncaught messages

SyncManager listens message event such as `onMessageReceived` and `onMessageUpdated`, and applies the change automatically. But they would not be called if the message is sent by `currentUser`. You can keep track of the message by calling related function when the `currentUser` sends or updates message. `MessageCollection` provides methods to apply the message event to collections.

```js
// call collection.appendMessage() after sending message
const params = new sb.UserMessageParams();
params.message = 'your message';
const previewMessage = channel.sendUserMessage(params, (message, err) => {
  if(!err) {
    collection.appendMessage(message);
  } else {
    // delete preview message if sending message fails
    collection.deleteMessage(previewMessage);
  }
});
collection.appendMessage(previewMessage);

// call collection.updateMessage() after updating message
const params = new sb.UserMessageParams();
params.message = 'updated message';
channel.updateUserMessage(message.messageId, params, (message, err) => {
  if(!err) {
    collection.updateMessage(message);
  }
});
```

It works only for messages sent by `currentUser` which means the message sender should be `currentUser`.

### Connection Lifecycle

You should detect connection status change and let SyncManager know the event. Call `resumeSync()` on connection, and `pauseSync()` on disconnection. Here's the code:

```js
const manager = SendBirdSyncManager.getInstance();
manager.resumeSync();

const manager = SendBirdSyncManager.getInstance();
manager.pauseSync();
```

The example below shows how to detect connection status and resume synchronization using `ConnectionHandler`. It detects disconnection automatically by `SendBird` and tries `reconnect()` internally.

```js
const manager = SendBirdSyncManager.getInstance();
const connectionHandler = new sb.ConnectionHandler();
connectionHandler.onReconnectStarted = () => {
  manager.pauseSync();
};
connectionHandler.onReconnectSucceeded = () => {
  manager.resumeSync();
};
sb.addConnectionHandler(UNIQUE_CONNECTION_HANDLER_KEY, connectionHandler);
```

`ConnectionHandler` cannot detect the moment you call `connect()` or `disconnect()`. If you need to check it manually in case you call `connect()` and `disconnect()` explicitly, use an interval timer instead in order to detect connection state change.

```js
const manager = SendBirdSyncManager.getInstance();
let currentConnectionStatus = sb.getConnectionState();
setInterval(() => {
  const latestConnectionStatus = sb.getConnectionState();
  if(currentConnectionStatus !== sb.ConnectionState.CLOSED
    && latestConnectionStatus === sb.ConnectionState.CLOSED) {
    manager.pauseSync();
  } else if(currentConnectionStatus !== sb.ConnectionState.OPEN
    && latestConnectionStatus === sb.ConnectionState.OPEN) {
    manager.resumeSync();
  }
  currentConnectionStatus = latestConnectionStatus;
},
CONNECTION_CHECK_INTERVAL);
```

### Cache clear

Clearing cache is necessary when a user signs out.

```js
const manager = SendBirdSyncManager.getInstance();
manager.clearCache();
```

> WARNING! DO NOT call `sb.removeAllChannelHandlers()`. It does not only remove handlers you added, but also remove handlers managed by SyncManager.