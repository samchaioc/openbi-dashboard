# OpenBI Dashboard

餐飲數據儀表板，部署於 Cloudflare Workers。

## 部署

```bash
# 安裝依賴
npm install

# 本地測試
npx wrangler dev

# 部署到 Cloudflare
npx wrangler deploy
```

## 配置

修改 `worker.js` 中的 `CONFIG.OPENBI_INDEX_URL` 為你的 Google Sheets CSV 導出鏈接。

## 功能

- 月度銷售趨勢圖
- 門店銷售排行
- 數據月份篩選
- 門店篩選