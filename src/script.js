const validUser = {
  email: "demo@velora.com",
  password: "velora2026"
};

const salesData = [
  { month: "January", category: "Groceries", sales: 12500, orders: 320 },
  { month: "February", category: "Electronics", sales: 18200, orders: 210 },
  { month: "March", category: "Clothing", sales: 9700, orders: 260 },
  { month: "April", category: "Groceries", sales: 14300, orders: 350 },
  { month: "May", category: "Electronics", sales: 22100, orders: 240 },
  { month: "June", category: "Home Goods", sales: 11500, orders: 180 },
  { month: "July", category: "Clothing", sales: 13400, orders: 300 },
  { month: "August", category: "Groceries", sales: 16800, orders: 390 },
  { month: "September", category: "Electronics", sales: 24500, orders: 260 },
  { month: "October", category: "Home Goods", sales: 15200, orders: 220 },
  { month: "November", category: "Groceries", sales: 19800, orders: 410 },
  { month: "December", category: "Electronics", sales: 31200, orders: 330 }
];

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const categoryFilter = document.getElementById("categoryFilter");
const resetFilterBtn = document.getElementById("resetFilterBtn");

let monthlySalesChart = null;
let categorySalesChart = null;
let dashboardInitialized = false;

/* Login */

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (email === validUser.email && password === validUser.password) {
    sessionStorage.setItem("isLoggedIn", "true");
    loginError.textContent = "";
    showDashboard();
  } else {
    loginError.textContent = "Invalid email or password. Please try again.";
  }
});

logoutBtn.addEventListener("click", function () {
  sessionStorage.removeItem("isLoggedIn");
  showLogin();
});

function showDashboard() {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");

  if (!dashboardInitialized) {
    initializeDashboard();
    dashboardInitialized = true;
  }

  renderDashboard();
}

function showLogin() {
  dashboardPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

/* Keep user logged in after refresh */

if (sessionStorage.getItem("isLoggedIn") === "true") {
  showDashboard();
} else {
  showLogin();
}

/* Dashboard */

function initializeDashboard() {
  const categories = [...new Set(salesData.map(item => item.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.addEventListener("change", renderDashboard);

  resetFilterBtn.addEventListener("click", function () {
    categoryFilter.value = "all";
    renderDashboard();
  });
}

function getFilteredData() {
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === "all") {
    return salesData;
  }

  return salesData.filter(item => item.category === selectedCategory);
}

function renderDashboard() {
  const filteredData = getFilteredData();

  updateKpis(filteredData);
  renderCharts(filteredData);
  renderInsights(filteredData);
  renderTable(filteredData);
}

function updateKpis(data) {
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  document.getElementById("totalSales").textContent = `€${totalSales.toLocaleString()}`;
  document.getElementById("totalOrders").textContent = totalOrders.toLocaleString();
  document.getElementById("averageOrder").textContent = `€${averageOrder.toFixed(2)}`;

  const categoryTotals = getCategoryTotals(data);
  const topCategory = getTopCategory(categoryTotals);

  document.getElementById("topCategory").textContent = topCategory;
}

function getCategoryTotals(data) {
  const categoryTotals = {};

  data.forEach(item => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }

    categoryTotals[item.category] += item.sales;
  });

  return categoryTotals;
}

function getMonthlyTotals(data) {
  const monthlyTotals = {};

  data.forEach(item => {
    if (!monthlyTotals[item.month]) {
      monthlyTotals[item.month] = 0;
    }

    monthlyTotals[item.month] += item.sales;
  });

  return monthlyTotals;
}

function getTopCategory(categoryTotals) {
  const categories = Object.keys(categoryTotals);

  if (categories.length === 0) {
    return "-";
  }

  return categories.reduce((a, b) =>
    categoryTotals[a] > categoryTotals[b] ? a : b
  );
}

function renderCharts(data) {
  const monthlyTotals = getMonthlyTotals(data);
  const categoryTotals = getCategoryTotals(data);

  const months = Object.keys(monthlyTotals);
  const monthlySales = Object.values(monthlyTotals);

  const categories = Object.keys(categoryTotals);
  const categorySales = Object.values(categoryTotals);

  if (monthlySalesChart) {
    monthlySalesChart.destroy();
  }

  if (categorySalesChart) {
    categorySalesChart.destroy();
  }

  monthlySalesChart = new Chart(document.getElementById("monthlySalesChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Monthly Sales (€)",
          data: monthlySales,
          borderWidth: 3,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });

  categorySalesChart = new Chart(document.getElementById("categorySalesChart"), {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Sales by Category (€)",
          data: categorySales,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

function renderInsights(data) {
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  const categoryTotals = getCategoryTotals(data);
  const topCategory = getTopCategory(categoryTotals);

  const bestMonth = data.reduce((best, current) => {
    return current.sales > best.sales ? current : best;
  }, data[0]);

  const insightsList = document.getElementById("insightsList");
  insightsList.innerHTML = "";

  const insights = [
    `The total sales amount is €${totalSales.toLocaleString()}.`,
    `The dashboard includes ${totalOrders.toLocaleString()} customer orders.`,
    `${topCategory} is the strongest product category based on total sales.`,
    `${bestMonth.month} had the highest monthly sales with €${bestMonth.sales.toLocaleString()}.`,
    `The average order value is €${averageOrder.toFixed(2)}.`
  ];

  insights.forEach(insight => {
    const li = document.createElement("li");
    li.textContent = insight;
    insightsList.appendChild(li);
  });
}

function renderTable(data) {
  const tableBody = document.getElementById("salesTableBody");
  tableBody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.month}</td>
      <td>${item.category}</td>
      <td>€${item.sales.toLocaleString()}</td>
      <td>${item.orders.toLocaleString()}</td>
    `;

    tableBody.appendChild(row);
  });
}