// 检查数据是否已加载
function checkDataLoaded() {
    if (typeof detailedPracticeData === 'undefined') {
        console.error('详细练习数据未加载');
        return false;
    }
    console.log('数据加载成功，共', detailedPracticeData.length, '天的练习');
    return true;
}

// 14天练习数据（基础版本，用于日历显示）
const practiceData = [
    {
        day: 1,
        title: "自在地聆听",
        theme: "不带选择的觉察",
        quote: "你可曾安静地坐着，既不专注于任何事物，也不费劲地集中注意力，而是非常安详地坐在那里？这时你就会听到各式各样的声响……",
        content: "第一天的练习，是通过"聆听"这个简单的入口，让我们体验到：真正的自由始于停止内在的选择与抗拒。"
    },
    {
        day: 2,
        title: "放下心中的障碍",
        theme: "觉察聆听的屏障",
        quote: "你以何种方式在听？是不是透过自己的企图、欲望、恐惧、焦虑和各种的投射在听？",
        content: "第二天的功课是自我觉察的深化。它邀请我们去看，我们是如何透过自己内在的心理噪音去聆听世界的。"
    },
    {
        day: 3,
        title: "超越语言",
        theme: "被动的警醒状态",
        quote: "聆听是不易达成的一门艺术，但其中确实埋藏着美与高度的理解。",
        content: "第三天的教导是关于从语言的牢笼中解放出来。"
    },
    {
        day: 4,
        title: "安静地听",
        theme: "心必须安静",
        quote: "我不知道你有没有真的听过鸟叫。若想真的听见某个声音，你的心必须安静……",
        content: "第四天是一个极为重要的实践指引。它要求我们觉察并暂停头脑最根深蒂固的活动——思考与命名。"
    },
    {
        day: 5,
        title: "聆听能带来自由",
        theme: "毫不费力的觉察",
        quote: "如果你费力地去听，那算不算是真正的聆听？费力的本身不就是一种阻碍听觉的内在扰动吗？",
        content: "第五天的智慧是革命性的。它告诉我们，通往自由的道路不是去"做"什么，而是停止一切内在的"努力"。"
    },
    {
        day: 6,
        title: "不费力地听",
        theme: "真相主宰变革",
        quote: "你现在正在听我说话，你并没有费力地集中注意力，你只是听而已……",
        content: "第六天让我们明白，我们不需要去"制造"改变。我们唯一要做的，就是创造一个合适的内在条件。"
    },
    {
        day: 7,
        title: "倾听内在的声音",
        theme: "从外在权威转向内在发现",
        quote: "你应该听自己内在的声音而不是讲者的话。若是一味听从讲者的话语，他就会变成你的权威……",
        content: "第七天的教导是一个关键的转向。它要求我们将前六天练习的"聆听"能力，从外部世界彻底地转向内在世界。"
    },
    {
        day: 8,
        title: "全神贯注地看",
        theme: "能量的投注",
        quote: "只有把全部的生命投注在某个事物上，你才能了解它……",
        content: "第八天是关于能量的教导。它告诉我们，真正的理解并非来自思考，而是来自能量的全然投注。"
    },
    {
        day: 9,
        title: "学习需要一颗安静的心",
        theme: "放下知识的累赘",
        quote: "你得靠自己才能发现新的事物，因此刚上路时必须放下一切的累赘，尤其是知识。",
        content: "第九天是一次彻底的"放下"练习。它要求我们放下最珍视的心理财产——知识和确定性。"
    },
    {
        day: 10,
        title: "自我认识的起点",
        theme: "内在冲突的觉察",
        quote: "真正重要的是去了解心中不断在冲突的欲望，而这份了解只能透过自我认识和不断地觉察才会产生。",
        content: "第十天为我们接下来的探索设定了方向。它告诉我们，不要再向外寻求答案或划分高下。"
    },
    {
        day: 11,
        title: ""变成"就是一种竞争",
        theme: "安住于"是"",
        quote: "我们的日常生活就是一种'变成'的过程……因此'变成'就是一种痛苦和竞争心态，不是吗？",
        content: "第十一天的教诲是一个根本性的诊断。它指出了我们文化和个人心理中最核心的疾病："变成"的驱动力。"
    },
    {
        day: 12,
        title: ""变成"就是不和谐",
        theme: "理想的虚幻性",
        quote: "追求某种幻觉一定会导致内心的不和谐。",
        content: "第十二天的功课是关于"破幻"。它邀请我们看穿自己所设立的各种"灵性理想"和"完美人格"的虚幻性。"
    },
    {
        day: 13,
        title: "粗钝的心能否变得敏感",
        theme: "观察即是转化",
        quote: "重点就在于了解愚钝是什么。",
        content: "第十三天的智慧是关于"转化的炼金术"。它告诉我们，不要试图用"加法"去获得一种品质。"
    },
    {
        day: 14,
        title: "自我扩张的机会",
        theme: "消融一切区隔",
        quote: "阶级次第为自我膨胀带来了大好的机会……处心积虑地营造出大师和弟子的阶级之分……就是在否定爱。",
        content: "第十四天的教诲极为犀利，它揭开了所谓"灵性追求"背后最常见的陷阱。"
    }
];

