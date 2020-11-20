# [Sendbird](https://sendbird.com) SyncManager for JavaScript

![Platform](https://img.shields.io/badge/platform-JAVASCRIPT-orange.svg)
![Languages](https://img.shields.io/badge/language-JAVASCRIPT-orange.svg)
[![npm](https://img.shields.io/npm/v/sendbird-syncmanager.svg?style=popout&colorB=red)](https://www.npmjs.com/package/sendbird-syncmanager)

## Table of contents

  1. [Introduction](#introduction)
  1. [Before getting started](#before-getting-started)
  1. [Getting started](#getting-started)

<br />

## Introduction

SyncManager for JavaScript is a [Chat SDK](https://github.com/sendbird/SendBird-SDK-JavaScript) add-on that optimizes the user caching experience by interlinking the synchronization of the local data storage with the chat data in Sendbird server through an event-driven structure.

### How it works

SyncManager leverages local caching and synchronizes the chat data between the local storage and Sendbird server. By handling the operations in an event-driven structure, the add-on provides a simplified Chat SDK integration and a better user experience. 

### Operations

- **Background sync** occurs whenever there is a connection and automatically stores data fetched from Sendbird server into the local cache. 
- **Real time sync** occurs all the time; it identifies, stores, and delivers the real-time events received from WebSocket connection. 
- **Offline mode** ensures your client app is operational during offline mode, meaning that even without background sync, the view can display cached data. 

### More about Sendbird SyncManager for JavaScript

Find out more about Sendbird SyncManager for JavaScript on [SyncManager for JavaScript doc](https://sendbird.com/docs/syncmanager/v1/javascript/getting-started/about-syncmanager). If you have any comments or questions regarding bugs and feature requests, visit [Sendbird community](https://community.sendbird.com). 

<br />

## Before getting started

This section shows the prerequisites you need to check to use Sendbird SyncManager for JavaScript.

### Requirements 

The minimum requirements for SyncManager for Javascript are:

- `Node.js v10+`
- `NPM v6+`
- `Sendbird Chat SDK for JavaScript v3.0.115+`

### Supported browsers

Apart from browsers that don’t provide `IndexDB`, SyncManager supports all browsers that Sendbird Chat SDK for JavaScript also supports. Since access to local storage is restricted during private browsing in `Firefox` or `InPrivate in Edge`, SyncManager automatically detects the browsing mode and uses memory-based cache instead.

<br />

## Getting started

This section gives you information you need to get started with Sendbird SyncManager for JavaScript. 

### Try the sample app

Download the sample app to test the core features of SyncManager for Javascript. 

- https://github.com/sendbird/SendBird-JavaScript/tree/master/web-basic-sample-syncmanager

> **Note**: The fastest way to test our SyncManager is to build your chat app on top of our sample app. Make sure to change the application ID of the sample app to your own. Go to the [Create a Sendbird application from your dashboard section](#step-1-create-a-sendbird-application-from-your-dashboard) to learn more.

### Step 1: Create a Sendbird application from your dashboard

A Sendbird application comprises everything required in a chat service including users, message, and channels. To create an application:

1. Go to the Sendbird Dashboard and enter your email and password, and create a new account. You can also sign up with a Google account.
2. When prompted by the setup wizard, enter your organization information to manage Sendbird applications.
3. Lastly, when your dashboard home appears after completing setup, click **Create +** at the top-right corner.

Regardless of the platform, only one Sendbird application can be integrated per app; however, the application supports communication across all Sendbird’s provided platforms without any additional setup. 

> **Note**: All the data is limited to the scope of a single application, thus users in different Sendbird applications are unable to chat with each other. 

### Step 2: Download SyncManager for Javascript

Sendbird SyncManager currently supports iOS, Android, and JavaScript SDKs. You can download SyncManager for Javascript from our GitHub repository.

### Step 3: Install SyncManager for Javascript 

SyncManager for JavaScript is distributed through NPM. 

Install using the following code: 

```bash
~$ npm install `sendbird-syncmanager`
```
