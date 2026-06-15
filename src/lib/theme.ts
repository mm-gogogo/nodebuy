// 主题(深/浅)相关的纯逻辑;localStorage 与 DOM 读写在客户端 hook 里。

export const THEME_KEY = 'nodebuy:theme'

export type Theme = 'light' | 'dark'

export function parseTheme(raw: string | null | undefined): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null
}

// 在 <head> 内联执行,绘制前就设好 data-theme,避免主题闪烁(FOUC)。
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`
