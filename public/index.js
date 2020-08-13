/* global Highcharts, moment */

//#region Styling

const colors = {
  price: {
    light: "#48e6a0", //"#04fba4",
    main: "#00bb83"
  },
  supply: {
    dark: '#0000ff',
    main: '#9d02d7',
    light: '#cd34b5',
    series: ['#ffd700', '#ffb14e', '#fa8775', '#ea5f94', '#cd34b5', '#9d02d7', '#0000ff'],
  },
  demand2: {
    main: 'rgba(239, 107, 0, 1)', // ef6b00
    light: 'rgba(239, 151, 0, 1)',
    dark: 'rgb(50, 23, 1)',
    ultralight: '#ffc163',
    set: ['#620000', '#911700', '#b93e00', '#e16000', '#fc8c2c', '#ffc163'],
  },
  demand: {
    ultralight: "#ffd700",
    light: "#ffb14e",
    main: "#fa8775",
    dark: "#ef5909",
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

const mwhTooltipOptions = {
  valueSuffix: ' MW',
};

const globalYAxisOptionsMWh = {
  title: {
    text: 'MWh',
  },
  minorGridLineWidth: 0,
  gridLineWidth: 0,
  alternateGridColor: null,
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
  xDateFormat: '%Y-%m-%d %l:%M %p',
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

const setGlobalChartTheme = () => {
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
};

//#endregion

// Charts definitions

const charts = [
  { // AB: PRICE Realtime, Forecast
    divId: 'ab-rt-fc-price',
    enabled: true,
    realtimeInterval: 3600000, // every hour
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
        text: 'Alberta: Realtime and forecasted electricity pool price',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: DEMAND Realtime, Forecast
    divId: 'ab-rt-fc-demand',
    enabled: true,
    realtimeInterval: 36000000, // every hour
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
          type: 'spline',
          name: 'Day-Ahead Forecasted AIL',
          color: colors.demand.dark,
          dashStyle: 'shortdot',
          data: [],
        },
        {
          name: 'Actual AIL',
          color: colors.demand.ultralight,
          data: [],
        },
      ],
      title: {
        text: 'Alberta: Day-Ahead Forecasted and Actual Internal Load',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph provides real time, hourly information on the actual Alberta internal load (AIL) and the forecasted internal load two hours ahead of the current hour.',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: PRICE Historical
    divId: 'ab-ht-price_hourly',
    enabled: true,
    realtimeInterval: 36000000, // every hour
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
          color: colors.price.main,
          dashStyle: 'shortdash',
        },
      ],
      title: {
        text: 'Alberta: Historical actual and average electricity pool prices',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: DEMAND and SUPPLY
    divId: 'ab-rt-demand_supply',
    enabled: true,
    realtimeInterval: 36000000, // every hour
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
        type: 'spline',
      },
      series: [
        {
          type: 'areaspline',
          name: 'Alberta Internal Load (AIL)',
          color: colors.demand.ultralight,
          data: [],
        },
        {
          name: 'Total net generation',
          color: colors.supply.dark,
          data: [],
        },
      ],
      title: {
        text: 'Alberta: Internal Load (AIL) and Total Net Generation',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: INTERCHANGE Real time electricity trade
    divId: 'ab-rt-interchange',
    enabled: true,
    realtimeInterval: 60000, // every minute
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
        text: 'Alberta: Realtime Electricity Trade',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet\'>AESO</a>',
        useHTML: true,
      },
      caption: {
        text:
          'Description: This graph contains real time data on Alberta\'s electricity trade, or net actual interchange, with surrounding jurisdictions. Negative values represent imports and positive values represent exports from Alberta.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: SUPPLY Max generation capability by energy group
    divId: 'ab-rt-capability',
    enabled: true,
    realtimeInterval: 60000, // every minute
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
        text: 'Alberta: Generation capability by fuel type',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet\'>AESO</a>',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // AB: SUPPLY Total net generation by energy group
    divId: 'ab-rt-generation',
    enabled: true,
    // Fuel (2)={WIND, BIOMASS AND OTHER, GAS, HYDRO, COAL, OTHER, TOTAL}
    // + Total Net Generation (MW) (4) *1 series per fuel type
    realtimeInterval: 60000, // every minute
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
        text: 'Alberta: Total net generation by fuel type',
      },
      subtitle: {
        text:
          'Source: <a href=\'http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet\'>AESO</a>',
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
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // ON: DEMAND
    divId: 'on-rt-demand',
    enabled: true,
    realtimeInterval: 60000, // every hour
    seriesInfo: [
      {
        name: 'Total Energy',
        valCol: 'Total Energy (MW)',
      },
      {
        name: 'Total Loss',
        valCol: 'Total Loss (MW)',
      },
      {
        name: 'Total Load',
        valCol: 'Total Load (MW)',
      },
      {
        name: 'Ontario demand',
        valCol: 'ONTARIO DEMAND (MW)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Total Energy',
          color: colors.demand.ultralight,
          data: [],
        },
        {
          name: 'Total Loss',
          color: colors.demand.light,
          data: [],
        },
        {
          name: 'Total Load',
          color: colors.demand.main,
          data: [],
        },
        {
          name: 'Ontario Demand',
          color: colors.demand.dark,
          data: [],
        },

      ],
      title: {
        text: 'Ontario: Electricity demand',
      },
      subtitle: {
        text: 'Source: <a href=\'http://reports.ieso.ca/public/RealtimeConstTotals/PUB_RealtimeConstTotals.xml\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Ontario\'s electricity demand and supply. Total energy is equal to the sum of total loss and total load. Ontario demand is equal to total load minus trade.',
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
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: SUPPLY capacity
    divId: 'on-rt-supply-cap',
    enabled: true,
    realtimeInterval: 60000, // every minute
    seriesInfo: [ // different table format here
      {
        name: 'Biofuel',
        valCol: 'TotalCapability',
      },
      {
        name: 'Gas',
        valCol: 'TotalCapability',
      },
      {
        name: 'Hydro',
        valCol: 'TotalCapability',
      },
      {
        name: 'Nuclear',
        valCol: 'TotalCapability',
      },
      {
        name: 'Solar',
        valCol: 'TotalCapability',
      },
      {
        name: 'Wind',
        valCol: 'TotalCapability',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Biofuel',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Gas',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Hydro',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Nuclear',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Solar',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: 'Wind',
          color: colors.supply.series[6],
          data: [],
        },
      ],
      title: {
        text: 'Ontario: Electricity generation capacity by fuel type',
      },
      subtitle: {
        text: 'Source: <a href=\'http://reports.ieso.ca/public/GenOutputCapability/PUB_GenOutputCapability.xml\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on electricity generation capacity, by fuel type.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: SUPPLY output
    divId: 'on-rt-supply-out',
    enabled: true,
    realtimeInterval: 60000, // every minute
    seriesInfo: [ // different table format here
      {
        name: 'Biofuel',
        valCol: 'TotalOutput',
      },
      {
        name: 'Gas',
        valCol: 'TotalOutput',
      },
      {
        name: 'Hydro',
        valCol: 'TotalOutput',
      },
      {
        name: 'Nuclear',
        valCol: 'TotalOutput',
      },
      {
        name: 'Solar',
        valCol: 'TotalOutput',
      },
      {
        name: 'Wind',
        valCol: 'TotalOutput',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Biofuel',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Gas',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Hydro',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Nuclear',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Solar',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: 'Wind',
          color: colors.supply.series[6],
          data: [],
        },
      ],
      title: {
        text: 'Ontario: Electricity generation (output) by fuel type',
      },
      subtitle: {
        text: 'Source: <a href=\'http://reports.ieso.ca/public/GenOutputCapability/PUB_GenOutputCapability.xml\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on electricity generation capacity, by fuel type',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: INTERCHANGE actual
    divId: 'on-rt-interchange-actual',
    enabled: true,
    realtimeInterval: 60000, // every minute
    seriesInfo: [ // different table format here
      {
        name: 'Manitoba',
        valCol: 'Flow (MWh)',
      },
      {
        name: 'Manitoba SK',
        valCol: 'Flow (MWh)',
      },
      {
        name: 'Michigan',
        valCol: 'Flow (MWh)',
      },
      {
        name: 'Minnesota',
        valCol: 'Flow (MWh)',
      },
      {
        name: 'New York',
        valCol: 'Flow (MWh)',
      },
      // {
      //   name: 'Total',
      //   valCol: 'Flow (MWh)',
      // },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Manitoba',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Manitoba SK',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Michigan',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Minnesota',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'New York',
          color: colors.supply.series[4],
          data: [],
        },
        // {
        //   name: 'Total',
        //   color: colors.supply.series[6],
        //   data: [],
        // },
      ],
      title: {
        text: 'Ontario: Actual electricity trade flows',
      },
      subtitle: {
        text: 'Source: <a href=\'http://www.ieso.ca/en/Power-Data/This-Hours-Data\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on electricity trade. Negative values represent imports and positive values indicate exports from Ontario.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMWh,
      tooltip: mwhTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: INTERCHANGE scheduled
    divId: 'on-rt-interchange-sched',
    enabled: true,
    realtimeInterval: 60000, // every minute
    seriesInfo: [ // different table format here
      {
        name: 'Exports',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'Imports',
        valCol: 'Imports (MWh)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Exports',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Imports',
          color: colors.supply.series[1],
          data: [],
        },
      ],
      title: {
        text: 'Ontario: Scheduled electricity trade flows',
      },
      subtitle: {
        text: 'Source: <a href=\'http://www.ieso.ca/en/Power-Data/This-Hours-Data\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on scheduled electricity trade.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMWh,
      tooltip: mwhTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: INTERCHANGE actual
    divId: 'on-rt-interchange-sched-v2',
    enabled: true,
    realtimeInterval: 60000, // every minute
    seriesInfo: [ // different table format here
      {
        name: 'Manitoba',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'Manitoba SK',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'Michigan',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'Minnesota',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'New York',
        valCol: 'Exports (MWh)',
      },
      {
        name: 'Total',
        valCol: 'Exports (MWh)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Manitoba',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'Manitoba SK',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'Michigan',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Minnesota',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'New York',
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
        text: 'Ontario: Actual electricity trade flows',
      },
      subtitle: {
        text: 'Source: <a href=\'http://www.ieso.ca/en/Power-Data/This-Hours-Data\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on scheduled electricity trade.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMWh,
      tooltip: mwhTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // ON: PRICE
    divId: 'on-rt-price',
    enabled: true,
    realtimeInterval: 3600000, // every hour
    seriesInfo: [
      {
        name: 'Price',
        valCol: 'HOEP ($/MWh)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [{
        name: 'Electricity Price',
        color: colors.price.main,
        data: [],
      }],

      title: {
        text: 'Ontario: Electricity Price',
      },
      subtitle: {
        text: 'Source: <a href=\'http://reports.ieso.ca/public/DispUnconsHOEP/\'>IESO</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Ontario\'s hourly electricity price (HOEP).',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsPrice,

      tooltip: priceTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Toronto',
        useUTC: false,
      },
    },
  },
  { // NS: DEMAND
    divId: 'ns-rt-demand',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'Net Load',
        valCol: 'Net Load',
      },
      {
        name: 'Wind Generation',
        valCol: 'Wind Generation',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'area',
      },
      series: [
        {
          name: 'Net Load',
          color: colors.demand.ultralight,
          data: [],
        },
        {
          type: 'spline',
          name: 'Wind Generation',
          color: colors.supply.light,
          dashStyle: 'shortdash',
          data: [],
        },
      ],
      title: {
        text: 'Nova Scotia: Net load and wind generation',
      },
      subtitle: {
        text: 'Source: <a href=\'https://resourcesprd-nspower.aws.silvertech.net/oasis/current_report.shtml\'>NSPower</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Nova Scotia\'s net electricity load and wind generation.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // NS: INTERCHANGE
    divId: 'ns-rt-interchange',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'Highlands Export?',
        valCol: 'Highlands Export',
      },
      {
        name: 'East End Export (at Sydney)?',
        valCol: 'East End Export (at Sydney)',
      },
      {
        name: 'East End Export (at East Bay)?',
        valCol: 'East End Export (at East Bay)',
      },
      {
        name: 'Cape Breton Export?',
        valCol: 'Cape Breton Export',
      },
      {
        name: 'Onslow Import?',
        valCol: 'Onslow Import',
      },
      {
        name: 'NS Export?',
        valCol: 'NS Export',
      },
      {
        name: 'Onslow South?',
        valCol: 'Onslow South',
      },
      {
        name: 'Flow Into Metro?',
        valCol: 'Flow Into Metro',
      },
      {
        name: 'Western Import?',
        valCol: 'Western Import',
      },
      {
        name: 'Valley Import?',
        valCol: 'Valley Import',
      },
      {
        name: 'Maritime Link Import?',
        valCol: 'Maritime Link Import',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Highlands Export',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: 'East End Export (at Sydney)',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: 'East End Export (at East Bay)',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: 'Cape Breton Export',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Onslow Import',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: 'NS Export',
          color: colors.supply.series[5],
          data: [],
        },
        {
          name: 'Onslow South',
          color: colors.supply.series[6],
          data: [],
        },
        {
          name: 'Flow Into Metro',
          color: colors.supply.series[0],
          dashStyle: 'shortdot',
          data: [],
        },
        {
          name: 'Western Import',
          color: colors.supply.series[1],
          dashStyle: 'shortdot',
          data: [],
        },
        {
          name: 'Valley Import',
          color: colors.supply.series[2],
          dashStyle: 'shortdot',
          data: [],
        },
        {
          name: 'Maritime Link Import',
          color: colors.supply.series[3],
          dashStyle: 'shortdot',
          data: [],
        },
      ],
      title: {
        text: 'Nova Scotia: Trade flows',
      },
      subtitle: {
        text: 'Source: <a href=\'https://resourcesprd-nspower.aws.silvertech.net/oasis/current_report.shtml\'>NSPower</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Nova Scotia\'s electricity trade flows. Negative values indicate imports into Nova Scotia, and positive values indicate exports.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // NB: DEMAND
    divId: 'nb-rt-demand',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'Load',
        valCol: 'NB Load',
      },
      {
        name: 'Demand',
        valCol: 'NB Demand',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Net Load',
          color: colors.demand.main,
          data: [],
        },
        {
          name: 'Demand',
          color: colors.demand.light,
          dashStyle: 'shortdash',
          data: [],
        },
      ],
      title: {
        text: 'New Brunswick: Provincial electricity load and demand',
      },
      subtitle: {
        text: 'Source: <a href=\'https://tso.nbpower.com/Public/en/SystemInformation_realtime.asp\'>NBPower</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graphs contains real time data on New Brunswick\'s electricity load and demand.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // NB: INTERCHANGE //TODO: Replace with correct NB data
    divId: 'nb-rt-interchange',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'East End Export (at Sydney)?',
        valCol: 'East End Export (at Sydney)',
      },
      {
        name: 'East End Export (at East Bay)?',
        valCol: 'East End Export (at East Bay)',
      },
      {
        name: 'Cape Breton Export?',
        valCol: 'Cape Breton Export',
      },
      {
        name: 'Onslow Import?',
        valCol: 'Onslow Import',
      },
      {
        name: 'NS Export?',
        valCol: 'NS Export',
      },
      {
        name: 'Onslow South?',
        valCol: 'Onslow South',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: '',
          color: colors.supply.series[0],
          data: [],
        },
        {
          name: '',
          color: colors.supply.series[1],
          data: [],
        },
        {
          name: '',
          color: colors.supply.series[2],
          data: [],
        },
        {
          name: '',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: '',
          color: colors.supply.series[4],
          data: [],
        },
        {
          name: '',
          color: colors.supply.series[5],
          data: [],
        },
      ],
      title: {
        text: 'Trade flows',
      },
      subtitle: {
        text: 'Source: <a href=\'https://resourcesprd-nspower.aws.silvertech.net/oasis/current_report.shtml\'>NSPower</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Nova Scotia\'s electricity trade flows',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // NL: SUPPLY
    divId: 'nl-rt-supply',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'Generation',
        valCol: 'Generation (MW)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Generation',
          color: colors.supply.main,
          data: [],
        },
      ],
      title: {
        text: 'Newfoundland and Labrador: Electricity generation',
      },
      subtitle: {
        text: 'Source: <a href=\'https://nlhydro.com/system-information/supply-and-demand/\'>NLHydro</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Newfoundland and Labrador\'s electricity generation.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
  { // PEI: SUPPLY DEMAND
    divId: 'pei-rt-supply-demand',
    enabled: true,
    realtimeInterval: 36000000, // every hour
    seriesInfo: [ // different table format here
      {
        name: 'Total Load (MW)',
        valCol: 'Total Load (MW)',
      },
      {
        name: 'Wind Power Used',
        valCol: 'Wind Power Used (MW)',
      },
      {
        name: 'Total Wind Generation',
        valCol: 'Total Wind Generation (MW)',
      },
      {
        name: 'Wind Power Exported',
        valCol: 'Wind Power Exported (MW)',
      },
      {
        name: 'Total Fossil Fuel Generation',
        valCol: 'Total Fossil Fuel Generation (MW)',
      },
    ],
    highchartsOptions: {
      chart: {
        type: 'spline',
      },
      series: [
        {
          name: 'Total On-Island Load',
          color: colors.demand.main,
          data: [],
        },
        {
          name: 'Wind Power Used',
          color: colors.demand.dark,
          data: [],
        },
        {
          name: 'Total Wind Generation',
          color: colors.supply.main,
          data: [],
        },
        {
          name: 'Wind Power Exported',
          color: colors.supply.series[3],
          data: [],
        },
        {
          name: 'Total Fossil Fuel Generation',
          color: colors.supply.dark,
          data: [],
        },
      ],
      title: {
        text: 'PEI: Load and generation',
      },
      subtitle: {
        text: 'Source: <a href=\'https://www.princeedwardisland.ca/en/feature/pei-wind-energy#/home/WindEnergy/WindEnergy\'>Government of Prince Edward Island</a>',
        useHTML: true,
      },
      caption: {
        text: 'Description: This graph contains real time data on Prince Edward Island\'s electricity load and generation by fuel type.',
      },
      xAxis: globalXAxisOptionsDateTime,
      yAxis: globalYAxisOptionsMW,
      tooltip: mwTooltipOptions,

      plotOptions: {
        spline: globalSplineOptions,
      },
      navigation: {},
      time: {
        timezone: 'America/Edmonton',
        useUTC: false,
      },
    },
  },
];

// #####################
// Charts initialization
// #####################

// request data from API endpoint
const fetchDataFromDB = async (type) => {
  const result = await fetch(`/rte/api/${type}`);
  if (!result.ok) {
    return [];
  }
  const data = await result.json();
  if (data.length === 0) {
    // eslint-disable-next-line no-console
    return console.log(`Error getting ${type}: empty result returned`);
  }
  return data;
};

const getData = async (chartInfo, existingChart) => {
  // Getting data from the DB
  const dataArrays = await fetchDataFromDB(chartInfo.divId);
  if (dataArrays.length === 0) {
    return false;
  }

  // Processing data
  for (let i = 0; i < chartInfo.seriesInfo.length; i += 1) {
    // two cases: either # of series === # of queries
    // OR all series are using the first and only query
    const rawData = dataArrays.length > 1 ? dataArrays[i] : dataArrays[0];

    // Parsing dates, sorting array by date, and creating 2d array for Highcharts
    // Highcharts takes date in UNIX format (getTime method on Date object)
    const seriesData = rawData
      .map((row) => ({
        ...row,
        DateTime: moment.tz(row.DateTime.slice(0, -1), chartInfo.highchartsOptions.time.timezone)
          .toDate()
          .getTime(),
      }))
      .sort((a, b) => a.DateTime - b.DateTime)
      .map((row) => [row.DateTime, row[chartInfo.seriesInfo[i].valCol]]);

    if (existingChart) {
      existingChart.series[i].setData(seriesData);
    } else {
      // eslint-disable-next-line no-param-reassign
      chartInfo.highchartsOptions.series[i].data = seriesData;
    }
  }

  return true;
};

const createChart = async (chartInfo) => {
  const result = await getData(chartInfo, null);
  if (result === true) {
    const chart = Highcharts.chart(chartInfo.divId, chartInfo.highchartsOptions);

    if (chartInfo.realtimeInterval > 0) {
      setInterval(async () => {
        await getData(chartInfo, chart);
      }, chartInfo.realtimeInterval);
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  setGlobalChartTheme();
});

window.createChartForDiv = async (node) => {
  const chart = charts.find((ch) => ch.divId === node.value && ch.enabled === true);
  if (chart) {
    await createChart(chart);
  } else {
    // eslint-disable-next-line no-console
    console.log('This chart is not enabled');
  }
};
