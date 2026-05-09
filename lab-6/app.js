let currencyData = [];
let selectedCurrencyCode = null;

document.getElementById("current-date").textContent =
    new Date().toLocaleDateString("uk-UA");

const apiUrl = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange";

const todayStr = new Date().toISOString().slice(0, 10);
document.getElementById("date-from").max = todayStr;
document.getElementById("date-to").max = todayStr;

function getDatesBetween(from, to) {
    const dates = [];
    const current = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    while (current <= end) {
        const formatted = current.toISOString().slice(0, 10).replace(/-/g, "");
        dates.push(formatted);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function getLastDates(daysCount) {
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().slice(0, 10).replace(/-/g, ""));
    }
    return dates;
}

async function fetchRates(valcode, date) {
    try {
        const response = await fetch(`${apiUrl}?valcode=${valcode}&date=${date}&json`);
        const data = await response.json();
        return data[0];
    } catch (error) {
        throw error;
    }
}

async function loadCurrencyHistory(currencyCode, dates) {
    const historyOutput = document.getElementById("history-output");
    historyOutput.innerHTML = "<p>Завантаження...</p>";

    try {
        const results = await Promise.all(
            dates.map(date => fetchRates(currencyCode, date))
        );

        const sorted = results
            .filter(Boolean)
            .sort((a, b) => {
                const dateA = new Date(a.exchangedate.split(".").reverse().join("-"));
                const dateB = new Date(b.exchangedate.split(".").reverse().join("-"));
                return dateB - dateA;
            });

        console.log(sorted);
        renderHistory(sorted, currencyCode);
    } catch (error) {
        console.error("Помилка завантаження історії:", error);
        historyOutput.innerHTML = "<p>Помилка завантаження даних</p>";
    }
}

function renderHistory(data, currencyCode) {
    const historyOutput = document.getElementById("history-output");
    historyOutput.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Курс ${currencyCode}</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                    <tr>
                        <td>${item.exchangedate}</td>
                        <td>${item.rate.toFixed(2)} грн</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

fetch(`${apiUrl}?json`)
    .then(response => response.json())
    .then(data => {
        currencyData = data;
        renderList(data);
        fillSelects(data);
    })
    .catch(err => console.error("Помилка завантаження даних:", err));

function renderList(data) {
    const list = document.getElementById("currency-list");
    list.innerHTML = data.map(currency => `
        <li class="currency-item" data-code="${currency.cc}">
            <span>${currency.cc} — ${currency.txt}</span>
            <span>${currency.rate.toFixed(2)} грн</span>
        </li>
    `).join("");

    list.querySelectorAll(".currency-item").forEach(item => {
        item.addEventListener("click", () => {
            list.querySelectorAll(".currency-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            selectedCurrencyCode = item.dataset.code;

            document.getElementById("history-title").textContent =
                `Курс ${selectedCurrencyCode} за тиждень`;

            document.getElementById("date-range").style.display = "flex";

            loadCurrencyHistory(selectedCurrencyCode, getLastDates(7));
        });
    });
}

document.getElementById("load-range").addEventListener("click", () => {
    const from = document.getElementById("date-from").value;
    const to = document.getElementById("date-to").value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!from || !to) {
        alert("Оберіть обидві дати");
        return;
    }

    if (new Date(from) > new Date(to)) {
        alert("Дата 'Від' не може бути пізніше за 'До'");
        return;
    }

    if (new Date(from) > today) {
        alert("Дата 'Від' не може бути в майбутньому");
        return;
    }

    if (new Date(to) > today) {
        alert("Дата 'До' не може бути в майбутньому");
        return;
    }

    if (!selectedCurrencyCode) {
        alert("Оберіть валюту зі списку");
        return;
    }

    document.getElementById("history-title").textContent =
        `Курс ${selectedCurrencyCode} з ${from} по ${to}`;

    loadCurrencyHistory(selectedCurrencyCode, getDatesBetween(from, to));
});

function fillSelects(data) {
    const options = data.map(currency =>
        `<option value="${currency.cc} — ${currency.txt}" data-rate="${currency.rate}">`
    ).join("");

    document.getElementById("currency-list-1").innerHTML = options;
    document.getElementById("currency-list-2").innerHTML = options;
}

function getRate(datalistId, inputId) {
    const inputValue = document.getElementById(inputId).value;
    const options = document.getElementById(datalistId).options;
    for (let option of options) {
        if (option.value === inputValue) {
            return parseFloat(option.dataset.rate);
        }
    }
    return null;
}

function convertToUah() {
    const amount = parseFloat(document.getElementById("amount-foreign").value);
    const rate = getRate("currency-list-1", "currency-input-1");
    if (!isNaN(amount) && rate) {
        document.getElementById("amount-uah").value = (amount * rate).toFixed(2);
    } else {
        document.getElementById("amount-uah").value = "";
    }
}

function convertFromUah() {
    const amount = parseFloat(document.getElementById("amount-uah-2").value);
    const rate = getRate("currency-list-2", "currency-input-2");
    if (!isNaN(amount) && rate) {
        document.getElementById("amount-foreign-2").value = (amount / rate).toFixed(2);
    } else {
        document.getElementById("amount-foreign-2").value = "";
    }
}

document.getElementById("amount-foreign").addEventListener("input", convertToUah);
document.getElementById("currency-input-1").addEventListener("input", convertToUah);
document.getElementById("amount-uah-2").addEventListener("input", convertFromUah);
document.getElementById("currency-input-2").addEventListener("input", convertFromUah);