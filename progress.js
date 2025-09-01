// Progress helper for standalone day pages
(function(){
  function readProgress(){
    return {
      completedDays: JSON.parse(localStorage.getItem('completedDays')||'[]'),
      totalMinutes: parseInt(localStorage.getItem('totalMinutes')||'0',10)||0,
      currentStreak: parseInt(localStorage.getItem('currentStreak')||'0',10)||0,
      lastPracticeDate: localStorage.getItem('lastPracticeDate')||null
    };
  }
  function saveProgress(p){
    localStorage.setItem('completedDays', JSON.stringify(p.completedDays));
    localStorage.setItem('totalMinutes', String(p.totalMinutes));
    localStorage.setItem('currentStreak', String(p.currentStreak));
    localStorage.setItem('lastPracticeDate', p.lastPracticeDate || '');
  }
  function updateStreak(p){
    const today = new Date().toDateString();
    const last = p.lastPracticeDate;
    if (last){
      const d1 = new Date(last); const d2 = new Date(today);
      const diffDays = Math.ceil((d2 - d1)/(1000*60*60*24));
      if (diffDays === 1) p.currentStreak += 1;
      else if (diffDays > 1) p.currentStreak = 1;
    } else { p.currentStreak = 1; }
    p.lastPracticeDate = today;
  }
  function getDayFromPath(){
    const m = location.pathname.match(/day(\d+)\.html$/);
    return m ? parseInt(m[1],10) : null;
  }
  function ensureUI(day){
    const main = document.querySelector('.practice-detail');
    if (!main) return null;
    let section = document.getElementById('completionSection');
    if (!section){
      section = document.createElement('div');
      section.className = 'practice-section';
      section.id = 'completionSection';
      section.innerHTML = `
        <h3>✅ 完成标记</h3>
        <p>点击下方按钮标记第${day}天为已完成，返回首页即可看到进度更新。</p>
        <div class="meditation-controls">
          <button class="control-btn" id="completeBtn"><i class="fas fa-check"></i> 标记已完成</button>
          <a class="control-btn secondary" href="../index.html"><i class="fas fa-home"></i> 返回首页</a>
        </div>`;
      // 插入在导航之前
      const nav = document.querySelector('.practice-navigation');
      if (nav && nav.parentElement === main){
        main.insertBefore(section, nav);
      } else {
        main.appendChild(section);
      }
    }
    return section;
  }
  function setCompletedState(section){
    const btn = section.querySelector('#completeBtn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
    btn.style.opacity = '0.8';
  }
  function init(){
    const day = getDayFromPath();
    if (!day) return;
    const section = ensureUI(day);
    if (!section) return;
    const btn = section.querySelector('#completeBtn');
    const p = readProgress();
    if (p.completedDays.includes(day)){
      setCompletedState(section);
      return;
    }
    btn.addEventListener('click', function(){
      const prog = readProgress();
      if (!prog.completedDays.includes(day)){
        prog.completedDays.push(day);
        prog.totalMinutes += 15; // 与主页逻辑一致
        updateStreak(prog);
        saveProgress(prog);
      }
      setCompletedState(section);
      try { alert(`已标记完成第${day}天，返回首页查看进度。`); } catch(e){}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

