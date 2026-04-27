function processRecurringTransactions() {
    if (typeof getRecurringItems !== 'function' || typeof getItems !== 'function') return;

    let recurring = getRecurringItems();
    if (!recurring || recurring.length === 0) return;

    let items = getItems();
    let hasChanges = false;
    let today = new Date();
    today.setHours(0,0,0,0);

    recurring.forEach(rec => {
        let nextDate = new Date(rec.nextDate);
        nextDate.setHours(0,0,0,0);
        
        while (nextDate <= today) {
            items.push({
                id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
                title: rec.title,
                amount: rec.amount,
                date: nextDate.toISOString().split('T')[0],
                note: rec.note ? (rec.note + " (Автоплатеж)") : "Регулярный платеж",
                type: rec.type
            });

            let interval = rec.interval || 'monthly';
            if (interval === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (interval === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (interval === 'biweekly') {
                nextDate.setDate(nextDate.getDate() + 14);
            } else if (interval === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (interval === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            hasChanges = true;
        }
        
        rec.nextDate = nextDate.toISOString().split('T')[0];
    });

    if (hasChanges) {
        saveItems(items);
        saveRecurringItems(recurring);
    }
}

processRecurringTransactions();
