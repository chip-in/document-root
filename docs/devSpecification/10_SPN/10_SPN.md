---
title: SPN
sidebar_position: 10
---

# SPN

SPN は Chip-in 内部で閉鎖されたプライベートなネットワークで、 mTLS 認証によって相互認証し、暗号化されます。
SPN Hub を中心として SPN エンドポイントから QUIC プロトコルで接続することで仮想的なネットワークを構築します。
QUIC上のストリームを TCP コネクションとして使用することで、TCP 通信と互換性を持っており、 SPN エージェントを使用することでマイクロサービス間でTCP通信を行えます。

![SPNSessions](imgs/SPNSessions.drawio.svg)

上記はユーザが API Gateway にアクセスし、それがプロキシされて SPN 経由でロジックサービスにアクセスし、ロジックサービスが SPN 経由でDBMSにアクセスする様子を表しています。

## SPN Hub

SPN Hub では SPN エンドポイントからの QUIC での接続を受け付けて、仮想的で閉じたネットワークを提供します。

## SPN エンドポイント

SPN エンドポイントは QUIC で SPN Hub に接続するクライアントです。SPNエンドポイントは SPN create を使用して rust で開発することが可能ですが、 SPN エージェントを利用することで、TCPのクライアント/サーバに接続することができます。

## SPN セッション

SPN セッションは QUIC のコネクションと同義ですが、SPNのコネクションとの混同を避けるためにあえて、SPN セッションと呼ぶことにします。
この他に Chip-in では HTTP のセッションやコネクションも登場しますが、そちらとも区別いただくようお願いします。

QUIC コネクション確立後、最初に SPN エンドポイントから SPN Hub に向かって制御ストリームを開始します。制御ストリームの最初の通信として SPN エンドポイントはSPN hub に SPN セッション確立要求を送信します。
SPN Hub は、セッション確立要求が SPN 内のサービス定義に照らし合わせて許容されていれば SPN エンドポイントにACKを返すとともに SPN セッションオブジェクトをメモリ上に作成します。
セッション確立後も制御ストリームは接続した状態となり、さまざまな制御パケットの通信に使用されます。

SPN セッションオブジェクトには以下が保持されます。

|項目名|説明|
|--|--|
|startAt|セッション開始時刻|
|spnSessionId|セッションID（QUIC のサーバ側コネクションIDを使用する）|
|spnEndPoint|QUICコネクションの確立に使用されたクライアント証明書の Subject の値|
|endPointType|"serviceProvider", "serviceConsumer" のいずれか|
|serviceUrn|セッションのサービスのエンドポイントのURN|
|totalConnectionCount|このセッション上で作成された SPNコネクションの総数|

SPN　セッションはセッションの開設時と終了時にログを出力します。ログの項目は以下の通り。

|項目名|説明|
|--|--|
|timestamp|イベント発生時刻（ログの出力時刻と異なる場合があるのでイベント発生時の時刻を記録する）|
|spnSessionId|セッションID（QUIC のサーバ側コネクションIDを使用する）|
|spnEndPoint|QUICコネクションの確立に使用されたクライアント証明書の Subject の値|
|eventType|"startSpnSession", "endSpnSession" のいずれか|
|endPointType|"serviceProvider", "serviceConsumer" のいずれか|
|serviceUrn|セッションのサービスのURN|
|totalConnectionCount|このセッション上で作成された SPNコネクションの総数。endSpnSession のときのみ出力される|
|elapsedTime|セッション開設時からの経過時間。endSpnSession のときのみ出力される|
|terminateReason|セッションの終了理由。"shutdown", "terminatedByPeer", "error" のいずれか。endSpnSession のときのみ出力される|

## SPN コネクション

SPN コネクションは QUIC のコネクションと異なり、serviceConsumer エンドポイントから SPN Hub を経由して serviceProvider エンドポイントに接続するストリームです。
SPN コネクションは以下の構成要素からなります。
- serviceConsumer エンドポイントと SPN Hub の間の双方向 QUIC ストリーム
- SPN Hub と serviceProvider エンドポイントの間の双方向 QUIC ストリーム
- SPN コネクション管理オブジェクト

SPNコネクションの確立は
1. serviceConsumer エンドポイントは SPN Hub との間の双方向 QUIC ストリーム上に最初のパケットを送る
2. SPN Hub は serviceProvider エンドポイントとの間の双方向 QUIC ストリーム上にそのパケットを転送する
SPN コネクションオブジェクトには以下が保持されます。

|項目名|説明|
|--|--|
|startAt|コネクション開始時刻|
|spnConnectionId|SPNコネクションID（QUIC のストリームIDを serviceConsumer側、serviceProvider側の順に連結したものを使用する）|
|consumerSideSpnSessionId|serviceConsumer側 SPN セッションのID|
|providerSideSpnSessionId|serviceProvider側 SPN セッションのID|
|totalSentBytes|このストリーム上で serviceConsumerからserviceProviderに送信したデータの累計バイト数|
|totalReceiveBytes|このストリーム上で serviceConsumer がserviceProviderから受信したデータの累計バイト数|

