const goalForm = document.getElementById("goalForm");
const goalsList = document.getElementById("goalsList");

function getTotalBalanceByDate() {
    const items = getItems();
    const today = new Date().setHours(0, 0, 0, 0);
    return items.reduce((sum, item) => {
        const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
        if (itemDate <= today) {
            return sum + item.amount;
        }
        return sum;
    }, 0);
}

function renderGoals() {
    const goals = getGoals();
    const totalBalance = Math.max(0, getTotalBalanceByDate());
    goalsList.innerHTML = "";

    if (goals.length === 0) {
        goalsList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(0,0,0,0.2); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-size: 32px; opacity: 0.5; margin-bottom: 15px;">📌</div>
                <h3 style="color: #eee; margin-bottom: 8px; font-weight: 500;">Целей пока нет</h3>
                <p style="color: #888; font-size: 14px; max-width: 400px; margin: 0 auto;">Создайте свою первую финансовую цель выше, чтобы система начала автоматически рассчитывать ваш прогресс.</p>
            </div>
        `;
        return;
    }

    goals.forEach(goal => {
        const rawPercent = (totalBalance / goal.amount) * 100;
        const progressPercent = Math.min(Math.max(rawPercent, 0), 100).toFixed(1);
        const accumulated = Math.min(totalBalance, goal.amount);
        const isCompleted = totalBalance >= goal.amount;

        const div = document.createElement("div");
        div.className = "glass-panel goal-card" + (isCompleted ? " completed" : "");

        div.innerHTML = `
            <div class="goal-header">
                <div class="goal-title" style="display: flex; align-items: center; gap: 8px;">
                    <span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${isCompleted ? 'var(--success)' : 'var(--primary)'}; box-shadow: 0 0 8px ${isCompleted ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)'};"></span>
                    ${goal.title}
                </div>
                <button class="delete-btn btn-icon" title="Удалить" style="margin-left: 0; align-self: flex-start; padding:0;">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="goal-amounts">
                <span>Собрано: <b>${accumulated}</b></span>
                <span>Цель: <b>${goal.amount}</b></span>
            </div>
            <div class="progress-track" style="margin-bottom: 12px;">
                <div class="progress-bar ${isCompleted ? 'success' : ''}" style="width:${progressPercent}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase;">
                <div style="color: var(--color-muted);">Прогресс: <span style="color: var(--color-text); font-weight: 600;">${progressPercent}%</span></div>
                ${isCompleted ? 
                  `<div style="color: var(--success); font-weight: 600; padding: 4px 8px; background: var(--success-bg); border-radius: 6px;">Выполнено</div>` : 
                  `<div style="color: var(--primary); font-weight: 600;">В процессе</div>`}
            </div>
        `;

        const deleteBtn = div.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
            if (confirm(`Удалить цель "${goal.title}"?`)) {
                const updatedGoals = getGoals().filter(g => g.id !== goal.id);
                saveGoals(updatedGoals);
                renderGoals();
            }
        });

        goalsList.appendChild(div);
    });
}

goalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("goalTitle").value.trim();
    const amount = Number(document.getElementById("goalAmount").value);
    if (!title || !amount) { return; }

    const goals = getGoals();
    goals.push({ id: generateId(), title, amount });
    saveGoals(goals);
    goalForm.reset();
    renderGoals();
});

renderGoals();