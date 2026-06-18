import type { MetadataRoute } from 'next'

// Beta 測試中：全站禁止搜尋引擎爬取/收錄（對外有網址，但搜不到）。之後要公開再移除。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
