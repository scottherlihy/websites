import Highcharts from '../utils/Highcharts'
import React from 'react';
import utilStyles from '../styles/utils.module.css'
import styles from './layout.module.css'
import HighchartsReact from "highcharts-react-official";
import drilldown from 'highcharts-drilldown';

const highchartsOptions = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
    },
    title: {
        text: 'Allocation by Asset Type'
    },
    tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        },
        announceNewData: {
            enabled: true
        },
    },
    plotOptions: {
        pie: {
            // allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            },
        }
    },
    series: [{
        colorByPoint: true,
        data: [{
            name: 'Cash',
            y: 17.62,
            drilldown: null
        }, {
            name: 'Crytpo',
            y: 45.38,
            drilldown: 'Crypto'
        }, {
            name: 'Equities',
            y: 37,
            drilldown: 'Equities'
        }]
    }],
    drilldown: {
        series: [
            {
                name: 'Crypto',
                id: 'Crypto',
                data: [
                    [
                        'Ethereum',
                        48
                    ],
                    [
                        'Bitcoin',
                        45
                    ],
                    [
                        'Maker',
                        2.5
                    ],
                    [
                        'Uniswap',
                        1.5
                    ],
                    [
                        'Cosmos',
                        1.06
                    ],
                    [
                        'Graph',
                        0.3
                    ],
                    [
                        'Radicle',
                        0.6
                    ]
                ]
            },
            {
                name: 'Equities',
                id: 'Equities',
                data: [
                    [
                        'VACQ',
                        16.55
                    ],
                    [
                        'TSLA',
                        14
                    ],
                    [
                        'SHOP',
                        13.7
                    ],
                    [
                        'SQ',
                        12.09
                    ],
                    [
                        'BHR',
                        9
                    ],
                    [
                        'MP',
                        4.8
                    ],
                    [
                        'AAPL',
                        4.17
                    ],
                    [
                        'SRAC',
                        3.9
                    ],
                    [
                        'CHPT',
                        3
                    ],
                    [
                        'ICLN',
                        2.6
                    ],
                    [
                        'PBW',
                        1.1
                    ],
                    [
                        'OTHER',
                        18.7
                    ]
                ]
            }
        ]
    },
    credits: {
        enabled: false
    },
};

// this is in a separate object intentionally, it prevents an error that I think is
// cause by next.js server side rendering
// const colorOptions = {
// colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
//     return {
//         radialGradient: {
//             cx: 0.5,
//             cy: 0.2,
//             r: 0.7
//         },
//         stops: [
//             [0, color],
//             [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
//         ]
//     };
// })
// }

var createReactClass = require('create-react-class');

const PortfolioPieChart = createReactClass({
    // componentDidMount() {
    // load modules
    // drilldown(Highcharts);
    // },

    render() {
        return (
            <div className={styles.container}>
                <h2 className={utilStyles.headingLg}>Investment Portfolio</h2>
                <HighchartsReact
                    id="pieId"
                    highcharts={Highcharts}
                    options={highchartsOptions}
                />

                <section className={utilStyles.headingMd}>
                    <p>This is a vizualization tool I use to track and better understand how and where I am investing my money.</p>
                    <p>It's fairly new and does not yet pull in allocation or price changes dynamically, but will soon! (Last updated April 26)</p>
                </section>

                <br></br>
                <br></br>
                <section className={utilStyles.headingXSm}>
                    <p>The above references an opinion and is for information purposes only. It is not intended to be investment advice. Seek a duly licensed professional for investment advice.</p>
                </section>
                <style jsx>{`
            h2 {
              display: flex;
              align-items: center;
            }

          `}</style>
            </div>
        );
    }
});

export default PortfolioPieChart;

// export default function PortfolioPieChart() {
//     return (
//         <div className={styles.container}>
//             <h2 className={utilStyles.headingLg}>Investment Portfolio</h2>
//             <HighchartsReact
//                 id="pieId"
//                 highcharts={Highcharts}
//                 options={highchartsOptions}
//             />

//             <section className={utilStyles.headingMd}>
//                 <p>This is a vizualization tool I use to track and better understand how and where I am investing my money.</p>
//                 <p>It's fairly new and does not yet pull in allocation or price changes dynamically, but will soon! (Last updated April 26)</p>
//             </section>

//             <br></br>
//             <br></br>
//             <section className={utilStyles.headingXSm}>
//                 <p>The above references an opinion and is for information purposes only. It is not intended to be investment advice. Seek a duly licensed professional for investment advice.</p>
//             </section>
//             <style jsx>{`
//         h2 {
//           display: flex;
//           align-items: center;
//         }

//       `}</style>
//         </div>
//     );
// }