SPN　セッションはセッションの開設時と終了時にログを出力します。ログの項目は以下の通り。

|項目名|説明|
|--|--|
|timestamp|イベント発生時刻（ログの出力時刻と異なる場合があるのでイベント発生時の時刻を記録する）|
|spnConnectionId|SPNコネクションID（QUIC のストリームIDを serviceConsumer側、serviceProvider側の順に連結したものを使用する）|
|eventType|"startSpnConnection", "endSpnConnection" のいずれか|
|consumerSideSpnSessionId|serviceConsumer側 SPN セッションのID|
|providerSideSpnSessionId|serviceProvider側 SPN セッションのID|
|totalSentBytes|このストリーム上で serviceConsumerからserviceProviderに送信したデータの累計バイト数。 endSpnConnection のときのみ出力される|
|totalReceiveBytes|このストリーム上で serviceConsumer がserviceProviderから受信したデータの累計バイト数。 endSpnConnection のときのみ出力される|
|elapsedTime|コネクション開設時からの経過時間。 endSpnConnection のときのみ出力される|
|disconnectReason|コネクションの切断理由。"closedByPeer", "closed", "error" のいずれか。 endSpnConnection のときのみ出力される|

## SPN Hub Controle API

SPN Hub Controle API では SPN 内のサービスとアクセス制御を定義できます。
SPN Hub は 127.0.0.1:8080 ポートで listen しています。
この API の Swaggerの定義は以下の通り。

```yaml
openapi: 3.0.4
info:
  title: SPN API
  description: |-
    これは SPN のサービス定義とアクセス制御を管理するためのAPIである。
  contact:
    email: mitsuru@procube.jp
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 1.0.0
servers:
  - url: https://127.0.0.1:8080
tags:
  - name: service
    description: SPN経由で提供されるマイクロサービス
  - name: urn
    description: リソースを一意に特定するための文字列
    externalDocs:
      description: Uniform Resource Names
      url: https://tex2e.github.io/rfc-translater/html/rfc8141.html
paths:
  /services:
    put:
      tags:
        - service
        - urn
      summary: Update an existing service.
      description: Update an existing service by service URN.
      operationId: updateService
      requestBody:
        description: Update an existent service in the SPN
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Service'
        required: true
      responses:
        '200':
          description: Successful operation, return the new contents.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Service'
        '400':
          description: Invalid URN supplied
        '404':
          description: Service not found
        '422':
          description: Validation exception
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    post:
      tags:
        - service
      summary: Add a new service to the SPN.
      description: Add a new service to the store.
      operationId: addService
      requestBody:
        description: Create a new service in the store
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Service'
        required: true
      responses:
        '200':
          description: Successful operation, return the new contents.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Service'
        '400':
          description: Invalid input
        '422':
          description: Validation exception
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    get:
      tags:
        - service
      summary: Finds Services
      description: get list of services.
      operationId: listServices
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Service'
        '400':
          description: Invalid status value
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /service/{serviceUrn}:
    get:
      tags:
        - service
      summary: Find service by urn.
      description: Returns a single service.
      operationId: getServiceByUrn
      parameters:
        - name: serviceUrn
          in: path
          description: URN of service to return
          required: true
          schema:
            type: string
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Service'
        '400':
          description: Invalid URN supplied
        '404':
          description: Service not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    delete:
      tags:
        - service
      summary: Deletes a service.
      description: Delete a service.
      operationId: deleteService
      parameters:
        - name: serviceUrn
          in: path
          description: Pet id to delete
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Service deleted
        '400':
          description: Invalid URN value
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Service:
      required:
        - urn
      type: object
      properties:
        urn:
          type: string
          example: urn:chip-in:service:example.com:authz
        providers:
          type: array
          items:
            type: string
          description: |-
            当該サービスの提供が許可されるエンドポイント
            クライアント証明書の Subject の値と照合される
          example:
            - oidc-authz-provider
        consumers:
          type: array
          items:
            type: string
          description: |-
            当該サービスの利用が許可されるエンドポイント
            クライアント証明書の Subject の値と照合される
          example:
            - api-gateway
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
      required:
        - code
        - message
  requestBodies:
    Service:
      description: Service object that needs to be added to the SPN
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Service'
```

## SPN エンドポイント crate

### 概要

この crate は SPN (Service Provider Network) のエンドポイントを提供します。  
SPN セッションの確立と、双方向ストリームによる通信をサポートします。

### Consumer エンドポイント

#### `createSpnConsumerEndPoint`関数

