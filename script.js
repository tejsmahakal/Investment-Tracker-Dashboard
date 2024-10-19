// API Key and Elements
const YOUR_FINNHUB_API_KEY = 'YOUR_FINNHUB_API_KEY';
const investmentSearchInput = document.getElementById('investmentSearch');
const queryButton = document.getElementById('queryButton');
const investmentDetailsContainer = document.getElementById('investmentDetails');
const investmentTableBody = document.getElementById('investmentTable').getElementsByTagName('tbody')[0];
const chartContext = document.getElementById('investmentChart').getContext('2d');
const investmentDropdown = document.getElementById('investmentDropdown');
const fetchInvestmentButton = document.getElementById('fetchInvestmentButton');
let investmentChartInstance;


//Retrieve investment data using the FinnHub API.
async function fetchInvestmentData(investmentSymbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${investmentSymbol}&token=${YOUR_FINNHUB_API_KEY}`);

        const investmentData = await response.json();
        return investmentData['Time Series (Daily)'];
    } catch (error) {
        console.error('Error fetching investment data:', error);
        return null;
    }
}

// Retrieve mock trending investments.

async function fetchTrendingInvestments() {
    // Simulating data for trending investments.

    const trendingInvestments = ['CSCO','VZ','T','XOM','JNJ','ADBE','DJS', 'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'FB', 'NFLX', 'NVDA', 'BABA', 'INTC'];
    return trendingInvestments;
}

// Populate the dropdown menu with trending investments
async function populateInvestmentDropdown() {
    const trendingInvestments = await fetchTrendingInvestments();
    trendingInvestments.forEach(investmentSymbol => {
        const option = document.createElement('option');
        option.value = investmentSymbol;
        option.text = investmentSymbol;
        investmentDropdown.appendChild(option);
    });
}


function displayInvestmentDetails(investmentData, investmentSymbol) {
    const latestDate = Object.keys(investmentData)[0];
    const latestData = investmentData[latestDate];
    const latestPrice = latestData['4. close'];
    const latestVolume = latestData['5. volume'];
    const previousClose = investmentData[Object.keys(investmentData)[1]]['4. close'];
    const priceChange = (latestPrice - previousClose).toFixed(2);

    investmentDetailsContainer.innerHTML = `
        <h3>${investmentSymbol}</h3>
        <p>Price: $${latestPrice}</p>
        <p>Change: $${priceChange}</p>
        <p>Volume: ${latestVolume}</p>
    `;

    addToInvestmentTable(investmentSymbol, latestPrice, priceChange, latestVolume);
}


function addToInvestmentTable(symbol, price, change, volume) {
    const newRow = investmentTableBody.insertRow();
    newRow.innerHTML = `
        <td>${symbol}</td>
        <td>$${price}</td>
        <td>${change}</td>
        <td>${volume}</td>
    `;
}


function renderInvestmentChart(investmentData) {
    const chartLabels = Object.keys(investmentData).slice(0, 30).reverse();
    const chartData = chartLabels.map(date => investmentData[date]['4. close']);

    if (investmentChartInstance) {
        investmentChartInstance.destroy();
    }

    investmentChartInstance = new Chart(chartContext, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Investment Price',
                data: chartData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: false }
            }
        }
    });
}


queryButton.addEventListener('click', async () => {
    const investmentSymbol = investmentSearchInput.value.trim().toUpperCase();
    if (!investmentSymbol) {
        investmentDetailsContainer.innerHTML = '<p>Please enter an investment symbol.</p>';
        return;
    }

    investmentDetailsContainer.innerHTML = '<p>Loading...</p>';
    const investmentData = await fetchInvestmentData(investmentSymbol);

    if (investmentData) {
        displayInvestmentDetails(investmentData, investmentSymbol);
        renderInvestmentChart(investmentData);
    } else {
        investmentDetailsContainer.innerHTML = `<p>Investment symbol "${investmentSymbol}" not found.</p>`;
    }
});


fetchInvestmentButton.addEventListener('click', async () => {
    const selectedInvestmentSymbol = investmentDropdown.value;
    if (!selectedInvestmentSymbol) return;

    investmentDetailsContainer.innerHTML = '<p>Loading...</p>';
    const investmentData = await fetchInvestmentData(selectedInvestmentSymbol);

    if (investmentData) {
        displayInvestmentDetails(investmentData, selectedInvestmentSymbol);
        renderInvestmentChart(investmentData);
    } else {
        investmentDetailsContainer.innerHTML = `<p>Investment data not available for "${selectedInvestmentSymbol}".</p>`;
    }
});

// Initialize investment dropdown with trending investments
populateInvestmentDropdown();
