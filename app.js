const renoRates = {
  light: 300,
  standard: 525,
  heavy: 800
};

const cities = [
  { id: "city-1", name: "mont de marsan", priceM2: 7, realPriceM2: 0, distance: "1h29min", km: 124, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 },
  { id: "city-2", name: "hagetmau", priceM2: 8, realPriceM2: 0, distance: "1h28min", km: 109, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 },
  { id: "city-3", name: "puyoo", priceM2: 7, realPriceM2: 0, distance: "54 min", km: 66.7, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 },
  { id: "city-4", name: "orthez", priceM2: 7, realPriceM2: 0, distance: "1h04min", km: 83.6, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 },
  { id: "city-5", name: "oloron sainte marie", priceM2: 8, realPriceM2: 0, distance: "1h40min", km: 95.8, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 },
  { id: "city-6", name: "caresse cassaber", priceM2: 7, realPriceM2: 0, distance: "1h", km: 64.6, trips: 6, fuelConsumption: 6, fuelLiterPrice: 1.67, weeks: 96 }
];

const projects = [
  { cityId: "city-1", buyPrice: 55000, area: 200, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-2", buyPrice: 56000, area: 184, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-2", buyPrice: 65000, area: 120, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-2", buyPrice: 72000, area: 136, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-3", buyPrice: 60000, area: 80, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-6", buyPrice: 77000, area: 190, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-5", buyPrice: 77000, area: 153, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-4", buyPrice: 70000, area: 130, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-4", buyPrice: 77400, area: 210, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-4", buyPrice: 79000, area: 115, renoType: "standard", customRenoRate: 525, adUrl: "" },
  { cityId: "city-4", buyPrice: 76500, area: 255, renoType: "standard", customRenoRate: 525, adUrl: "" }
];

let activeCityId = "all";

const cityRows = document.querySelector("#citiesBody");
const projectRows = document.querySelector("#projectsBody");
const cityTemplate = document.querySelector("#cityRowTemplate");
const projectTemplate = document.querySelector("#projectRowTemplate");
const cityFilters = document.querySelector("#cityFilters");
const addCity = document.querySelector("#addCity");
const addProject = document.querySelector("#addProject");
const lightRenoRate = document.querySelector("#lightRenoRate");
const standardRenoRate = document.querySelector("#standardRenoRate");
const heavyRenoRate = document.querySelector("#heavyRenoRate");

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const decimal = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2
});

function safePrice(city) {
  return city.priceM2 * 0.8;
}

function rentPrice(city) {
  return city.realPriceM2 > 0 ? city.realPriceM2 : safePrice(city);
}

function renoRate(project) {
  return project.renoType === "custom" ? project.customRenoRate : renoRates[project.renoType];
}

function renoBudget(project) {
  return project.area * renoRate(project);
}

function projectResult(project) {
  const city = cities.find((item) => item.id === project.cityId) || cities[0];
  const renovation = renoBudget(project);
  const globalCost = project.buyPrice + renovation;
  const rentTotal = project.area * rentPrice(city) * 12 * 21;
  const rentNet = rentTotal * 0.7;

  return {
    renovation,
    globalCost,
    rentTotal,
    rentNet,
    result: rentNet - globalCost
  };
}

function formatEuro(value) {
  return euro.format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value) {
  return decimal.format(Number.isFinite(value) ? value : 0);
}

function parseNumber(value) {
  return Number(String(value).replace(",", ".")) || 0;
}