// 用户进度数据
let userProgress = {
    completedDays: JSON.parse(localStorage.getItem('completedDays')) || [],
    totalMinutes: parseInt(localStorage.getItem('totalMinutes')) || 0,
    currentStreak: parseInt(localStorage.getItem('currentStreak')) || 0,
    lastPracticeDate: localStorage.getItem('lastPracticeDate') || null
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');

    // 等待一小段时间确保所有脚本都加载完成
    setTimeout(() => {
        try {
            // 检查数据是否加载
            if (!checkDataLoaded()) {
                console.warn('数据未完全加载，使用基础数据');
            }

            initializeCalendar();
            updateProgressDisplay();
            setupNavigation();
            setupEventListeners();
            console.log('初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            alert('网站初始化失败，请刷新页面重试。');
        }
    }, 500); // 增加等待时间
});

// 备用初始化方法
window.addEventListener('load', function() {
    console.log('Window load event triggered');

    // 如果DOMContentLoaded没有正确初始化，这里作为备用
    setTimeout(() => {
        const startBtn = document.getElementById('startJourneyBtn');
        if (startBtn && !startBtn.hasAttribute('data-initialized')) {
            console.log('备用初始化启动');
            setupEventListeners();
        }
    }, 1000);
});

// 设置事件监听器
function setupEventListeners() {
    console.log('开始设置事件监听器...');

    // 为开始练习按钮添加事件监听
    const startBtn = document.getElementById('startJourneyBtn');
    if (startBtn) {
        // 移除可能存在的旧事件监听器
        startBtn.removeEventListener('click', handleStartJourney);
        startBtn.addEventListener('click', handleStartJourney);
        startBtn.setAttribute('data-initialized', 'true');
        console.log('开始练习按钮事件已绑定');
    } else {
        console.error('找不到开始练习按钮');
        // 尝试通过类名查找
        const startBtnByClass = document.querySelector('.btn-primary');
        if (startBtnByClass) {
            startBtnByClass.removeEventListener('click', handleStartJourney);
            startBtnByClass.addEventListener('click', handleStartJourney);
            console.log('通过类名找到开始练习按钮并绑定事件');
        }
    }

    // 为查看进度按钮添加事件监听
    const progressBtn = document.getElementById('showProgressBtn');
    if (progressBtn) {
        progressBtn.removeEventListener('click', handleShowProgress);
        progressBtn.addEventListener('click', handleShowProgress);
        console.log('查看进度按钮事件已绑定');
    } else {
        console.error('找不到查看进度按钮');
        // 尝试通过类名查找
        const progressBtnByClass = document.querySelector('.btn-secondary');
        if (progressBtnByClass) {
            progressBtnByClass.removeEventListener('click', handleShowProgress);
            progressBtnByClass.addEventListener('click', handleShowProgress);
            console.log('通过类名找到查看进度按钮并绑定事件');
        }
    }

    // 为模态框外部点击添加事件监听
    const modal = document.getElementById('practiceModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
        console.log('模态框事件已绑定');
    } else {
        console.error('找不到模态框元素');
    }
}

// 事件处理函数
function handleStartJourney(e) {
    e.preventDefault();
    console.log('开始练习按钮被点击');
    startJourney();
}

function handleShowProgress(e) {
    e.preventDefault();
    console.log('查看进度按钮被点击');
    showProgress();
}

// 初始化日历
function initializeCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    practiceData.forEach(practice => {
        const dayCard = createDayCard(practice);
        calendarGrid.appendChild(dayCard);
    });
}

