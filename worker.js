addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // API route: /api/sheet
  if (path === "/api/sheet") {
    return handleSheetProxy(url);
  }
  
  // Static files
  return serveStatic(path);
}

// 處理 /api/sheet 請求
async function handleSheetProxy(url) {
  const sheetUrl = url.searchParams.get('url');
  
  if (!sheetUrl) {
    return new Response('Missing url parameter', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  try {
    const response = await fetch(sheetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpenBI/1.0)'
      }
    });
    
    if (!response.ok) {
      return new Response(`Sheet fetch failed: ${response.status}`, { 
        status: 500 
      });
    }
    
    const data = await response.text();
    
    return new Response(data, {
      headers: {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=300'
      },
    });
    
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

// 提供靜態文件
async function serveStatic(path) {
  if (path === '/' || path === '/index.html') {
    return new Response(INDEX_HTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// 門店名稱對照表
const STORE_NAMES = {
  'KD': 'Kota Damansara',
  'SP': 'Sri Petaling',
  'KP': 'Kepong',
  'PI': 'Pandan Indah',
  'PP': 'Pearl Point',
  'MV': 'Mid Valley',
  'OFK': 'Old Fatt Kee',
  'PVL': 'PVL',
  'SS15': 'SS15'
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // For API routes
  if (path === "/api/sheet") {
    return handleSheetProxy(url);
  }
  
  // Static files
  return serveStatic(path);
}

// OpenBI Dashboard HTML
const INDEX_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenBI 餐飲數據</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --sidebar-bg: #1a1f37;
      --sidebar-active: #6366f1;
      --main-bg: #f3f4f6;
      --card-bg: #ffffff;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --border-color: #e5e7eb;
      --success: #10b981;
      --danger: #ef4444;
    }
    body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--main-bg); color: var(--text-primary); min-height: 100vh;}
    .layout {display: flex; min-height: 100vh;}
    .sidebar {width: 260px; background: var(--sidebar-bg); color: white; padding: 24px 16px; position: fixed; height: 100vh;}
    .sidebar-logo {display: flex; align-items: center; gap: 12px; padding: 0 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;}
    .sidebar-logo-icon {width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;}
    .sidebar-logo-text {font-size: 18px; font-weight: 600;}
    .sidebar-section {margin-bottom: 24px;}
    .sidebar-section-title {font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; padding: 0 12px; margin-bottom: 8px;}
    .sidebar-item {display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; font-size: 14px;}
    .sidebar-item:hover {background: rgba(255,255,255,0.05);}
    .sidebar-item.active {background: var(--sidebar-active);}
    .main-content {flex: 1; margin-left: 260px; padding: 24px;}
    .header {display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;}
    .header-title {font-size: 24px; font-weight: 600;}
    .store-selector {display: flex; align-items: center; gap: 12px;}
    .store-selector label {font-size: 14px; color: var(--text-secondary);}
    .store-selector select, .time-range-selector select {padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); font-size: 14px; cursor: pointer; min-width: 120px;}
    .time-range-selector, .trend-selector {display: flex; align-items: center; gap: 8px;}
    .trend-selector select {padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); font-size: 14px; cursor: pointer; min-width: 100px;}
    .kpi-grid {display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;}
    .kpi-card {background: var(--card-bg); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);}
    .kpi-header {display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;}
    .kpi-title {font-size: 14px; color: var(--text-secondary);}
    .kpi-value {font-size: 28px; font-weight: 700;}
    .kpi-unit {font-size: 14px; font-weight: 400; color: var(--text-secondary); margin-left: 4px;}
    .card {background: var(--card-bg); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); margin-bottom: 16px;}
    .card-header {display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;}
    .card-title {font-size: 16px; font-weight: 600;}
    .chart-container {height: 300px; position: relative;}
    .loading {display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--text-secondary);}
    .spinner {width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--sidebar-active); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;}
    @keyframes spin {to { transform: rotate(360deg); }}
    @media (max-width: 1024px) {.kpi-grid {grid-template-columns: repeat(2, 1fr);}}
    @media (max-width: 768px) {
      .sidebar {width: 100%; position: relative; height: auto;}
      .main-content {margin-left: 0;}
      .layout {flex-direction: column;}
      .kpi-grid {grid-template-columns: 1fr;}
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">🍽️</div>
        <div class="sidebar-logo-text">OpenBI</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">餐飲數據</div>
        <div class="sidebar-item active">
          <span>📊</span>
          <span>銷售趨勢</span>
        </div>
      </div>
    </div>

    <main class="main-content">
      <div class="header">
        <h1 class="header-title">OpenBI 餐飲數據</h1>
        <div class="store-selector">
          <label>選擇門店：</label>
          <select id="storeSelect" onchange="onStoreChange()">
            <option value="all">全部門店</option>
          </select>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header"><div class="kpi-title">總銷售額</div></div>
          <div class="kpi-value" id="openbi-sales"><div class="loading"><div class="spinner"></div><div>加載中...</div></div></div>
        </div>
        <div class="kpi-card"><div class="kpi-header"><div class="kpi-title">門店數量</div></div><div class="kpi-value" id="openbi-stores">-</div></div>
        <div class="kpi-card"><div class="kpi-header"><div class="kpi-title">平均日銷售</div></div><div class="kpi-value" id="openbi-daily">-</div></div>
        <div class="kpi-card"><div class="kpi-header"><div class="kpi-title">數據月份</div></div><div class="kpi-value" id="openbi-months">-</div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title" id="trendChartTitle">月度銷售趨勢</div>
          <div class="trend-selector">
            <select id="yearSelect" onchange="onYearChange()"><option value="all">所有年份</option></select>
            <select id="monthSelect" onchange="onTrendMonthChange()" style="display:none;"><option value="all">所有月份</option></select>
          </div>
        </div>
        <div class="chart-container"><canvas id="openbiChart"></canvas></div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">門店銷售額</div>
          <div class="time-range-selector">
            <select id="timeRangeSelect" onchange="onTimeRangeChange()">
              <option value="day">一天</option>
              <option value="week">一週</option>
              <option value="month" selected>一個月</option>
              <option value="year">一年</option>
              <option value="total">總共</option>
            </select>
          </div>
        </div>
        <div class="chart-container"><canvas id="storePieChart"></canvas></div>
      </div>
    </main>
  </div>

  <script>
    const CONFIG = {
      OPENBI_INDEX_URL: 'https://docs.google.com/spreadsheets/d/1Gu-Z1V_3sfOE6pWIGd8Hlg--RfWkBlLhDikQmU1g1Pk/export?format=csv'
    };

    const STORE_NAMES = \${JSON.stringify(STORE_NAMES)};
    
    let globalData = null;
    let currentStore = 'all';
    let currentTimeRange = 'month';
    let selectedYear = 'all';
    let selectedTrendMonth = 'all';

    function formatMoney(amount) { if(!amount||isNaN(amount))return 'RM 0'; return 'RM '+Math.round(amount).toLocaleString('en-MY'); }
    function formatNumber(num) { if(!num||isNaN(num))return '0'; return num.toLocaleString('en-MY'); }

    function parseCSV(csv) {
      const rows = [];
      const lines = csv.split('\\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const row = [];
        let cell = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') { cell += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (char === ',' && !inQuotes) {
            row.push(cell.trim());
            cell = '';
          } else { cell += char; }
        }
        row.push(cell.trim());
        rows.push(row);
      }
      return rows;
    }

    function parseMonthData(rows) {
      if (rows.length < 5) return { total: 0, stores: {}, dailyData: [], weeklyData: {} };
      
      const storeRow = rows[1];
      const headerRow = rows[3];
      const storeNettMap = {};
      let currentStore = null;
      
      for (let i = 0; i < storeRow.length; i++) {
        const cell = storeRow[i];
        if (cell && cell.toString().startsWith('SALES ')) {
          currentStore = cell.toString().replace('SALES ', '');
        }
        if (currentStore && headerRow[i] === 'Nett') {
          if (!storeNettMap[currentStore]) storeNettMap[currentStore] = [];
          storeNettMap[currentStore].push(i);
        }
      }
      
      const stores = {};
      const dailyData = [];
      let total = 0;
      
      for (let i = 4; i < rows.length; i++) {
        const row = rows[i];
        const dayStores = {};
        let dayTotal = 0;
        
        for (const [store, indices] of Object.entries(storeNettMap)) {
          indices.forEach(idx => {
            const val = parseFloat(row[idx]) || 0;
            dayStores[store] = (dayStores[store] || 0) + val;
            stores[store] = (stores[store] || 0) + val;
            dayTotal += val;
            total += val;
          });
        }
        
        dailyData.push({ day: i - 3, stores: dayStores, total: dayTotal });
      }
      
      const weeklyData = {};
      Object.keys(storeNettMap).forEach(store => { weeklyData[store] = 0; });
      const recentDays = dailyData.slice(-7);
      recentDays.forEach(day => {
        for (const [store, val] of Object.entries(day.stores)) {
          weeklyData[store] = (weeklyData[store] || 0) + val;
        }
      });
      
      return { total, stores, dailyData, weeklyData };
    }

    function updateStoreSelector(stores) {
      const select = document.getElementById('storeSelect');
      select.innerHTML = '<option value="all">全部門店</option>';
      Object.keys(stores).forEach(storeCode => {
        const storeName = STORE_NAMES[storeCode] || storeCode;
        const option = document.createElement('option');
        option.value = storeCode;
        option.textContent = storeName;
        select.appendChild(option);
      });
      select.value = currentStore;
    }

    function onStoreChange() { currentStore = document.getElementById('storeSelect').value; if(globalData) renderDashboard(globalData); }
    function onTimeRangeChange() { currentTimeRange = document.getElementById('timeRangeSelect').value; if(globalData) renderOpenBICharts(globalData.months, globalData.stores); }
    function onYearChange() {
      selectedYear = document.getElementById('yearSelect').value;
      selectedTrendMonth = 'all';
      document.getElementById('monthSelect').value = 'all';
      if(selectedYear==='all'){
        document.getElementById('monthSelect').style.display='none';
        document.getElementById('trendChartTitle').textContent='月度銷售趨勢';
      }else{
        document.getElementById('monthSelect').style.display='inline-block';
        updateMonthSelect(selectedYear);
        document.getElementById('trendChartTitle').textContent=selectedYear+'年 每日銷售';
      }
      if(globalData) renderOpenBICharts(globalData.months, globalData.stores);
    }
    function onTrendMonthChange() {
      selectedTrendMonth = document.getElementById('monthSelect').value;
      if(selectedTrendMonth==='all')
        document.getElementById('trendChartTitle').textContent=selectedYear+'年 月度銷售';
      else
        document.getElementById('trendChartTitle').textContent=selectedYear+'年 '+selectedTrendMonth+'月 每日銷售';
      if(globalData) renderOpenBICharts(globalData.months, globalData.stores);
    }

    function updateYearSelect(months) {
      const yearSelect = document.getElementById('yearSelect');
      const years = [...new Set(months.map(m => m.year))].sort();
      yearSelect.innerHTML = '<option value="all">所有年份</option>';
      years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
      });
    }

    function updateMonthSelect(year) {
      const monthSelect = document.getElementById('monthSelect');
      const months = globalData.months.filter(m => m.year === year);
      monthSelect.innerHTML = '<option value="all">所有月份</option>';
      months.forEach(m => {
        const option = document.createElement('option');
        option.value = m.month;
        option.textContent = m.month;
        monthSelect.appendChild(option);
      });
    }

    function renderDashboard(data) {
      let grandTotal = 0;
      let storeCount = 0;
      let monthData = [];
      
      if (currentStore === 'all') {
        grandTotal = data.total;
        storeCount = Object.keys(data.stores).length;
        monthData = data.months;
      } else {
        monthData = data.months.map(m => ({
          year: m.year, month: m.month,
          total: m.stores[currentStore] || 0,
          stores: { [currentStore]: m.stores[currentStore] || 0 }
        }));
        grandTotal = monthData.reduce((sum, m) => sum + m.total, 0);
        storeCount = 1;
      }
      
      document.getElementById('openbi-sales').textContent = formatMoney(grandTotal);
      document.getElementById('openbi-stores').textContent = storeCount + ' 間';
      document.getElementById('openbi-daily').textContent = monthData.length > 0 ? formatMoney(grandTotal / (monthData.length * 30)) : 'RM 0';
      document.getElementById('openbi-months').textContent = monthData.length + ' 個月';
      
      renderOpenBICharts(monthData, data.stores);
    }

    async function loadOpenBIData() {
      try {
        console.log('Loading OpenBI data...');
        document.getElementById('openbi-sales').innerHTML = '<div class="loading"><div class="spinner"></div><div>加載中...</div></div>';
        
        const indexResponse = await fetch('/api/sheet?url=' + encodeURIComponent(CONFIG.OPENBI_INDEX_URL));
        const indexCsv = await indexResponse.text();
        const indexRows = parseCSV(indexCsv);
        const months = [];
        for (let i = 1; i < indexRows.length; i++) {
          const row = indexRows[i];
          if (row[0] && row[1] && row[2]) {
            months.push({ year: row[0], month: row[1], url: row[2] });
          }
        }
        
        const monthData = [];
        const storeTotals = {};
        let grandTotal = 0;
        
        for (const m of months) {
          try {
            const monthResponse = await fetch('/api/sheet?url=' + encodeURIComponent(m.url));
            const monthCsv = await monthResponse.text();
            const monthRows = parseCSV(monthCsv);
            const data = parseMonthData(monthRows);
            
            monthData.push({
              year: m.year, month: m.month, total: data.total,
              stores: data.stores, dailyData: data.dailyData, weeklyData: data.weeklyData
            });
            
            grandTotal += data.total;
            for (const [store, sales] of Object.entries(data.stores)) {
              storeTotals[store] = (storeTotals[store] || 0) + sales;
            }
          } catch (e) {
            console.log('Failed to load month:', m.year + '-' + m.month);
          }
        }
        
        globalData = { months: monthData, total: grandTotal, stores: storeTotals };
        updateStoreSelector(storeTotals);
        updateYearSelect(monthData);
        renderDashboard(globalData);
        
      } catch (error) {
        console.error('OpenBI load error:', error);
        document.getElementById('openbi-sales').innerHTML = '<span style="color: red;">錯誤</span>';
      }
    }

    function renderOpenBICharts(months, stores) {
      const monthOrder = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      months.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
      
      try {
        if (window.openbiChart && typeof window.openbiChart.destroy === 'function') window.openbiChart.destroy();
        if (window.storePieChart && typeof window.storePieChart.destroy === 'function') window.storePieChart.destroy();
      } catch (e) { console.log('No existing charts to destroy'); }

      let trendLabels = [];
      let trendData = [];
      
      if (selectedYear === 'all') {
        trendLabels = months.map(m => m.year + '-' + m.month);
        trendData = months.map(m => m.total);
      } else if (selectedTrendMonth === 'all') {
        const yearMonths = months.filter(m => m.year === selectedYear);
        trendLabels = yearMonths.map(m => m.month);
        trendData = yearMonths.map(m => m.total);
      } else {
        const monthData = months.find(m => m.year === selectedYear && m.month === selectedTrendMonth);
        if (monthData && monthData.dailyData) {
          const validDays = monthData.dailyData.slice(0, 31);
          trendLabels = validDays.map((d, i) => (i + 1).toString());
          trendData = validDays.map(d => d.total);
        }
      }

      function calculateTimeRangeValues() {
        const result = {};
        Object.keys(stores).forEach(store => { result[store] = 0; });
        
        switch(currentTimeRange) {
          case 'day':
            months.forEach(m => {
              if (m.dailyData && m.dailyData.length > 0) {
                m.dailyData.forEach(day => {
                  for (const [store, val] of Object.entries(day.stores)) {
                    result[store] = (result[store] || 0) + val;
                  }
                });
              }
            });
            const totalDays = months.reduce((sum, m) => sum + (m.dailyData ? m.dailyData.length : 0), 0);
            if (totalDays > 0) {
              for (const store in result) { result[store] = result[store] / totalDays; }
            }
            break;
          case 'week':
            const lastMonth = months[months.length - 1];
            if (lastMonth && lastMonth.weeklyData) {
              for (const [store, val] of Object.entries(lastMonth.weeklyData)) { result[store] = val; }
            }
            break;
          case 'month':
            const recentMonth = months[months.length - 1];
            if (recentMonth && recentMonth.stores) {
              for (const [store, val] of Object.entries(recentMonth.stores)) { result[store] = val; }
            }
            break;
          case 'year':
          case 'total':
            months.forEach(m => {
              for (const [store, val] of Object.entries(m.stores)) {
                result[store] = (result[store] || 0) + val;
              }
            });
            break;
        }
        return result;
      }

      const timeRangeValues = calculateTimeRangeValues();

      const ctx = document.getElementById('openbiChart').getContext('2d');
      window.openbiChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{ 
            label: '銷售額 (RM)', data: trendData, 
            borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff',
            pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8, fill: true, tension: 0.3
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: v => 'RM ' + v.toLocaleString() } } }
        },
        plugins: [{
          afterDatasetsDraw: function(chart) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((point, index) => {
                const value = dataset.data[index];
                ctx.fillStyle = '#374151';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('RM ' + (value / 1000).toFixed(0) + 'k', point.x, point.y - 8);
              });
            });
          }
        }]
      });

      function formatValue(value) {
        if (currentTimeRange === 'day') return 'RM ' + value.toFixed(0);
        else if (currentTimeRange === 'week') return 'RM ' + (value / 1000).toFixed(1) + 'k';
        else if (value >= 1000000) return 'RM ' + (value / 1000000).toFixed(1) + 'M';
        else if (value >= 1000) return 'RM ' + (value / 1000).toFixed(0) + 'k';
        else return 'RM ' + value.toFixed(0);
      }

      const barCtx = document.getElementById('storePieChart').getContext('2d');
      const storeLabels = Object.keys(stores).map(code => STORE_NAMES[code] || code);
      const storeValues = Object.keys(stores).map(code => timeRangeValues[code] || 0);
      
      window.storePieChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: storeLabels,
          datasets: [{ 
            label: '總銷售額 (RM)', data: storeValues, 
            backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16'],
            borderRadius: 6, borderSkipped: false
          }]
        },
        options: { 
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: v => 'RM ' + (v / 1000).toFixed(0) + 'k' } } },
          plugins: { legend: { display: false } }
        },
        plugins: [{
          afterDatasetsDraw: function(chart) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                ctx.fillStyle = '#374151';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(formatValue(value), bar.x, bar.y - 4);
              });
            });
          }
        }]
      });
    }

    document.addEventListener('DOMContentLoaded', () => { loadOpenBIData(); });
  </script>
</body>
</html>`;