function normalizeUrl(value) {
  const url = value.trim();

  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function fillCityCalculation(row, city) {
  const weeklyCost = city.km * (city.fuelConsumption / 100) * city.fuelLiterPrice * city.trips;
  const travelCost = weeklyCost * city.weeks;
  const safePriceButton = row.querySelector(".safe-price-button");

  safePriceButton.textContent = `${formatNumber(safePrice(city))} EUR`;
  safePriceButton.classList.toggle("using-real-price", city.realPriceM2 > 0);
  row.querySelector(".week-cost").textContent = formatEuro(weeklyCost);
  row.querySelector(".travel-cost").textContent = formatEuro(travelCost);
}

function fillProjectCalculation(row, project) {
  const rate = renoRate(project);
  const calculation = projectResult(project);
  const rateInput = row.querySelector(".reno-rate-input");
  const adLink = row.querySelector(".ad-link");
  const normalizedAdUrl = normalizeUrl(project.adUrl);

  rateInput.value = rate;
  rateInput.disabled = project.renoType !== "custom";
  row.querySelector(".reno-budget").textContent = formatEuro(calculation.renovation);
  row.querySelector(".global-cost").textContent = formatEuro(calculation.globalCost);
  row.querySelector(".rent-total").textContent = formatEuro(calculation.rentTotal);
  row.querySelector(".rent-net").textContent = formatEuro(calculation.rentNet);

  adLink.href = normalizedAdUrl || "#";
  adLink.classList.toggle("disabled-link", !normalizedAdUrl);

  const resultCell = row.querySelector(".result");
  resultCell.textContent = formatEuro(calculation.result);
  resultCell.classList.toggle("positive", calculation.result >= 0);
  resultCell.classList.toggle("negative", calculation.result < 0);
}

function updateProjectCityOptions() {
  projectRows.querySelectorAll(".place-select").forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = "";

    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.id;
      option.textContent = city.name || "Nouvelle ville";
      select.append(option);
    });

    select.value = cities.some((city) => city.id === currentValue) ? currentValue : cities[0]?.id;
  });
}

function updateCalculations() {
  cityRows.querySelectorAll("tr").forEach((row) => {
    const city = cities[Number(row.dataset.index)];
    if (city) {
      fillCityCalculation(row, city);
    }
  });

  projectRows.querySelectorAll("tr").forEach((row) => {
    const project = projects[Number(row.dataset.index)];
    if (project) {
      fillProjectCalculation(row, project);
    }
  });
}

function filteredProjects() {
  if (activeCityId === "all") {
    return projects.map((project, index) => ({ project, index }));
  }

  return projects
    .map((project, index) => ({ project, index }))
    .filter((item) => item.project.cityId === activeCityId);
}

function buildFilters() {
  cityFilters.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "Toutes";
  allButton.className = activeCityId === "all" ? "filter-button active" : "filter-button";
  allButton.addEventListener("click", () => {
    activeCityId = "all";
    render();
  });
  cityFilters.append(allButton);

  cities.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = city.name || "Nouvelle ville";
    button.className = activeCityId === city.id ? "filter-button active" : "filter-button";
    button.addEventListener("click", () => {
      activeCityId = city.id;
      render();
    });
    cityFilters.append(button);
  });
}

function updateRenoRateInputs() {
  lightRenoRate.value = renoRates.light;
  standardRenoRate.value = renoRates.standard;
  heavyRenoRate.value = renoRates.heavy;
}

