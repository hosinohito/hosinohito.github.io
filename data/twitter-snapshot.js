/*
 * Twitter投稿の静的控え。取得できない環境でも欄を空白にしないためのものです。
 * 個別投稿URLを確認できないものは、アカウントページへのリンクにしています。
 * 投稿本文は公開プロフィールに掲載されていたものの短い抜粋。
 * 自動更新を使う場合は tools/update_twitter.py で上書きできます。
 */
window.TWITTER_SNAPSHOT = {
  fetchedAt: '2026-11-15',
  posts: [
    { text: '春のぷくぷく桜飾り | たなかや', url: 'https://x.com/tanakamitaina', date: '' },
    { text: 'きせつの桜かざりできました。そのうちぶーすにおきます。', url: 'https://x.com/tanakamitaina', date: '' },
    { text: 'v0.1.6をリリースしました。手でアクセサリなどを触れるようになりました。', url: 'https://x.com/tanakamitaina', date: '' }
  ]
};
