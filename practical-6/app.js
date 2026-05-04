let currencyData = [];

document.getElementById("current-date").textContent = new Date().toLocaleDateString("uk-UA");

fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
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
        <li class="currency-item">
            <span>${currency.cc} — ${currency.txt}</span>
            <span>${currency.rate.toFixed(2)} грн</span>
        </li>
    `).join("");
}

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