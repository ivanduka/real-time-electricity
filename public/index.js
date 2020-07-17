/* global Highcharts */

// Styling

const colors = {
  price: {
    dark: '#2e684c',
    main: '#66a182',
    light: '#a8e5c4',
  },
  supply: {
    dark: 'rgb(35, 90, 103)',
    main: 'rgb(59,167, 191)',
    light: 'rgb(147, 215, 230)',
    series: ['#ffd700', '#ffb14e', '#fa8775', '#ea5f94', '#cd34b5', '#9d02d7', '#0000ff'],
  },
  demand: {
    main: 'rgba(239, 107, 0, 1)', // ef6b00
    light: 'rgba(239, 151, 0, 1)',
    dark: 'rgb(50, 23, 1)',
    ultralight: '#ffc163',
    set: ['#620000', '#911700', '#b93e00', '#e16000', '#fc8c2c', '#ffc163'],
  },
  text: {
    main: 'rgba(50, 59, 61, 1)',
    light: '#aaa',
    emph: '#6b0011',
  },
  background: {
    main: '#fff',
    gridline: '#ccc',
  },
};

const lineWidths = {
  forecast: 2,
  regular: 2,
  emph: 3,
};

const globalLabelOptions = {
  style: {
    fontWeight: 'normal',
  },
};

const globalSplineOptions = {
  lineWidth: lineWidths.regular,
  fillOpacity: 1.0,
  states: {
    hover: {
      lineWidth: lineWidths.emph,
    },
    inactive: {
      opacity: 0.7,
    },
    select: {
      opacity: 1,
    },
  },
  marker: {
    enabled: false,
    halo: {
      size: 10,
    },
  },
  label: globalLabelOptions,
};

const globalAreaSplineOptions = {
  lineWidth: 4,
  fillOpacity: 1.0,
  states: {
    hover: {
      lineWidth: 5,
    },
    inactive: {
      opacity: 0.9,
    },
  },
  marker: {
    enabled: false,
  },
  label: globalLabelOptions,
};

const priceTooltipOptions = {
  valuePrefix: '$',
};

const mwTooltipOptions = {
  valueSuffix: ' MW',
};

const globalXAxisOptionsDateTime = {
  type: 'datetime',
  labels: {
    overflow: 'justify',
  },
  dateTimeLabelFormats: {
    month: '%e. %b',
    year: '%b',
  },
  title: {
    text: 'Date',
  },
};

const globalYAxisOptionsPrice = {
  title: {
    text: 'Price ($/MWh)',
  },
  minorGridLineWidth: 0,
  gridLineWidth: 0,
  alternateGridColor: null,
};

const globalYAxisOptionsMW = {
  title: {
    text: 'MW',
  },
  minorGridLineWidth: 0,
  gridLineWidth: 0,
  alternateGridColor: null,
};

function setGlobalChartTheme() {
  Highcharts.theme = {
    chart: {
      backgroundColor: {
        color: colors.background.main,
      },
      height: 600,
      spacingTop: 50,
      spacingBottom: 50,
      zoomType: 'xy',
      style: {
        font: '0.8em "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontWeight: 'normal',
      },
    },
    title: {
      style: {
        color: colors.text.main,
        font: 'bold 2em "Helvetica Neue", Helvetica, Arial, sans-serif',
      },
      margin: 50,
      align: 'center',
    },
    subtitle: {
      style: {
        color: colors.text.light,
        font: '1.2em "Helvetica Neue", Helvetica, Arial, sans-serif',
      },
      align: 'center',
    },
    legend: {
      itemStyle: {
        font: '0.8em "Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.text.main,
      },
      itemHoverStyle: {
        color: colors.text.light,
      },
    },
    xAxis: {
      dateTimeLabelFormats: {
        hour: '%H:%M',
        day: '%b %e',
        year: '%Y',
      },
      title: {
        enabled: false,
      },
      crosshair: {
        className: 'crosshair',
        color: colors.background.gridline,
        width: 1,
      },
      lineColor: colors.background.gridline,
      gridLineColor: colors.background.gridline,
    },
    yAxis: {
      crosshair: {
        className: 'crosshair',
        color: colors.background.gridline,
        width: 1,
      },
      lineColor: colors.background.gridline,
      gridLineColor: colors.background.gridline,
    },
  };

  // Apply the theme
  Highcharts.setOptions(Highcharts.theme);
}

