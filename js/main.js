const list = document.getElementById("list");
const balance = document.getElementById("balance");
const totalIncomeElement = document.getElementById("total-income");
const totalExpenseElement = document.getElementById("total-expense");
const miniGoalWidget = document.getElementById("mini-goal-widget");

window.currentBalance = 0;
window.exchangeRatesCache = null;

function renderMultiCurrencyBalance() {
    const container = document.getElementById("multi-currency-balance");
    if (!container || !window.exchangeRatesCache) return;

    const balanceKzt = window.currentBalance || 0;
    const { usdToKzt, eurToKzt, rubToKzt } = window.exchangeRatesCache;

    const usdBalance = (balanceKzt / usdToKzt).toFixed(2);
    const eurBalance = (balanceKzt / eurToKzt).toFixed(2);
    const rubBalance = (balanceKzt / rubToKzt).toFixed(2);

    container.innerHTML = `
        <div title="В долларах США">🇺🇸 ${usdBalance} $</div>
        <div title="В евро">🇪🇺 ${eurBalance} €</div>
        <div title="В рублях">🇷🇺 ${rubBalance} ₽</div>
    `;
}

function formatDateHeader(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diff = (today - date) / (1000 * 60 * 60 * 24);
    if (diff === 0) return "Сегодня";
    if (diff === 1) return "Вчера";
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.deleteTransaction = function(originalIndex) {
    let items = getItems();
    if (originalIndex >= 0 && originalIndex < items.length) {
        items.splice(originalIndex, 1);
        saveItems(items);
        renderItems();
    }
};

function renderItems() {
    let items = getItems();
    const today = new Date().setHours(0, 0, 0, 0);
    if (list) list.innerHTML = "";

    let total = 0;
    let income = 0;
    let expense = 0;

    items.forEach((item, index) => item._originalIndex = index);
    
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    let lastDate = null;

    items.forEach(item => {
        const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
        if (itemDate <= today) {
            total += item.amount;
            if (item.amount >= 0) {
                income += item.amount;
            } else {
                expense += Math.abs(item.amount);
            }
        }

        if (list && item.date !== lastDate) {
            const header = document.createElement("div");
            header.className = "date-group-header";
            header.innerText = formatDateHeader(item.date);
            list.appendChild(header);
            lastDate = item.date;
        }

        if (list) {
            const div = document.createElement("div");
            div.className = "transaction-card";

            const isIncome = item.amount >= 0;
            const cls = isIncome ? "income" : "expense";
            const icon = isIncome 
                ? `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>` 
                : `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M7 7L17 17M17 17H7M17 17V7"/></svg>`;

            div.innerHTML = `
                <div class="tx-icon ${cls}">${icon}</div>
                <div class="tx-details">
                    <div class="tx-title">${item.title}</div>
                    <div class="tx-note">${item.type === "income" ? "Доход" : "Расход"} • ${item.date}</div>
                    ${item.note ? `<div class="tx-note" style="opacity: 0.7; margin-top: 4px;">📝 ${item.note}</div>` : ''}
                </div>
                <div class="tx-amount ${cls}">${item.amount > 0 ? '+' : ''}${item.amount} ₸</div>
                <button class="btn-icon" onclick="window.deleteTransaction(${item._originalIndex})" title="Удалить">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            `;
            list.appendChild(div);
        }
    });

    window.currentBalance = total;

    if (balance) balance.innerText = total + " ₸";
    if (totalIncomeElement) totalIncomeElement.innerText = income + " ₸";
    if (totalExpenseElement) totalExpenseElement.innerText = expense + " ₸";

    renderMultiCurrencyBalance();
    renderMiniGoal();
    if (typeof renderRecommendations === 'function') {
        renderRecommendations();
    }
    if (typeof renderMainChart === 'function') {
        const select = document.getElementById("chartPeriodSelect");
        const daysCount = select ? parseInt(select.value, 10) : 7;
        renderMainChart(items, daysCount);
    }
}

function renderMiniGoal() {
    if (!miniGoalWidget) return;
    if (typeof getGoals !== "function") return;
    
    const goals = getGoals();
    if (goals.length === 0) {
        miniGoalWidget.style.display = "none";
        return;
    }

    let balanceValue = window.currentBalance || 0;
    
    let targetGoal = goals.find(g => balanceValue < g.amount);
    if (!targetGoal) targetGoal = goals[goals.length - 1];

    if (targetGoal) {
        miniGoalWidget.style.display = "block";
        const isCompleted = balanceValue >= targetGoal.amount;
        const progress = Math.min(Math.max((balanceValue / targetGoal.amount) * 100, 0), 100) || 0;
        
        miniGoalWidget.innerHTML = `
            <div class="card goal-card" onclick="window.location.href='goals.html'" style="cursor: pointer; margin-bottom: 2rem; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'" title="Перейти к целям">
                <div class="goal-header">
                    <div class="goal-title" style="display: flex; align-items: center; gap: 8px;">
                        <span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${isCompleted ? 'var(--success)' : 'var(--primary)'};"></span>
                        Актуальная цель: ${targetGoal.title}
                    </div>
                    <span style="font-size: 0.8rem; color: ${isCompleted ? 'var(--success)' : 'var(--primary)'}; font-weight: 600; letter-spacing: 0.05em;">${isCompleted ? 'ВЫПОЛНЕНО' : 'В ПРОЦЕССЕ'}</span>
                </div>
                <div class="goal-amounts">
                    <div>Собрано: <b>${balanceValue} ₸</b></div>
                    <div>Нужно: <b>${targetGoal.amount} ₸</b></div>
                </div>
                <div class="progress-track" style="margin-top: 0.75rem;">
                    <div class="progress-bar ${isCompleted ? 'success' : ''}" style="width: ${progress}%;"></div>
                </div>
            </div>
        `;
    }
}

let mainChartInstance = null;

window.updateChartPeriod = function() {
    const select = document.getElementById("chartPeriodSelect");
    if (!select) return;
    const daysCount = parseInt(select.value, 10);
    if (typeof renderMainChart === 'function') {
        renderMainChart(getItems(), daysCount);
    }
};

renderItems();

function renderMainChart(items, daysCount = 7) {
    const ctx = document.getElementById('mainChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const days = [];
    const balances = [];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        const dateString = d.toISOString().split('T')[0];
        
        let dayNet = 0;
        items.forEach(item => {
            if (item.date === dateString) {
                dayNet += item.amount;
            }
        });
        
        days.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
        balances.push(dayNet);
    }
    
    if (mainChartInstance) {
        mainChartInstance.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    Chart.defaults.color = isDark ? '#94a3b8' : '#6b7280';
    Chart.defaults.font.family = "'Inter', sans-serif";
    const gridColor = isDark ? '#334155' : '#e5e7eb';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipText = isDark ? '#f8fafc' : '#111827';
    const tooltipBorder = isDark ? '#334155' : '#e5e7eb';

    mainChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Изменение баланса',
                    data: balances,
                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                    borderColor: '#4f46e5',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipText,
                    bodyColor: tooltipText,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            }
        }
    });
}


