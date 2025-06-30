---
title: API Gateway
sidebar_position: 20
---

# API Gateway

API Gateway は 443/TCP でクライアントからの接続を受け付け、アプリケーションの Web UI や外部連携のための API を提供する。

## DNS 連携

## TLS通信

API Gateway では、以下の処置により、全ての通信を TLS で暗号化して行います。
- サーバ証明書がない状態で受信したリクエストはすべて 400 のエラーで返す
- http 80 番ポートに受信した場合、 301 で https にリダイレクトする
- 全ての通信のレスポンスヘッダーに HSTS ヘッダーを付与する
```
Strict-Transport-Security: max-age=<seconds>; includeSubDomains; preload
```
- [HSTS プリロードリスト](https://hstspreload.org/)にサイトを登録する

### サーバ証明書の自動更新

Lets encrypt によりサーバ証明書を自動的に取得します。

### mTLS認証
（未検討）
https://github.com/cloudflare/pingora/issues/594

## プロセスワークフロー

API Gateway ではプロセスワークフロー機能を提供する。