```rust
async fn createSpnConsumerEndPoint(
    spnHubUrl: &str,
    serviceUrn: &str,
    certificateFilePath: &str
) -> Result<impl spnConsumerEndPoint, SpnError>
```

- **引数**
  - `spnHubUrl`: SPN ハブの URL
  - `serviceUrn`: サービスの URN
  - `certificateFilePath`: クライアント証明書ファイルのパス
- **戻り値**  
  SPN セッションが確立された `spnConsumerEndPoint` インタフェースのハンドル。エラー時は `SpnError`。
- **主なエラー例**
  - クライアント証明書の読み込み失敗
  - ネットワークエラー
  - SPN Hub からの拒否

#### `spnConsumerEndPoint` インタフェース

- **メソッド**
  - `async fn connect(&self, stream: BiDirectionalStream) -> Result<(), SpnError>`
    - 呼び側が事前に準備した双方向ストリームをSPNコネクションに接続する。エラー時は `SpnError`。

#### 利用例

```rust
let endpoint = createSpnConsumerEndPoint(
    "https://spn-hub.example.com",
    "urn:example:service",
    "/path/to/cert.pem"
).await?;

let my_stream = BiDirectionalStream::new(/* ... */);
endpoint.connect(my_stream).await?;
// my_stream を使って双方向通信を行う
```
### Provider エンドポイント

#### `createSpnProviderEndPoint`

```rust
async fn createSpnProviderEndPoint(
    spnHubUrl: &str,
    serviceUrn: &str,
    certificateFilePath: &str
) -> Result<impl spnProviderEndPoint, SpnError>
```

- **引数**
  - `spnHubUrl`: SPN ハブの URL
  - `serviceUrn`: サービスの URN
  - `certificateFilePath`: プロバイダ証明書ファイルのパス
- **戻り値**  
  SPN セッションが確立された `spnProviderEndPoint` インタフェースのハンドル。エラー時は `SpnError`。
- **主なエラー例**
  - プロバイダ証明書の読み込み失敗
  - ネットワークエラー
  - SPN Hub からの拒否

#### `spnProviderEndPoint` インタフェース

- **メソッド**
  - `async fn listen(&self) -> Result<spnProviderRequest, SpnError>`
    - 新たな SPN コネクションの接続を待ち受け、接続されると `spnProviderRequest` インタフェースを返す。エラー時は `SpnError`。

#### `spnProviderRequest` インタフェース

- **メソッド**
  - `async fn accept(&self) -> Result<BiDirectionalStream, SpnError>`
    - SPN コネクションを接続し、双方向ストリームを返す。エラー時は `SpnError`。

### 利用例

```rust
let provider = createSpnProviderEndPoint(
    "https://spn-hub.example.com",
    "urn:example:service",
    "/path/to/cert.pem"
).await?;

let request = provider.listen().await?;
let stream = request.accept().await?;
// stream を使って双方向通信を行う
```

## SPN エージェント

SPN エージェントは SPN Hub に接続し、SPN セッションを確立するためのエージェントです。
SPN Comsumer エージェントと SPN Provider エージェントの2つのタイプがあります。

### SPN Consumer エージェント
SPN Consumer エージェントは SPN Hub に接続し、SPN セッションを確立するためのエージェントです。
パラメータは環境変数で指定します。指定できる環境変数は以下の通りです。

|環境変数名|説明|値の例|
|--|--|--|
|SPN_HUB_URL|SPN Hub の URL|`https://spn-hub.example.com`|
|SPN_SERVICE_URN|サービスの URN|`urn:example:service`|
|SPN_CERTIFICATE_FILE_PATH|クライアント証明書ファイルのパス|`/path/to/cert.pem`|
|BIND_ADDRESS|エージェントが listen するバインドアドレス|`127.0.0.11:8080`|

起動すると、SPN Hub に接続し、SPN セッションを確立します。
BIND_ADDRESS にクライアントからの接続があるごとに、SPN Hub 経由でSPNコネクションを確立しサービスのプロバイダに接続します。

### SPN Provider エージェント
SPN Provider エージェントは SPN Hub に接続し、SPN セッションを確立するためのエージェントです。
パラメータは環境変数で指定します。指定できる環境変数は以下の通りです。
|環境変数名|説明|値の例|
|--|--|--|
|SPN_HUB_URL|SPN Hub の URL|`https://spn-hub.example.com`|
|SPN_SERVICE_URN|サービスの URN|`urn:example:service`|
|SPN_CERTIFICATE_FILE_PATH|プロバイダ証明書ファイルのパス|`/path/to/cert.pem`|
|FORWARD_ADDRESS|SPN Hub からの接続を転送するアドレス|`127.0.0.1:8080`|

起動すると、SPN Hub に接続し、SPN セッションを確立します。
SPN Hub からの接続を待ち受け、接続があるごとに、SPN Hub 経由でSPNコネクションを確立し FORWARD_ADDRESS にプロキシ転送します。