function buildCityRows() {
  cityRows.innerHTML = "";

  cities.forEach((city, index) => {
    const row = cityTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.index = index;

    row.querySelector(".city-name-input").value = city.name;
    row.querySelector(".price-input").value = city.priceM2;
    row.querySelector(".real-price-input").value = city.realPriceM2 || "";
    row.querySelector(".distance-input").value = city.distance;
    row.querySelector(".km-input").value = city.km;
    row.querySelector(".trips-input").value = city.trips;
    row.querySelector(".fuel-consumption-input").value = city.fuelConsumption;
    row.querySelector(".fuel-liter-price-input").value = city.fuelLiterPrice;
    row.querySelector(".weeks-input").value = city.weeks;
    fillCityCalculation(row, city);

    row.querySelector(".safe-price-button").addEventListener("click", () => {
      row.classList.toggle("show-real-price");
      if (row.classList.contains("show-real-price")) {
        row.querySelector(".real-price-input").focus();
      }
    });

    row.querySelector(".city-name-input").addEventListener("input", (event) => {
      city.name = event.target.value;
      updateProjectCityOptions();
      buildFilters();
    });

    row.querySelector(".price-input").addEventListener("input", (event) => {
      city.priceM2 = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".real-price-input").addEventListener("input", (event) => {
      city.realPriceM2 = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".distance-input").addEventListener("input", (event) => {
      city.distance = event.target.value;
    });

    row.querySelector(".km-input").addEventListener("input", (event) => {
      city.km = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".trips-input").addEventListener("input", (event) => {
      city.trips = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".fuel-consumption-input").addEventListener("input", (event) => {
      city.fuelConsumption = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".fuel-liter-price-input").addEventListener("input", (event) => {
      city.fuelLiterPrice = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".weeks-input").addEventListener("input", (event) => {
      city.weeks = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".delete-city").addEventListener("click", () => {
      if (cities.length === 1) {
        return;
      }

      const fallbackCity = cities.find((item) => item.id !== city.id);
      projects.forEach((project) => {
        if (project.cityId === city.id) {
          project.cityId = fallbackCity.id;
        }
      });

      if (activeCityId === city.id) {
        activeCityId = "all";
      }

      cities.splice(index, 1);
      render();
    });

    cityRows.append(row);
  });
}

function buildProjectRows() {
  projectRows.innerHTML = "";

  filteredProjects().forEach(({ project, index }) => {
    const row = projectTemplate.content.firstElementChild.cloneNode(true);
    const select = row.querySelector(".place-select");
    const renoSelect = row.querySelector(".reno-select");
    row.dataset.index = index;

    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.id;
      option.textContent = city.name || "Nouvelle ville";
      select.append(option);
    });

    select.value = project.cityId;
    row.querySelector(".buy-input").value = project.buyPrice;
    row.querySelector(".area-input").value = project.area;
    row.querySelector(".reno-rate-input").value = renoRate(project);
    row.querySelector(".ad-link-input").value = project.adUrl;
    renoSelect.value = project.renoType;

    select.addEventListener("change", (event) => {
      project.cityId = event.target.value;
      if (activeCityId !== "all" && project.cityId !== activeCityId) {
        render();
        return;
      }
      updateCalculations();
    });

    row.querySelector(".buy-input").addEventListener("input", (event) => {
      project.buyPrice = parseNumber(event.target.value);
      updateCalculations();
    });

    row.querySelector(".area-input").addEventListener("input", (event) => {
      project.area = parseNumber(event.target.value);
      updateCalculations();
    });

    renoSelect.addEventListener("change", (event) => {
      project.renoType = event.target.value;
      if (project.renoType !== "custom") {
        project.customRenoRate = renoRates[project.renoType];
      }
      updateCalculations();
    });

    row.querySelector(".reno-rate-input").addEventListener("input", (event) => {
      project.customRenoRate = parseNumber(event.target.value);
      project.renoType = "custom";
      renoSelect.value = "custom";
      updateCalculations();
    });

    row.querySelector(".ad-link-input").addEventListener("input", (event) => {
      project.adUrl = event.target.value;
      updateCalculations();
    });

    row.querySelector(".delete-row").addEventListener("click", () => {
      projects.splice(index, 1);
      render();
    });

    fillProjectCalculation(row, project);

    projectRows.append(row);
  });
}

function render() {
  updateRenoRateInputs();
  buildCityRows();
  buildFilters();
  buildProjectRows();
  updateCalculations();
}

lightRenoRate.addEventListener("input", (event) => {
  renoRates.light = parseNumber(event.target.value);
  updateCalculations();
});

standardRenoRate.addEventListener("input", (event) => {
  renoRates.standard = parseNumber(event.target.value);
  updateCalculations();
});

heavyRenoRate.addEventListener("input", (event) => {
  renoRates.heavy = parseNumber(event.target.value);
  updateCalculations();
});

addCity.addEventListener("click", () => {
  const id = `city-${Date.now()}`;
  cities.push({
    id,
    name: "nouvelle ville",
    priceM2: 0,
    realPriceM2: 0,
    distance: "",
    km: 0,
    trips: 6,
    fuelConsumption: 6,
    fuelLiterPrice: 1.67,
    weeks: 96
  });
  render();
});

addProject.addEventListener("click", () => {
  projects.push({
    cityId: activeCityId === "all" ? cities[0].id : activeCityId,
    buyPrice: 0,
    area: 0,
    renoType: "standard",
    customRenoRate: renoRates.standard,
    adUrl: ""
  });
  render();
});

render();
