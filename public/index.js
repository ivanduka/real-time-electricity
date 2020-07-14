let chartData; // global on purpose

const requestData = async () => {
  const result = await fetch('/api/1');
  if (result.ok) {
    chartData = await result.json();
  } else {
    console.log("Error", result)
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Highcharts.chart('container', {
    chart: {
      type: 'area',
      marginRight: 150
    },
    events: {
      load: requestData
    },
    title: {
      text: "Test Data"
    },
    data: {
      enablePolling: true,
      dataRefreshRate: 1,
    },
    series: [{
      name: 'Random data',
      data: []
    }],
    plotOptions: {
      area: {
        stacking: 'normal',
      }
    },
    yAxis: {
      title: {
        text: 'Million barrels per day'
      },
      labels: {
        formatter: function () {
          return parseInt(this.value) / 1000000
        }
      },
      tickInterval: 1000000,
      maxPadding: 0,
      minPadding: 0,
      showLastLabel: true
    },
    legend: {
      align: "right",
      verticalAlign: "center",
      layout: "vertical",
      x: 0,
      y: 150
    },
  });
});