// Charts definitions

const charts = [
  {
    // AB: PRICE Realtime, Forecast
    divId: 'ab-rt-fc-price',
    enabled: true,
    realtimeInterval: 3600000, // every hour
    keyCol: 0,
    seriesInfo: [
      {
        name: 'forecast',
        valCol: 'Forecast Pool Price',
      },
      {
        name: 'price',
        valCol: 'Actual Posted Pool Price',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Forecasted Pool Price ($/MWh)',
          color: colors.price.light,
          dashStyle: 'shortdot',
          data: [],
        },
        {
          name: 'Actual Posted Pool Price ($/MWh)',
          color: colors.price.main,
          data: [],
        },
      ],
      title: {
        text: 'Realtime and forecasted electricity pool price (Alberta)',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph provides real time, hourly information on the Forecasted and Actual Pool Price two hours ahead of the current hour.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsPrice,

      tooltip: priceTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {},
    },
  },
  {
    // AB: DEMAND Realtime, Forecast
    divId: 'ab-rt-fc-demand',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    keyCol: 0,
    seriesInfo: [
      {
        name: 'day-ahead forecasted ail',
        valCol: 'Day-Ahead Forecasted AIL',
      },
      {
        name: 'actual ail',
        valCol: 'Actual AIL',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'areaspline',
      },
      series: [
        {
          name: 'Day-Ahead Forecasted AIL',
          color: colors.demand.ultralight,
          data: [],
        },
        {
          name: 'Actual AIL',
          color: colors.demand.main,
          data: [],
        },
      ],
      title: {
        text: 'Day-Ahead Forecasted and Actual Internal Load (Alberta)',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph provides real time, hourly information on the Forecasted and Actual internal load two hours ahead of the current hour.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: {
        title: {
          text: 'Load (MW)',
        },
      },
      tooltip: mwTooltipOptions,
      plotOptions: {
        areaspline: globalAreaSplineOptions,
      },
      navigation: {},
    },
  },
  {
    // AB: PRICE Historical
    divId: 'ab-ht-price_hourly',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    keyCol: 0,
    seriesInfo: [
      {
        name: 'pool price',
        valCol: 'Price ($)',
      },
      {
        name: '30-day rolling average pool price',
        valCol: '30Ravg ($)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Pool Price ($/MWh)',
          color: colors.price.main,
          data: [],
        },
        {
          name: '30-Day Rolling Average Pool Price ($/MWh)',
          color: colors.price.dark,
          dashStyle: 'shortdash',
        },
      ],
      title: {
        text: 'Historical actual and average electricity pool prices (Alberta)',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains hourly historical data on Alberta’s Pool Price and 30-Day Rolling Average Pool Price, which is the average price of the pool prices on the indicated date and the 29 previous days.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsPrice,
      tooltip: priceTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
    },
  },
  {
    // AB: DEMAND and SUPPLY
    divId: 'ab-rt-demand_supply',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    keyCol: 0,
    seriesInfo: [
      // different table format here
      {
        name: 'ail',
        valCol: 'Value (MW)',
      },
      {
        name: 'total net generation',
        valCol: 'Value (MW)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'area',
      },
      series: [
        {
          name: 'Alberta Internal Load (AIL)',
          color: colors.demand.main,
          data: [],
        },
        {
          name: 'Total net generation',
          color: colors.supply.light,
          dashStyle: 'shortdash',
          data: [],
        },
      ],
      title: {
        text: 'Alberta Internal Load (AIL) and Total Net Generation',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains real time data on Alberta\'s Internal load and total net generation. The difference between these two variables is represented by trade, or net actual interchange.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
    },
  },
  {
    // AB: INTERCHANGE Real time electricity trade
    divId: 'ab-rt-interchange',
    enabled: true,
    realtimeInterval: 60000, // every minute
    keyCol: 0,
    seriesInfo: [
      // different table format here
      {
        name: 'British Columbia',
        valCol: 'Actual Flow (MW)',
      },
      {
        name: 'Montana',
        valCol: 'Actual Flow (MW)',
      },
      {
        name: 'Saskatchewan',
        valCol: 'Actual Flow (MW)',
      },
      {
        name: 'Total',
        valCol: 'Actual Flow (MW)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'British Columbia',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Montana',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Saskatchewan',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Total',
          color: colors.supply.series[3],
          data: [],
        },
      ],
      title: {
        text: 'Alberta Realtime Electricity Trade',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains real time data on Alberta\'s electricity trade, or net actual interchange, with surrounding jurisdictions.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
    },
  },
  {
    // AB: SUPPLY Max generation capability by energy group
    divId: 'ab-rt-capability',
    enabled: true,
    realtimeInterval: 60000, // every minute
    keyCol: 0,
    seriesInfo: [
      // different table format here
      {
        name: 'Wind',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Biomass and Other',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Gas',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Hydro',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Coal',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Total',
        valCol: 'TotalMaxWindCapability',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Wind',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Biomass and Other',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Gas',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Hydro',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Coal',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: 'Total',
          color: colors.supply.series[6],
          data: [],
        },
      ],
      title: {
        text: 'Alberta Maximum generation capability by energy group',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains real time data on Alberta\'s maximum generation capability by type of generation.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
    },
  },
  {
    // AB: SUPPLY Total net generation by energy group
    divId: 'ab-rt-generation',
    enabled: true,
    // Fuel (2)={WIND, BIOMASS AND OTHER, GAS, HYDRO, COAL, OTHER, TOTAL}
    // + Total Net Generation (MW) (4) *1 series per fuel type
    realtimeInterval: 60000, // every minute
    keyCol: 0,
    seriesInfo: [
      // different table format here
      {
        name: 'Wind',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Biomass and Other',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Gas',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Hydro',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Coal',
        valCol: 'TotalMaxWindCapability',
      },
      {
        name: 'Total',
        valCol: 'TotalMaxWindCapability',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Wind',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Biomass and Other',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Gas',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Hydro',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Coal',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: 'Total',
          color: colors.supply.series[6],
          data: [],
        },
      ],
      title: {
        text: 'Alberta Total net generation by energy group',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains real time data on Alberta\'s total net electricity generation by type of generation.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
    },
  },
];

// #####################
// Charts initialization
// #####################

// request data from API endpoint
const fetchDataFromDB = async (type) => {
  const result = await fetch(`/api/${type}`);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.error(`Couldn't fetch ${type}: ${result}`);
    return [];
  }
  const data = await result.json();
  if (data.length === 0) {
    // eslint-disable-next-line no-console
    return console.log(`Error getting ${type}`);
  }
  return data;
};

const getData = async (chartInfo, exitingChart) => {
  // Getting data from the DB
  const dataArrays = await fetchDataFromDB(chartInfo.divId);

  // Processing data
  for (let i = 0; i < chartInfo.seriesInfo.length; i += 1) {
    // two cases: either # of series === # of queries
    // OR all series are using the first and only query
    const rawData = dataArrays.length > 1 ? dataArrays[i] : dataArrays[0];

    // Sorting array by date
    const dataArray = rawData.sort((a, b) => b.DateTime - a.DateTime);

    // Creating 2d array for Highcharts
    const seriesData = dataArray.map((row) => [row.DateTime, row[chartInfo.seriesInfo[i].valCol]]);

    if (exitingChart) {
      exitingChart.series[i].setData(seriesData);
    } else {
      // eslint-disable-next-line no-param-reassign
      chartInfo.highchartsOptions.series[i].data = seriesData;
    }
  }
};

const createChart = async (chartInfo) => {
  await getData(chartInfo, null);
  const chart = Highcharts.chart(chartInfo.divId, chartInfo.highchartsOptions);

  if (chartInfo.realtimeInterval > 0) {
    setInterval(async () => {
      await getData(chartInfo, chart);
    }, chartInfo.realtimeInterval);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  setGlobalChartTheme();

  charts.forEach((chart) => {
    if (chart.enabled) {
      createChart(chart);
    }
  });
});
