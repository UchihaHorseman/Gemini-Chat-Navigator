// 核心配置：匹配可能的用户 Prompt 容器
const USER_PROMPT_SELECTOR = 'user-query, .query-text, [data-message-author="user"]';

// 创建并初始化导航栏容器
const navContainer = document.createElement('div');
navContainer.className = 'gemini-nav-container';
document.body.appendChild(navContainer);

// 刷新导航列表的核心函数
function refreshNavigator() {
  // 清空旧节点
  navContainer.innerHTML = '';

  // 1. 获取所有匹配的元素，并转换为真正的数组
  let prompts = Array.from(document.querySelectorAll(USER_PROMPT_SELECTOR));

  // 2. 【核心修复】过滤掉嵌套的重复元素，确保一个对话区块只被计算一次
  prompts = prompts.filter(el => {
    // 如果当前元素被数组中的其他元素所包含（它是子元素），则过滤掉它，只保留最外层父元素
    return !prompts.some(other => other !== el && other.contains(el));
  });

  if (prompts.length === 0) {
    navContainer.style.display = 'none'; // 没有对话时隐藏
    return;
  } else {
    navContainer.style.display = 'flex';
  }

  prompts.forEach((promptEl, index) => {
    // 获取干净的纯文本作为标题
    const rawText = promptEl.innerText || promptEl.textContent || '';
    const cleanText = rawText.trim().replace(/\s+/g, ' ');
    
    // 如果文本为空则跳过（防止抓到空白区块）
    if (!cleanText) return;

    // 限制侧边栏显示的字数
    const previewText = cleanText;

    // 创建收纳状态的短横线 (图1)
    const dash = document.createElement('div');
    dash.className = 'gemini-nav-item-dash';

    // 创建展开状态的文本项 (图2)
    const textItem = document.createElement('div');
    textItem.className = 'gemini-nav-item-text';
    textItem.innerText = previewText;
    textItem.title = cleanText; // 鼠标悬停显示完整悬浮提示

    // 点击平滑滚动跳转
    textItem.addEventListener('click', () => {
      promptEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });

    // 组装到容器中
    navContainer.appendChild(dash);
    navContainer.appendChild(textItem);
  });
}

// 使用防抖机制监听 DOM 变化
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(refreshNavigator, 500);
});

// 初始化监听
function init() {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  refreshNavigator();
}

// 确保页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}