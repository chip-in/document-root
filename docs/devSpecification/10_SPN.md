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

SPN エンドポイントは QUIC で SPN Hub に接続するクライアントです。SPNエンドポイントは SPN create を使用して rust で開発することが可能です。
また、SPN エージェントを利用して、TCPのクライアント/サーバにも接続できます。

## SPN セッション

SPN セッションは QUIC のコネクションと同義ですが、SPNのコネクションとの混同を避けるためにあえて、SPN セッションと呼びます。
この他に Chip-in では HTTP のセッションやコネクションも登場しますが、それらとも区別してください。

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
この API の定義はインベントリ

### spnhub コマンド

spnhub コマンドは SPN Hub を実装しています。spnhub コマンドのパラメータはコマンドラインオプションと環境変数のいずれかで指定できます。
パラメータには以下のものがあります。

|オプション|環境変数名|説明|デフォルト|
|--|--|--|--|
|-c |SPNHUB_SERVICES_PATH|SPNHUBのサービス定義ファイルのパス。形式は API の Swagger の components.schema.Service で規定された JSON オブジェクトの配列|/etc/spnhub/spn-services.yml|
|-C |SPNHUB_CA_CERT_PATH|mTLSにおけるクライアント証明書を発行したCA局の証明書(PEM形式)のパス。環境変数SPNHUB_CA_CERTが指定されている場合は無視される。|/etc/pki/tls/cert/spnca.crt|
||SPNHUB_CA_CERT|mTLSにおけるクライアント証明書を発行したCA局の証明書(PEM形式)の文字列||
|-h|SPNHUB_FQDN|SPN Hub のサーバのFQDN|core.stg.chip-in.net|
|-s |SPNHUB_SERVER_CERT_PATH|mTLSにおけるサーバ証明書(PEM形式)のパス。環境変数 SPNHUB_SERVER_CERT が指定されている場合は無視される。|/etc/pki/tls/cert/$SPNHUB_FQDN.crt|
||SPNHUB_SERVER_CERT|mTLSにおけるサーバ証明書(PEM形式)の文字列||
|-k |SPNHUB_SERVER_CERT_KEY_PATH|mTLSにおけるサーバ証明書の秘密鍵(PEM形式)のパス。環境変数 SPNHUB_SERVER_CERT_KEY が指定されている場合は無視される。|/etc/pki/tls/private/$SPNHUB_FQDN.key|
||SPNHUB_SERVER_CERT_KEY|mTLSにおけるサーバ証明書の秘密鍵(PEM形式)の文字列||

/etc/spnhub/spn-services.yml の例
```yaml
- urn: urn:chip-in:service:example-realm:clusterManager:aws-fargate:apn1-northeast
  title: AWS fargate 東京リージョンクラスタマネージャ
  providers:
    - aws-fargate-apn1-northeast.devops.exmaple.com
  consumer:
    - availablity-manager.devops.example.com # SPN hub 本体からの要求のみ受け付ける。このように要検討
- urn: urn:chip-in:service:example-realm:authz-rbac
  title: ロールベース認可サービス
  availabilityManagement:
    clusterManagerUrn: urn:chip-in:service:example-realm:clusterManager:aws-fargate:apn1-northeast
    serviceId: authz-rbac
    ondemandStart: true
    idelTimeout: 300
  providers:
    - authz-rbac.devops.example.com
  consumer:
    - api-gateway.devops.example.com
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
    certificate: &str,
    certificate_key: &str
) -> Result<impl spnConsumerEndPoint, SpnError>
```

- **引数**
  - `spnHubUrl`: SPN ハブの URL
  - `serviceUrn`: サービスの URN
  - `certificate`: PEM形式のクライアント証明書
  - `certificate_key`: PEM形式のクライアント証明書の秘密鍵
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
    "urn:chip-in:service:example-realm:foo",
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
    certificate: &str,
    certificate_key: &str
) -> Result<impl spnProviderEndPoint, SpnError>
```

- **引数**
  - `spnHubUrl`: SPN ハブの URL
  - `serviceUrn`: サービスの URN
  - `certificate`: PEM形式のクライアント証明書
  - `certificate_key`: PEM形式のクライアント証明書の秘密鍵
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
    "urn:chip-in:service:example-realm:foo",
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
|SPN_CERTIFICATE|クライアント証明書|PEM形式のクライアント証明書|
|SPN_CERTIFICATE_KEY|クライアント証明書秘密鍵|PEM形式のクライアント証明書の秘密鍵|
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
|SPN_CERTIFICATE|クライアント証明書|PEM形式のクライアント証明書|
|SPN_CERTIFICATE_KEY|クライアント証明書秘密鍵|PEM形式のクライアント証明書の秘密鍵|
|FORWARD_ADDRESS|SPN Hub からの接続を転送するアドレス|`127.0.0.1:8080`|

起動すると、SPN Hub に接続し、SPN セッションを確立します。
SPN Hub からの接続を待ち受け、接続があるごとに、SPN Hub 経由でSPNコネクションを確立し FORWARD_ADDRESS にプロキシ転送します。
