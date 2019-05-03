
# SendBird SyncManager for JavaScript

SendBird SyncManager is chat data sync management add-on for SendBird. SyncManager offers an event-based data management framework so that each view would listen data event in event handler in order to update the view. And it stores the data into IndexedDB or equivalent storage engine which implements local caching for faster loading.

## Requirement

- Node.js v8.x+

## Installation

```
npm install sendbird-syncmanager
```

## How It Works

### Initialization

```js
// change the path if you put the project into other path
import SendBirdSyncManager from 'sendbird-syncmanager';

const sb = new SendBird({ appId: YOUR_APP_ID });
...

// uncomment if you're using SyncManager in React Native
// import { AsyncStorage } from 'react-native'
// SendBirdSyncManager.useReactNative(AsyncStorage);

// sb doesn't have to be connected to initialize SyncManager.
SendBirdSyncManager.sendBird = sb;
SendBirdSyncManager.setup(USER_ID, () => {
  // do your job here
});
```

> SyncManager version >=1.1.2 officially supports React Native. It contains internal local database engine using AsyncStorage. For reducing the size of the integrated package and avoiding collision of versions, the SyncManager SDK doesn't have dependency with `react-native` package. Please import `AsyncStorage` for your own and call `SendBirdSyncManager.useReactNative(AsyncStorage)` before `setup()` in order to use SyncManager in React Native.

### Collection

Collection is a component to manage data related to a single view. `ChannelCollection` and `MessageCollection` are attached to channel list view and message list view (or chat view) accordingly. The main purpose of Collection is,

- To listen data event and deliver it as view event.
- To fetch data from cache or SendBird server and deliver the data as view event.

To meet the purpose, each collection has event subscriber and data fetcher. Event subscriber listens data event so that it could apply data update into view, and data fetcher loads data from cache or server and sends the data to event handler.

#### ChannelCollection

Channel is mutable data where chat is actively going on - channel's last message and unread message count may update very often. Even the position of each channel is changing drastically since many apps sort channels by the most recent message. In that context, `ChannelCollection` manages synchronization as below:

1. Channel collection fulfills full channel sync (one-time) and change log sync when a collection is created.
   - Full channel sync fetches all channels which match with query. Once the full channel sync reaches to the end, it doesn't do it again later.
   - Change log sync fetches the changes of all channels so that the cache could be up-to-date. The channels fetched by change log sync may get delivered to collection handler if they're supposed to.
2. Then `fetch()` loads channels from cache to show them in the view.
3. (Optional) If fetched channels are not enough (i.e. the number of fetched channels is less than `limit`) and full channel sync is running, then it waits for full channel sync to end. Once the full channel sync is done with the current request, it loads rest of channels from cache.

`ChannelCollection` requires `sb.GroupChannelListQuery` instance as it binds the query into the collection. Then the collection filters data with the query. Here's the code to create new `ChannelCollection` instance.

```js
const query = sb.GroupChannel.createMyGroupChannelListQuery();
// ...setup your query here

const collection = new SendBirdSyncManager.ChannelCollection(query);
```

> Note: Currently SyncManager supports `includeEmpty` and `customTypesFilter` only. Technically other filters may work properly but SendBird doesn't guarantee them to work as expected.

If the view is closed, which means the collection is obsolete and no longer used, remove collection explicitly.

```js
collection.remove();
```

As aforementioned, `ChannelCollection` provides event subscriber. Event subscriber is named as `CollectionHandler` and event handler receives `action` and `channel` when an event has come. The `action` is a keyword to notify what happened to the channel, and the `channel` is the target `sb.BaseChannel` instance. You can create an instance and implement the event handler and add it to the collection.

```js
const collectionHandler = new SendBirdSyncManager.ChannelCollection.CollectionHandler();
collectionHandler.onChannelEvent = (action, channels) => {
  // apply each event to view here
  switch(action) {
    case SendBirdSyncManager.ChannelCollection.Action.INSERT: {
      break;
    }
    case SendBirdSyncManager.ChannelCollection.Action.UPDATE: {
      break;
    }
    case SendBirdSyncManager.ChannelCollection.Action.REMOVE: {
      break;
    }
    case SendBirdSyncManager.ChannelCollection.Action.MOVE: {
      break;
    }
    case SendBirdSyncManager.ChannelCollection.Action.CLEAR: {
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
collection.fetch(() => {
  // This callback is optional and useful to catch the moment of loading ended.
});
```

#### MessageCollection

Message is relatively static data and SyncManager supports full-caching for messages. `MessageCollection` conducts background message sync so that it synchronizes all the messages until it reaches to the end. Background sync does NOT affect view but local cache. For view update, explicitly call `fetch()` which fetches data from cache and sends the data into event handler.

Background sync ceases if the sync is done or sync request is failed.

> Note: Background sync is not in actual background process as JavaScript is running single-threaded. But it does concurrently as if it is doing in background.

For various viewpoint support, `MessageCollection` sets starting point of view (or `viewpointTimestamp`) at creation. The `viewpointTimestamp` is a timestamp to start background sync in both previous and next direction (and also the point where a user actually sees at first). Here's the code to create `MessageCollection`.

```js
const filter = createFilter(); // setup filter
const ts = getLastReadTimestamp(); // or new Date().getTime() if you want to see the most recent messages
const collection = new SendBirdSyncManager.MessageCollection(channel, filter, ts);
```

You can dismiss collection when the collection is obsolete and no longer used.

```js
collection.remove();
```

`MessageCollection` has event subscriber. You can create an instance and implement the event handler and add it to the collection. Event subscriber is named as `CollectionHandler` and event handler receives `action` and `message` when an event has come. The `action` is a keyword to notify what happened to the channel, and the `item` is the target `sb.BaseMessage` instance.

```js
const collectionHandler = new SendBirdSyncManager.MessageCollection.CollectionHandler();
collectionHandler.onMessageEvent = (action, messages) => {
  // apply each event to view here
  switch(action) {
    case SendBirdSyncManager.MessageCollection.Action.INSERT: {
      break;
    }
    case SendBirdSyncManager.MessageCollection.Action.UPDATE: {
      break;
    }
    case SendBirdSyncManager.MessageCollection.Action.REMOVE: {
      break;
    }
    case SendBirdSyncManager.MessageCollection.Action.CLEAR: {
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

Fetched messages would be delivered to event subscriber. Event fetcher determines the `action` automatically so you don't have to consider duplicated data in view.

#### Resetting viewpoint

The feature 'Jump to the most recent messages' is commonly used in chat. If the initial viewpoint is the last viewed timestamp and not the most recent one, the user may want to jump to the most recent messages. In that use case, `collection.resetViewpoint()` would be useful.

```js
const ts = new Date().getTime();
collection.resetViewpointTimestamp(ts);
```

#### Handling uncaught messages

SyncManager listens message event such as `onMessageReceived` and `onMessageUpdated`, and applies the change automatically. But they would not be called if the message is sent by `currentUser`. You can keep track of the message by calling related function when the `currentUser` sends or updates message. `MessageCollection` provides methods to apply the message event to collections.

```js
// call collection.appendMessage() after sending message
const params = new sb.UserMessageParams();
params.message = 'your message';
const previewMessage = channel.sendUserMessage(params, (message, err) => {
  if(!err) {
    collection.appendMessage(message);
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

Once it is delivered to a collection, it'd not only apply the change into the current collection but also propagate the event into other collections so that the change could apply to other views automatically. It works only for messages sent by `currentUser` which means the message sender should be `currentUser`.

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
