# 在庫管理システム

注文、顧客、施工予定日、納期を管理する Web アプリです。
フロントエンドは React + TypeScript、バックエンドは Spring Boot、データベースは PostgreSQL で構成しています。

## 技術構成

- Backend: Java 17 / Spring Boot / Spring Data JPA
- Frontend: React 18 / TypeScript / Vite / MUI
- Database: PostgreSQL 16
- Local DB tools: Docker Compose / pgAdmin

## 起動に必要なもの

- Java 17 以上
- Node.js 18 以上
- Docker Desktop

## 初回セットアップ

### 1. データベースを起動

プロジェクトルートで実行します。

```powershell
docker compose up -d
```

`docker compose` が使えない環境では、以下でも起動できます。

```powershell
docker-compose up -d
```

PostgreSQL は `localhost:5432`、pgAdmin は `http://localhost:5050` で起動します。

pgAdmin:

- Email: `admin@example.com`
- Password: `admin`

### 2. バックエンドを起動

別ターミナルで実行します。

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

バックエンドは `http://localhost:8080` で起動します。

macOS / Linux の場合:

```bash
cd backend
./mvnw spring-boot:run
```

### 3. フロントエンドを起動

さらに別ターミナルで実行します。

```powershell
cd frontend
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

`npm install` は初回、または `package.json` が変わったときだけ実行すれば大丈夫です。

## 通常の起動手順

2回目以降は、基本的に以下の3つを起動します。

```powershell
docker compose up -d
```

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
cd frontend
npm run dev
```

## URL 一覧

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- pgAdmin: `http://localhost:5050`

## 主な画面

- `/` - 注文登録ホーム
- `/orders` - 注文一覧、編集、削除
- `/calendar` - カレンダー表示
- `/customers` - 顧客マスタ管理
- `/alerts` - 納期アラート
- `/orders/new` - 注文登録

## ビルド確認

バックエンド:

```powershell
cd backend
.\mvnw.cmd test
```

フロントエンド:

```powershell
cd frontend
npm run build
```

## 停止方法

バックエンドとフロントエンドは、それぞれ起動中のターミナルで `Ctrl + C` を押して停止します。

PostgreSQL と pgAdmin はプロジェクトルートで停止します。

```powershell
docker compose down
```

データも削除したい場合だけ、ボリューム込みで停止します。

```powershell
docker compose down -v
```

## 環境変数

フロントエンドはデフォルトで `http://localhost:8080` の API を参照します。
API の URL を変えたい場合は、`frontend/.env` を作成して以下を設定します。

```env
VITE_API_BASE_URL=http://localhost:8080
```