async function renderExchangeRates() {
    const container = document.getElementById("exchange-rates-container");
    if (!container) return;

    try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await response.json();
        
        const kztRate = data.rates.KZT;
        
        // Курсы в тенге
        const usdToKzt = kztRate.toFixed(2);
        const eurToKzt = (kztRate / data.rates.EUR).toFixed(2);
        const rubToKzt = (kztRate / data.rates.RUB).toFixed(2);

        window.exchangeRatesCache = {
            usdToKzt: parseFloat(usdToKzt),
            eurToKzt: parseFloat(eurToKzt),
            rubToKzt: parseFloat(rubToKzt)
        };

        renderMultiCurrencyBalance();

        container.innerHTML = `
            <div class="rate-item">
                <div class="rate-currency">🇺🇸 USD</div>
                <div class="rate-value">${usdToKzt}</div>
            </div>
            <div class="rate-item">
                <div class="rate-currency">🇪🇺 EUR</div>
                <div class="rate-value">${eurToKzt}</div>
            </div>
            <div class="rate-item">
                <div class="rate-currency">🇷🇺 RUB</div>
                <div class="rate-value">${rubToKzt}</div>
            </div>
        `;
    } catch (error) {
        console.error("Ошибка при загрузке курсов валют:", error);
        container.innerHTML = `<div class="rate-item" style="color: var(--danger);">Не удалось загрузить курсы валют.</div>`;
    }
}

