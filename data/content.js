/*
 * 【日常の更新は原則このファイルだけ】
 * works: 作品一覧 / notes: 記事一覧 / recent: 手動で確認した公開履歴。
 * recent.date は YYYY-MM-DD または YYYY-MM の形。正確な日付が不明なら月まででよい。
 * recent.source は BOOTH / GitHub / note / Twitter など。Twitterは本人の制作投稿への
 * 個別URLを確認できた場合だけ追加。枠数上限は recent.maxTwitterInRecent に従います。
 * id は重複させず、URLは必ず公開ページを指すようにしてください。
 * ページ構造、テーマ、描画処理は通常変更しません。
 */
window.SITE_DATA = {
  "settings": {
    "twitterHandle": "tanakamitaina",
    "twitterAvatar": "https://pbs.twimg.com/profile_images/1612399140432130050/uIvCOBA0_400x400.jpg",
    "githubUser": "hosinohito",
    "recentCount": 5,
    "weatherDefault": "tokyo",
    "featuredIds": ["booth-9137355", "github-tanakacap"],
    "weatherCities": [
      {
        "id": "tokyo",
        "name": "東京",
        "latitude": 35.68,
        "longitude": 139.69
      },
      {
        "id": "sendai",
        "name": "仙台",
        "latitude": 38.27,
        "longitude": 140.87
      },
      {
        "id": "sapporo",
        "name": "札幌",
        "latitude": 43.06,
        "longitude": 141.35
      },
      {
        "id": "osaka",
        "name": "大阪",
        "latitude": 34.69,
        "longitude": 135.5
      },
      {
        "id": "fukuoka",
        "name": "福岡",
        "latitude": 33.59,
        "longitude": 130.4
      }
    ],
    "maxTwitterInRecent": 1,
    "maxGithubInRecent": 2,
    "maxBoothInRecent": 2,
    "maxNoteInRecent": 2,
    "refreshMinutes": 20,
    "enableFxTwitterRecent": true
  },
  "works": [
    {
      "id": "booth-9137355",
      "group": "booth",
      "title": "春のぷくぷく桜飾り",
      "category": "3Dアクセサリー",
      "date": "2026.11",
      "description": "きらきら光る、ぷくっとした桜の髪飾り。下のパーツがゆらゆら揺れるアクセサリー。",
      "url": "https://booth.pm/ja/items/9137355",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/9137355/07912100-728c-4a4e-b20e-b00c19bcc71f_base_resized.jpg",
      "symbol": "✿",
      "tags": [
        "3Dモデル",
        "VRChat",
        "lilToon"
      ]
    },
    {
      "id": "booth-6030498",
      "group": "booth",
      "title": "ふわもこうさみみ [HAOLAN]",
      "category": "3Dアクセサリー",
      "date": "2024.08",
      "description": "ハオランに合わせて制作した、ふわふわのうさぎ耳。角度・サイズの調整も可能。",
      "url": "https://booth.pm/ja/items/6030498",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/6030498/4f47db2c-40c4-4b8e-8fc8-b0edf052ba0b_base_resized.jpg",
      "symbol": "✧",
      "tags": [
        "3Dモデル",
        "VRChat",
        "HAOLAN"
      ]
    },
    {
      "id": "booth-5555778",
      "group": "booth",
      "title": "アイカバー [HAOLAN]",
      "category": "3Dアクセサリー",
      "date": "2024.03",
      "description": "80年代SFのサングラスから着想した、ハオラン向けのアイカバー。",
      "url": "https://booth.pm/ja/items/5555778",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/5555778/482f6aa6-1f3a-434a-8745-105854fcdbfc_base_resized.jpg",
      "symbol": "◇",
      "tags": [
        "3Dモデル",
        "VRChat",
        "HAOLAN"
      ]
    },
    {
      "id": "booth-4984980",
      "group": "booth",
      "title": "はいくおりてぃ麦わら帽子 耳付き！",
      "category": "3Dファッション",
      "date": "2023",
      "description": "耳付きの麦わら帽子。7色・14パターンでコーディネートを楽しめる作品。",
      "url": "https://booth.pm/ja/items/4984980",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/4984980/2d8ac2eb-60c8-47d1-9fac-b1413570cd29_base_resized.jpg",
      "symbol": "❋",
      "tags": [
        "3Dモデル",
        "アクセサリー",
        "カラー展開"
      ]
    },
    {
      "id": "booth-4991077",
      "group": "booth",
      "title": "多結晶風きらきらアイテクスチャ",
      "category": "テクスチャ",
      "date": "2023.08",
      "description": "多結晶の輝きをイメージしたHAOLAN向け瞳テクスチャ。5色展開。",
      "url": "https://booth.pm/ja/items/4991077",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/4991077/795764c0-50bd-4e91-baa2-6a7b42efde68_base_resized.jpg",
      "symbol": "✧",
      "tags": [
        "テクスチャ",
        "VRChat",
        "HAOLAN"
      ]
    },
    {
      "id": "booth-5380824",
      "group": "booth",
      "title": "どこかの通路 ビートセイバープラットフォーム",
      "category": "3D空間",
      "date": "2023.12",
      "description": "少し不思議な日常感のある通路型Beat Saberカスタムプラットフォーム。",
      "url": "https://booth.pm/ja/items/5380824",
      "image": "https://booth.pximg.net/b0924371-87b4-45ad-a97e-c2399aff686b/i/5380824/3d293cef-5e56-4c33-8423-892e1ee07bef_base_resized.jpg",
      "symbol": "⌁",
      "tags": [
        "Beat Saber",
        "3D空間",
        "プラットフォーム"
      ]
    },
    {
      "id": "github-tanakacap",
      "group": "code",
      "title": "TanakaCap",
      "category": "モーションキャプチャー",
      "date": "public",
      "description": "いつものVRChatアバターをWebカメラ1台で動かし、OBSへ。表情・手指・PhysBoneの表現にも取り組むWindows向けソフト。",
      "url": "https://github.com/hosinohito/tanakacap",
      "image": "",
      "symbol": "◉",
      "tags": [
        "Python",
        "VRChat",
        "OBS"
      ]
    },
    {
      "id": "github-hoshikabu",
      "group": "code",
      "title": "hoshiKabu",
      "category": "機械学習 / 日本株",
      "date": "public",
      "description": "LightGBMで翌営業日の株価イベントを予測し、銘柄をランキングする検証プロジェクト。",
      "url": "https://github.com/hosinohito/hoshiKabu",
      "image": "",
      "symbol": "↗",
      "tags": [
        "Python",
        "LightGBM",
        "データ分析"
      ]
    },
    {
      "id": "github-nekosama",
      "group": "code",
      "title": "nekosama",
      "category": "Webアプリ",
      "date": "public",
      "description": "ログインなしで使えるメモWebアプリケーション。TypeScriptで実装。",
      "url": "https://github.com/hosinohito/nekosama",
      "image": "",
      "symbol": "✎",
      "tags": [
        "TypeScript",
        "Web",
        "メモ"
      ]
    },
    {
      "id": "github-hosinohitovoicedataforutau",
      "group": "code",
      "title": "hosinohito Voice Data for UTAU",
      "category": "音声データ",
      "date": "public",
      "description": "UTAUで使える公開音声データ。使い方と歌唱サンプルへの案内あり。",
      "url": "https://github.com/hosinohito/hosinohitoVoiceDataforUTAU",
      "image": "",
      "symbol": "♫",
      "tags": [
        "UTAU",
        "音声",
        "配布"
      ]
    },
    {
      "id": "github-imagematerials",
      "group": "code",
      "title": "imageMaterials",
      "category": "画像素材",
      "date": "public",
      "description": "桜や青いバラの画像・SVG素材を公開。使用・改変・再配布条件はリポジトリ内に記載。",
      "url": "https://github.com/hosinohito/imageMaterials",
      "image": "",
      "symbol": "✦",
      "tags": [
        "SVG",
        "PNG",
        "素材"
      ]
    },
    {
      "id": "github-fantasyphilamentformation",
      "group": "code",
      "title": "FantasyPhilamentFormation",
      "category": "Unityプロジェクト",
      "date": "public",
      "description": "Unityのプロジェクト一式を公開。詳細な内容や利用条件はリポジトリでご確認ください。",
      "url": "https://github.com/hosinohito/FantasyPhilamentFormation",
      "image": "",
      "symbol": "☼",
      "tags": [
        "Unity",
        "実験",
        "ソースコード"
      ]
    }
  ],
  "notes": [
    {
      "category": "VRChat / 制作",
      "title": "アバターのお洋服着せ替えVRMの作り方",
      "description": "VRChat用アバターからVRMを作り、衣装のボーンなどを調整した記録。",
      "url": "https://note.com/tanakamitaina/n/n32949e453150"
    },
    {
      "category": "Beat Saber / 読みもの",
      "title": "ビートセイバー用語",
      "description": "譜面・ノーツ・プレイスタイルなどを独自の視点も交えて整理。",
      "url": "https://note.com/tanakamitaina/n/n7fb0663cbe85"
    },
    {
      "category": "Beat Saber / 上達",
      "title": "得点獲得までのTips",
      "description": "角度・コンボ・中心精度など、スコアアップのための考え方。",
      "url": "https://note.com/tanakamitaina/n/nb2db47418bdc"
    },
    {
      "category": "Beat Saber / FAQ",
      "title": "Beat Saberの暗黙知",
      "description": "初心者がつまずきやすい疑問をまとめた読みもの。",
      "url": "https://note.com/tanakamitaina/n/n7dcfc1686688"
    },
    {
      "category": "配信 / 考察",
      "title": "コメントへの対応を簡単にするための機械的分類",
      "description": "配信コミュニケーションをどう整理するかを考察。",
      "url": "https://note.com/tanakamitaina/n/n41ac46cbfa13"
    },
    {
      "category": "VRChat / Udon",
      "title": "Udonの同期を試した",
      "description": "Udonで移動するオブジェクトを同期させる実験とそのメモ。",
      "url": "https://note.com/tanakamitaina/n/n574cbee3b59e"
    },
    {
      "category": "Beat Saber / エッセイ",
      "title": "運動好きだけど体をうまく動かせない人に",
      "description": "プレイ環境や動きのコントロールを見つめた長文記事。",
      "url": "https://note.com/tanakamitaina/n/nad37d3c4f455"
    }
  ],
  "recent": [
    {
      "id": "booth-sakura-2026",
      "date": "2026-11-13",
      "source": "BOOTH",
      "title": "春のぷくぷく桜飾りを公開",
      "url": "https://booth.pm/ja/items/9137355"
    },
    {
      "id": "note-beatsaber-wrist",
      "date": "2026-05-25",
      "source": "note",
      "title": "#BeatSaber 痛めた手首の治し方",
      "url": "https://note.com/tanakamitaina/n/n0653bf099670"
    },
    {
      "id": "booth-bunny-2024",
      "date": "2024-08-22",
      "source": "BOOTH",
      "title": "ふわもこうさみみを公開",
      "url": "https://booth.pm/ja/items/6030498"
    },
    {
      "id": "booth-eye-2024",
      "date": "2024-03",
      "source": "BOOTH",
      "title": "アイカバー [HAOLAN]を公開",
      "url": "https://booth.pm/ja/items/5555778"
    },
    {
      "id": "booth-platform-2023",
      "date": "2023-12",
      "source": "BOOTH",
      "title": "どこかの通路（Beat Saber）を公開",
      "url": "https://booth.pm/ja/items/5380824"
    },
    {
      "id": "booth-eye-2023",
      "date": "2023-08",
      "source": "BOOTH",
      "title": "多結晶風きらきらアイテクスチャを公開",
      "url": "https://booth.pm/ja/items/4991077"
    },
    {
      "id": "note-tips-2023",
      "date": "2023-08-07",
      "source": "note",
      "title": "Beat Saberの各得点獲得までのTips",
      "url": "https://note.com/tanakamitaina/n/nb2db47418bdc"
    }
  ]
};
