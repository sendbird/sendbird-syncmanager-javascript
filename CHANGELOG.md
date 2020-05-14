# Changelog

## v1.1.18(MAY 14, 2020)

- Performance improvement.

## v1.1.17(APR 17, 2020)

- Limit the number of resend retry.
- React Native AsyncStorage bug-fix.

## v1.1.16(FEB 6, 2020)

- Improved stability.

## v1.1.15(DEC 17, 2019)

- Improved stability.

## v1.1.14(NOV 15, 2019)

- Improved stability.

## v1.1.13(NOV 8, 2019)

- Improved stability.

## v1.1.12(OCT 25, 2019)

- Critical bug-fix.

## v1.1.11(OCT 18, 2019)

- Fixed Edge/IE incompatibility.
- Improved stability.

## v1.1.10(OCT 8, 2019)

- Fixed Edge/IE incompatibility.
- Fixed a bug in `memberStateFilter`.
- Improved stability.

## v1.1.9(SEP 27, 2019)

- Fixed TypeScript interface.

## v1.1.8(SEP 6, 2019)

- Improved stability.

## v1.1.7(JUL 31, 2019)

- Added `fetchFailedMessages` in `MessageCollection` to retrieve FailedMessages.
- Added `fetchSucceededMessages` in `MessageCollection` to retrieve SucceededMessages.
- Deprecated `onMessageEvent` in `CollectionHandler`.
- Added `onPendingMessageEvent` in `CollectionHandler` to notify about PendingMessage.
- Added `onFailedMessageEvent` in `CollectionHandler` to notify about FailedMessage.
- Added `onSucceededMessageEvent` in `CollectionHandler` to notify about SucceededMessage.
- Added `onNewMessage` in `CollectionHandler` to inform there is a new message.
- Added `automaticMessageResendRetryCount` in `SendBirdSyncManager.Options` to set count of retry.
- Added `maxFailedMessageCountPerChannel` in `SendBirdSyncManager.Options` to set maximum count of FailedMessage stored local DB.
- Added `failedMessageRetentionDays` in `SendBirdSyncManager.Options` to set days of message retention.

## v1.1.6(JUN 12, 2019)

- Added `SendBirdSyncManager.Options` which is used for message count limit of `MessageCollection` and message resend policy.
- Added `handleSendMessageResponse()` in `MessageCollection` to support resend failed message.

## v1.1.5(MAY 23, 2019)

- TypeScript interface fix.
- Improved stability.

## v1.1.4(MAY 20, 2019)

- Improved stability.

## v1.1.3(MAY 10, 2019)

- Added `MessageCollection.create()`.
  - To create message collection with channelUrl.
- Improved stability.

## v1.1.2(MAY 3, 2019)

- React Native support.
- Improved stability.

## v1.1.1(APR 3, 2019)

- Improved stability.

## v1.1.0(MAR 19, 2019)

- Added channel full-sync support.
- Stabilized and improved performance.

## v1.0.2(FEB 25, 2019)

- Updated collection handler parameters.
- Minor bug-fixes.

## v1.0.1(FEB 18, 2019)

- Applied error code.
- Minor bug-fixes.

## v1.0.0(FEB 8, 2019)

- 1.0.0 release.
