// 核心配置：匹配可能的用户 Prompt 容器
const USER_PROMPT_SELECTOR = 'user-query, .query-text, [data-message-author="user"]';

// 创建并初始化导航栏容器
const navContainer = document.createElement('div');
navContainer.className = 'gemini-nav-container';
document.body.appendChild(navContainer);

// 缓存上一次的聊天签名，用来对比内容是否有真正变化
let lastChatSignature = "";

// 刷新导航列表的核心函数
function refreshNavigator() {
  // 1. 获取所有匹配的元素
  let prompts = Array.from(document.querySelectorAll(USER_PROMPT_SELECTOR));

  // 2. 过滤掉嵌套的重复元素
  prompts = prompts.filter(el => {
    return !prompts.some(other => other !== el && other.contains(el));
  });

  // 3. 【高性能核心】计算当前页面的聊天快照签名（组合总数和各条文本前10个字）
  const currentSignature = prompts.length + "_" + prompts.map(el => (el.innerText || "").trim().slice(0, 10)).join('|');

  // 如果内容完全没变（99% 的时间都是如此），直接秒退，不重绘 DOM，打字绝对不卡，悬停绝对不闪烁
  if (currentSignature === lastChatSignature) {
    return;
  }
  lastChatSignature = currentSignature;

  // 4. 只有当确实有新消息或消息改变时，才执行以下重绘逻辑
  navContainer.innerHTML = '';

  if (prompts.length === 0) {
    navContainer.style.display = 'none';
    return;
  } else {
    navContainer.style.display = 'flex';
  }

  prompts.forEach((promptEl, index) => {
    const rawText = promptEl.innerText || promptEl.textContent || '';
    let cleanText = rawText.trim().replace(/\s+/g, ' ');
    
    let previewText = cleanText;
    if (!previewText) {
      const hasMedia = promptEl.querySelector('img, [class*="image"], [class*="file"], [class*="thumbnail"]') !== null;
      previewText = hasMedia ? "🖼️ [图片 / 文件提示词]" : `💬 话题区块 ${index + 1}`;
    }

    const dash = document.createElement('div');
    dash.className = 'gemini-nav-item-dash';

    const textItem = document.createElement('div');
    textItem.className = 'gemini-nav-item-text';
    textItem.innerText = previewText;
    textItem.title = cleanText || "图片或文件上传";

    textItem.addEventListener('click', () => {
      promptEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });

    navContainer.appendChild(dash);
    navContainer.appendChild(textItem);
  });
}

// === 放弃 MutationObserver，改用超轻量定时器 ===
// 每 2 秒悄悄在后台核对一次有没有新消息，对打字主线程毫无干扰
setInterval(refreshNavigator, 2000);

// 初始化时先执行一次
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', refreshNavigator);
} else {
  refreshNavigator();
}

// === 手机端触摸交互优化代码 ===
navContainer.addEventListener('click', (e) => {
  if (e.target.className === 'gemini-nav-item-text') return;
  e.stopPropagation();
  navContainer.classList.toggle('mobile-expanded');
});

document.addEventListener('click', (e) => {
  if (!navContainer.contains(e.target)) {
    navContainer.classList.remove('mobile-expanded');
  }
});
