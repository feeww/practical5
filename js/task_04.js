import { breeds } from './data_sample.js'

const list = document.querySelector("ul");

const groups = [...new Set(breeds.map(b => b.breed_group).filter(Boolean))];

const controls = document.createElement("div");
controls.innerHTML = `
    <input type="text" id="search" placeholder="Пошук за назвою або описом...">
    
    <select id="sort">
        <option value="name">За назвою</option>
        <option value="weight">За вагою</option>
        <option value="height">За висотою</option>
        <option value="life_span">За тривалістю життя</option>
    </select>

    <select id="groupFilter">
        <option value="">Всі групи</option>
        ${groups.map(g => `<option value="${g}">${g}</option>`).join("")}
    </select>

    <input type="number" id="minWeight" placeholder="Мін. вага (кг)" min="0">
    <input type="number" id="maxWeight" placeholder="Макс. вага (кг)" min="0">
`;
document.body.insertAdjacentElement("afterbegin", controls);

function render(data) {
    const html = data.map(breed => `
        <li class="card">
            <img src="https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg">
            <h2>${breed.name}</h2>
            <p class="group">${breed.breed_group || ""}</p>
            <p class="group">${breed.bred_for || ""}</p>
            <p>${breed.temperament || ""}</p>
            <p>Weight: <span>${breed.weight.metric} kg</span></p>
            <p>Height: <span>${breed.height.metric} cm</span></p>
            <p>Life Span: <span>${breed.life_span}</span></p>
        </li>
    `).join("");
    list.innerHTML = html;
}

function parseNum(str) {
    return parseFloat(str.split("-")[0].trim()) || 0;
}

function update() {
    const search = document.getElementById("search").value.toLowerCase();
    const sort = document.getElementById("sort").value;
    const group = document.getElementById("groupFilter").value;
    const minWeight = parseFloat(document.getElementById("minWeight").value) || 0;
    const maxWeight = parseFloat(document.getElementById("maxWeight").value) || Infinity;

    let result = [...breeds];

    if (search) {
        result = result.filter(b =>
            b.name.toLowerCase().includes(search) ||
            (b.description || "").toLowerCase().includes(search) ||
            (b.temperament || "").toLowerCase().includes(search)
        );
    }

    if (group) {
        result = result.filter(b => b.breed_group === group);
    }

    result = result.filter(b => {
        const w = parseNum(b.weight.metric);
        return w >= minWeight && w <= maxWeight;
    });

    if (sort === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "weight") {
        result.sort((a, b) => parseNum(a.weight.metric) - parseNum(b.weight.metric));
    } else if (sort === "height") {
        result.sort((a, b) => parseNum(a.height.metric) - parseNum(b.height.metric));
    } else if (sort === "life_span") {
        result.sort((a, b) => parseNum(a.life_span) - parseNum(b.life_span));
    }

    render(result);
}

document.getElementById("search").addEventListener("input", update);
document.getElementById("sort").addEventListener("change", update);
document.getElementById("groupFilter").addEventListener("change", update);
document.getElementById("minWeight").addEventListener("input", update);
document.getElementById("maxWeight").addEventListener("input", update);

render(breeds);