// 创建日期卡片
function createDayCard(practice) {
    const card = document.createElement('div');
    card.className = 'day-card';

    // 使用addEventListener而不是onclick
    card.addEventListener('click', function() {
        console.log(`点击了第${practice.day}天的卡片`);
        openPractice(practice.day);
    });

    // 检查完成状态
    const isCompleted = userProgress.completedDays.includes(practice.day);
    const isCurrent = getCurrentDay() === practice.day;

    if (isCompleted) card.classList.add('completed');
    if (isCurrent) card.classList.add('current');

    card.innerHTML = `
        <div class="day-number">第${practice.day}天</div>
        <div class="day-title">${practice.title}</div>
        <div class="day-theme">${practice.theme}</div>
        <div class="day-status">
            <i class="fas ${isCompleted ? 'fa-check-circle' : isCurrent ? 'fa-play-circle' : 'fa-circle'}"></i>
            <span>${isCompleted ? '已完成' : isCurrent ? '今日练习' : '未开始'}</span>
        </div>
    `;

    return card;
}

// 获取当前应该练习的天数
function getCurrentDay() {
    const completedCount = userProgress.completedDays.length;
    return Math.min(completedCount + 1, 14);
}

// 更新进度显示
function updateProgressDisplay() {
    const completedDays = userProgress.completedDays.length;
    const progressPercentage = Math.round((completedDays / 14) * 100);
    
    document.getElementById('completedDays').textContent = completedDays;
    document.getElementById('totalMinutes').textContent = userProgress.totalMinutes;
    document.getElementById('currentStreak').textContent = userProgress.currentStreak;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${progressPercentage}% 完成`;
}

// 开始练习之旅
function startJourney() {
    console.log('开始练习之旅函数被调用');

    try {
        const currentDay = getCurrentDay();
        console.log('当前应该练习第', currentDay, '天');

        if (currentDay <= 14) {
            openPractice(currentDay);
        } else {
            alert('恭喜您完成了14天的聆听之旅！');
        }
    } catch (error) {
        console.error('开始练习失败:', error);
        alert('开始练习时出现错误，请刷新页面重试。');
    }
}

// 显示进度
function showProgress() {
    document.getElementById('progress').scrollIntoView({ behavior: 'smooth' });
}

// 打开练习页面
function openPractice(day) {
    const practice = practiceData[day - 1];
    const modal = document.getElementById('practiceModal');
    const content = document.getElementById('practiceContent');
    
    content.innerHTML = generatePracticeContent(practice);
    modal.style.display = 'block';
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleModalKeydown);
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('practiceModal');
    modal.style.display = 'none';
    document.removeEventListener('keydown', handleModalKeydown);
}

// 处理模态框键盘事件
function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

// 生成练习内容
function generatePracticeContent(practice) {
    // 从详细数据中获取对应的练习内容
    const detailedPractice = getDetailedPracticeData(practice.day);

    return `
        <div class="practice-content">
            <div class="practice-header">
                <div class="practice-day">第${practice.day}天</div>
                <h2 class="practice-title">${practice.title}</h2>
                <p class="practice-theme">${practice.theme}</p>
            </div>

            <div class="practice-section">
                <h3>📖 原文摘录</h3>
                <div class="quote">${practice.quote}</div>
            </div>

            ${detailedPractice ? `
            <div class="practice-section">
                <h3>🔍 深度解读</h3>
                <p>${detailedPractice.interpretation}</p>
            </div>

            <div class="practice-section">
                <h3>🧘‍♀️ 冥想练习：${detailedPractice.meditation.title}</h3>
                <div class="meditation-guide">
                    <h4>准备阶段</h4>
                    <p>${detailedPractice.meditation.preparation}</p>

                    <h4>冥想引导</h4>
                    <div class="meditation-text">${detailedPractice.meditation.guide.replace(/\n/g, '<br>')}</div>

                    <div class="meditation-controls">
                        <button class="control-btn" onclick="startMeditation(${practice.day})">
                            <i class="fas fa-play"></i>
                            开始冥想 (15分钟)
                        </button>
                        <button class="control-btn secondary" onclick="showMeditationTimer(${practice.day})">
                            <i class="fas fa-clock"></i>
                            计时器
                        </button>
                        <button class="control-btn secondary" onclick="markCompleted(${practice.day})">
                            <i class="fas fa-check"></i>
                            标记完成
                        </button>
                    </div>
                </div>
            </div>

            <div class="practice-section">
                <h3>🌱 生活实践：${detailedPractice.lifePractice.title}</h3>
                <p><strong>时机：</strong>${detailedPractice.lifePractice.description}</p>
                <div class="practice-steps">
                    <h4>具体步骤：</h4>
                    <ol>
                        ${detailedPractice.lifePractice.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <p><strong>目的：</strong>${detailedPractice.lifePractice.purpose}</p>
            </div>
            ` : `
            <div class="practice-section">
                <h3>🧘‍♀️ 今日冥想</h3>
                <div class="meditation-guide">
                    <h4>冥想引导</h4>
                    <p>${practice.content}</p>
                    <div class="meditation-controls">
                        <button class="control-btn" onclick="startMeditation(${practice.day})">
                            <i class="fas fa-play"></i>
                            开始冥想
                        </button>
                        <button class="control-btn secondary" onclick="markCompleted(${practice.day})">
                            <i class="fas fa-check"></i>
                            标记完成
                        </button>
                    </div>
                </div>
            </div>

            <div class="practice-section">
                <h3>🌱 生活实践</h3>
                <p>将今天的练习融入到日常生活中，在平凡的时刻体验深刻的觉察。</p>
            </div>
            `}
        </div>
    `;
}

// 获取详细练习数据
function getDetailedPracticeData(day) {
    // 这里应该从practice-data.js加载数据
    // 由于我们在浏览器环境中，我们需要确保数据已经加载
    try {
        if (typeof detailedPracticeData !== 'undefined' && detailedPracticeData[day - 1]) {
            return detailedPracticeData[day - 1];
        }
    } catch (error) {
        console.warn('详细练习数据加载失败:', error);
    }
    return null;
}

// 添加平滑滚动效果
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 添加加载动画
function showLoading() {
    const loadingHtml = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>正在加载练习内容...</p>
        </div>
    `;
    return loadingHtml;
}

