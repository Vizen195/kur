const form = document.getElementById("form");
const dateInput = document.getElementById("date");

if(dateInput && !dateInput.value) {
    dateInput.valueAsDate = new Date();
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const typeRadio = document.querySelector('input[name="type"]:checked');
    const type = typeRadio ? typeRadio.value : 'expense';
    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();
    const isRecurringCheckbox = document.getElementById("isRecurring");
    const isRecurring = isRecurringCheckbox ? isRecurringCheckbox.checked : false;

    if (!title || !amount || !date) {
        alert("Заполните обязательные поля: Название, Сумма, Дата");
        return;
    }

    const items = getItems();
    const signedAmount = type === "income" ? amount : -amount;

    if (isRecurring) {
        const recurringItems = typeof getRecurringItems === "function" ? getRecurringItems() : [];
        recurringItems.push({
            id: generateId(),
            title: title,
            amount: signedAmount,
            nextDate: date, 
            interval: document.getElementById("recurringInterval").value,
            note: note,
            type: type
        });
        if (typeof saveRecurringItems === "function") {
            saveRecurringItems(recurringItems);
        }
    } else {
        items.push({ id: generateId(), title, amount: signedAmount, date, note, type });
        saveItems(items);
    }

    alert("Операция добавлена!");
    window.location.href = "index.html";
});