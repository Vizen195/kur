const STORAGE_KEY = "finance_items";
const GOALS_KEY = "finance_goals";
const RECURRING_KEY = "finance_recurring";

function getItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getGoals() {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
}

function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function getRecurringItems() {
    return JSON.parse(localStorage.getItem(RECURRING_KEY)) || [];
}

function saveRecurringItems(items) {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(items));
}