// 添加错误处理
function showError(message) {
    const errorHtml = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>出现了一些问题</h3>
            <p>${message}</p>
            <button class="control-btn" onclick="closeModal()">
                <i class="fas fa-home"></i>
                返回主页
            </button>
        </div>
    `;
    return errorHtml;
}

// 改进的打开练习函数
function openPractice(day) {
    try {
        const practice = practiceData[day - 1];
        if (!practice) {
            throw new Error(`找不到第${day}天的练习内容`);
        }

        const modal = document.getElementById('practiceModal');
        const content = document.getElementById('practiceContent');

        if (!modal || !content) {
            throw new Error('页面元素未找到');
        }

        // 显示加载状态
        content.innerHTML = showLoading();
        modal.style.display = 'block';

        // 模拟加载延迟，让用户看到加载动画
        setTimeout(() => {
            try {
                content.innerHTML = generatePracticeContent(practice);
                // 添加键盘事件监听
                document.addEventListener('keydown', handleModalKeydown);
            } catch (error) {
                content.innerHTML = showError('练习内容加载失败，请稍后重试。');
                console.error('练习内容生成失败:', error);
            }
        }, 300);

    } catch (error) {
        console.error('打开练习失败:', error);
        alert('无法打开练习内容，请检查网络连接或刷新页面重试。');
    }
}

// 确保关键函数在全局作用域中
window.closeModal = closeModal;
window.startMeditation = startMeditation;
window.showMeditationTimer = showMeditationTimer;
window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.closeTimer = closeTimer;
window.markCompleted = markCompleted;
window.startJourney = startJourney;
window.showProgress = showProgress;
window.openPractice = openPractice;

// 调试函数
window.debugWebsite = function() {
    console.log('=== 网站调试信息 ===');
    console.log('practiceData:', typeof practiceData !== 'undefined' ? practiceData.length + ' days' : '未定义');
    console.log('detailedPracticeData:', typeof detailedPracticeData !== 'undefined' ? detailedPracticeData.length + ' days' : '未定义');

    const startBtn = document.getElementById('startJourneyBtn');
    console.log('开始练习按钮:', startBtn ? '找到' : '未找到');

    const modal = document.getElementById('practiceModal');
    console.log('模态框:', modal ? '找到' : '未找到');

    console.log('用户进度:', userProgress);
    console.log('==================');
};

// 添加全局错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
});

// 添加未处理的Promise错误处理
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise错误:', e.reason);
});

// 开始冥想
function startMeditation(day) {
    if (confirm(`准备开始第${day}天的冥想练习吗？\n\n请找一个安静舒适的地方，确保接下来15分钟不会被打扰。\n\n点击确定开始计时。`)) {
        showMeditationTimer(day);
    }
}

// 显示冥想计时器
function showMeditationTimer(day) {
    const timerHtml = `
        <div class="meditation-timer">
            <h3>第${day}天冥想练习</h3>
            <div class="timer-display">
                <div class="time-circle">
                    <div class="time-text" id="timeDisplay">15:00</div>
                </div>
            </div>
            <div class="timer-controls">
                <button class="control-btn" id="startPauseBtn" onclick="toggleTimer()">
                    <i class="fas fa-play"></i>
                    开始
                </button>
                <button class="control-btn secondary" onclick="resetTimer()">
                    <i class="fas fa-redo"></i>
                    重置
                </button>
                <button class="control-btn secondary" onclick="closeTimer()">
                    <i class="fas fa-times"></i>
                    关闭
                </button>
            </div>
            <div class="timer-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="timerProgress"></div>
                </div>
            </div>
            <div class="meditation-tips">
                <p>💡 提示：保持自然的呼吸，温柔地觉察当下的一切</p>
            </div>
        </div>
    `;

    // 替换模态框内容
    document.getElementById('practiceContent').innerHTML = timerHtml;

    // 初始化计时器
    initTimer(day);
}

// 计时器变量
let timerInterval = null;
let timeLeft = 15 * 60; // 15分钟
let totalTime = 15 * 60;
let isRunning = false;
let currentDay = 1;

// 初始化计时器
function initTimer(day) {
    currentDay = day;
    timeLeft = 15 * 60;
    totalTime = 15 * 60;
    isRunning = false;
    updateTimerDisplay();
    updateTimerProgress();
}

// 切换计时器开始/暂停
function toggleTimer() {
    const btn = document.getElementById('startPauseBtn');

    if (isRunning) {
        // 暂停
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerHTML = '<i class="fas fa-play"></i> 继续';
    } else {
        // 开始
        isRunning = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> 暂停';

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            updateTimerProgress();

            if (timeLeft <= 0) {
                completeTimer();
            }
        }, 1000);
    }
}

// 重置计时器
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = totalTime;
    updateTimerDisplay();
    updateTimerProgress();

    const btn = document.getElementById('startPauseBtn');
    btn.innerHTML = '<i class="fas fa-play"></i> 开始';
}

// 关闭计时器
function closeTimer() {
    clearInterval(timerInterval);
    closeModal();
}

// 完成计时器
function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;

    // 播放完成音效（如果有的话）
    playCompletionSound();

    // 显示完成消息
    const completionHtml = `
        <div class="meditation-completion">
            <div class="completion-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>恭喜完成第${currentDay}天的冥想练习！</h3>
            <p>您已经完成了15分钟的深度练习。</p>
            <div class="completion-actions">
                <button class="control-btn" onclick="markCompleted(${currentDay})">
                    <i class="fas fa-check"></i>
                    标记为已完成
                </button>
                <button class="control-btn secondary" onclick="closeModal()">
                    <i class="fas fa-home"></i>
                    返回主页
                </button>
            </div>
        </div>
    `;

    document.getElementById('practiceContent').innerHTML = completionHtml;
}

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timeDisplay = document.getElementById('timeDisplay');
    if (timeDisplay) {
        timeDisplay.textContent = display;
    }
}

// 更新计时器进度
function updateTimerProgress() {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const progressFill = document.getElementById('timerProgress');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

// 播放完成音效
function playCompletionSound() {
    // 创建一个简单的音效
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
        // 如果音频API不可用，忽略错误
        console.log('Audio not available');
    }
}

// 标记完成
function markCompleted(day) {
    if (!userProgress.completedDays.includes(day)) {
        userProgress.completedDays.push(day);
        userProgress.totalMinutes += 15; // 假设每次练习15分钟
        
        // 更新连续练习天数
        updateStreak();
        
        // 保存到本地存储
        saveProgress();
        
        // 更新显示
        updateProgressDisplay();
        initializeCalendar();
        
        alert(`恭喜完成第${day}天的练习！`);
        closeModal();
    }
}

// 更新连续练习天数
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = userProgress.lastPracticeDate;
    
    if (lastDate) {
        const lastPracticeDate = new Date(lastDate);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastPracticeDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            userProgress.currentStreak += 1;
        } else if (diffDays > 1) {
            userProgress.currentStreak = 1;
        }
    } else {
        userProgress.currentStreak = 1;
    }
    
    userProgress.lastPracticeDate = today;
}

// 保存进度到本地存储
function saveProgress() {
    localStorage.setItem('completedDays', JSON.stringify(userProgress.completedDays));
    localStorage.setItem('totalMinutes', userProgress.totalMinutes.toString());
    localStorage.setItem('currentStreak', userProgress.currentStreak.toString());
    localStorage.setItem('lastPracticeDate', userProgress.lastPracticeDate);
}

// 设置导航
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            const element = document.getElementById(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            
            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('practiceModal');
    if (event.target === modal) {
        closeModal();
    }
}
