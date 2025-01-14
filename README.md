# AWS Badge Diplay

AWS認定デジタルバッジを並び替えるアプリケーションです。

## 機能

- Credlyからダウンロードしたデジタルバッジファイルをアップロードし、並び替えたものをダウンロードすることができます。
- 2025年1月15日現在で有効である資格15種類に対応しています。

## 対応資格

- Cloud Practitioner
- Solutions Architect Associate
- Solutions Architect Professional
- Developer Associate
- SysOps Administrator Associate
- Data Analytics Specialty
- Machine Learning Specialty
- Advanced Networking Specialty
- Security Specialty
- DevOps Engineer Professional
- DataBase Specialty
- SAP on AWS Professional
- Data Engineer Associate
- Machine Learning Associate
- AI Practitioner

## 資格の追加

追加で対応させたい資格がある場合、[src/config/aws-certifications.ts](src/config/aws-certifications.ts)に追記することで並び替えることができます。

```ts
export const AWS_CERTIFICATIONS = [
  {
    code: "NEW",
    name: "New Certification",
    expectedFileName: "aws-certified-new-certification.png",
  },
  // 他の資格情報...
];
```
# 使用方法
1. リポジトリをクローンします。
2. 必要な依存関係をインストールします。
```
npm install
```
3. 開発サーバーを起動します。
```
npm run dev
```
4. ブラウザでアプリケーションにアクセスします。
5. Credlyからダウンロードしたデジタルバッジファイルをアップロードし、並び替えたものをダウンロードします。