renderExchangeRates();

function renderRecommendations() {
    const container = document.getElementById("recommendations-container");
    const widget = document.getElementById("recommendations-widget");
    if (!container || !widget) return;

    const items = getItems();
    if (items.length === 0) {
        widget.style.display = "none";
        return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0;
    let expense = 0;
    const expensesByCategory = {};

    items.forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
            if (item.amount > 0) {
                income += item.amount;
            } else if (item.amount < 0) {
                const absAmt = Math.abs(item.amount);
                expense += absAmt;
                const title = item.title.trim() || 'Без названия';
                expensesByCategory[title] = (expensesByCategory[title] || 0) + absAmt;
            }
        }
    });

    const recommendations = [];

    if (income > 0) {
        const savingsRate = ((income - expense) / income) * 100;
        if (savingsRate < 0) {
            recommendations.push(`🔴 <b>Дефицит бюджета в этом месяце:</b> Ваши расходы превышают доходы на ${Math.abs(income - expense)} ₸. Постарайтесь отложить крупные покупки до следующего месяца.`);
        } else if (savingsRate < 10) {
            recommendations.push(`🟡 <b>Низкий уровень сбережений:</b> Вы откладываете менее 10% доходов в текущем месяце. Эксперты рекомендуют сберегать 15-20% для создания надежной финансовой подушки.`);
        } else if (savingsRate >= 20) {
            recommendations.push(`🟢 <b>Отличный результат:</b> В этом месяце вы сохраняете более 20% доходов. Рассмотрите возможность инвестирования свободных средств.`);
        } else {
            recommendations.push(`🟢 <b>Стабильность:</b> Вы тратите меньше, чем зарабатываете. Попробуйте немного сократить необязательные траты, чтобы увеличить норму сбережений до 20%.`);
        }
    } else if (expense > 0) {
        recommendations.push(`🟡 <b>Нет доходов:</b> В этом месяце у вас зафиксированы расходы, но нет ни одной записи о доходах. Пожалуйста, добавьте источники дохода для корректной аналитики.`);
    }

    const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (sortedExpenses.length > 0) {
        const topCategory = sortedExpenses[0];
        const titleLower = topCategory[0].toLowerCase();
        const percentOfExpense = Math.round((topCategory[1] / expense) * 100);
        const percentOfIncome = income > 0 ? Math.round((topCategory[1] / income) * 100) : 0;
        
        let customAdvice = "";
        
        if (titleLower.includes('квартир') || titleLower.includes('аренд') || titleLower.includes('ипотек') || titleLower.includes('жиль') || titleLower.includes('коммунал')) {
            if (percentOfIncome > 40) {
                customAdvice = `🏠 <b>Жилье:</b> На аренду или ипотеку уходит ${percentOfIncome}% вашего дохода (${topCategory[1]} ₸). Это высокая финансовая нагрузка (рекомендуется не более 30%). Если возможно, подумайте об оптимизации.`;
            } else {
                customAdvice = `🏠 <b>Жилье:</b> Расходы на жилье (${topCategory[1]} ₸) — ваша основная статья затрат, что является нормальной практикой.`;
            }
        } else if (titleLower.includes('продукт') || titleLower.includes('супермаркет') || titleLower.includes('еда') || titleLower.includes('магнит') || titleLower.includes('пятерочк')) {
            customAdvice = `🛒 <b>Продукты:</b> Это ваша главная статья расходов (${percentOfExpense}% от всех трат). Совет: планирование меню на неделю и походы в магазин со списком помогают сэкономить до 20% в этой категории.`;
        } else if (titleLower.includes('ресторан') || titleLower.includes('кафе') || titleLower.includes('фастфуд') || titleLower.includes('доставк')) {
            customAdvice = `🍔 <b>Питание вне дома:</b> Вы тратите ${topCategory[1]} ₸ на кафе и доставки. Попробуйте чаще готовить дома или брать обеды с собой — это отлично экономит бюджет.`;
        } else if (titleLower.includes('авто') || titleLower.includes('машин') || titleLower.includes('бензин') || titleLower.includes('такси') || titleLower.includes('транспорт')) {
            customAdvice = `🚗 <b>Транспорт:</b> На транспорт уходит ${percentOfExpense}% бюджета. Если часть из этого — такси, попробуйте чаще пользоваться каршерингом или общественным транспортом.`;
        } else if (titleLower.includes('одежд') || titleLower.includes('обувь') || titleLower.includes('шопинг')) {
            customAdvice = `👕 <b>Шопинг:</b> Заметная часть средств (${topCategory[1]} ₸) уходит на одежду. Используйте "правило 24 часов" перед крупными покупками, чтобы избежать импульсивных трат.`;
        }

        if (customAdvice) {
             recommendations.push(customAdvice);
        } else {
             if (percentOfExpense > 40 && sortedExpenses.length > 1) {
                recommendations.push(`🟡 <b>Внимание к тратам:</b> Категория <b>${topCategory[0]}</b> съедает ${percentOfExpense}% всех ваших расходов в этом месяце (${topCategory[1]} ₸). Проанализируйте, есть ли возможность оптимизировать эти затраты.`);
            } else {
                 recommendations.push(`💡 <b>Основная статья расходов:</b> Больше всего вы тратите на <b>${topCategory[0]}</b> (${topCategory[1]} ₸). Контролируйте её, чтобы избежать перерасхода.`);
            }
        }
    }

    if (income > 0) {
        if (income < 150000) {
            recommendations.push(`💡 <b>Совет по доходам:</b> При текущем уровне доходов (${income} ₸) жесткая экономия может вызывать стресс. Рассмотрите возможности для повышения квалификации или поиска дополнительных источников заработка.`);
        } else if (income > 1000000) {
            recommendations.push(`💎 <b>Управление капиталом:</b> У вас высокий уровень дохода (${income} ₸). Убедитесь, что свободные средства работают на вас (депозиты, ценные бумаги, недвижимость), а не просто обесцениваются из-за инфляции.`);
        }
    }

    if (items.length < 5) {
        recommendations.push(`💡 <b>Совет:</b> Записывайте даже мелкие траты (например, кофе, проезд). Именно из них часто складываются незаметные, но крупные суммы за месяц.`);
    }

    if (recommendations.length > 0) {
        widget.style.display = "block";
        container.innerHTML = recommendations.map(rec => {
            let borderColor = 'var(--primary)';
            if (rec.startsWith('🔴')) borderColor = 'var(--danger)';
            else if (rec.startsWith('🟡')) borderColor = '#f59e0b';
            else if (rec.startsWith('🟢')) borderColor = 'var(--success)';

            return `<div style="padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-md); border-left: 4px solid ${borderColor}; font-size: 0.95rem; line-height: 1.6; color: var(--color-text); display: flex; flex-direction: column; gap: 0.25rem; box-shadow: var(--shadow-sm);">
                ${rec.substring(2)}
            </div>`;
        }).join('');
    } else {
        widget.style.display = "none";
    }
}