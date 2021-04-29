import HighchartsReact from "highcharts-react-official";
import Highcharts from '../utils/Highcharts.js'
import HomeButton from './homeButton';
import React from 'react';
import utilStyles from '../styles/utils.module.css'
import styles from './layout.module.css'

const topLevelRange = Array.from(new Array(2), (x, i) => i + 9);;
const cryptoRange = Array.from(new Array(3), (x, i) => i + 9);;
const EquityRange = Array.from(new Array(3), (x, i) => i + 9);;

function GetRowIndex(letter) {
    return letter.charCodeAt(0) - 97;
}

function GetSeriesData(rows) {
    let cash = [{
        name: 'Cash',
        y: (rows[11][GetRowIndex('c')] * 100),
        drilldown: null
    }]

    let dynamicAssets = []
    for (var i = 0; i < topLevelRange.length; i++) {
        let rowsIndex = topLevelRange[i]
        dynamicAssets.push({
            name: rows[rowsIndex][GetRowIndex('a')],
            y: (rows[rowsIndex][GetRowIndex('c')] * 100),
            drilldown: rows[rowsIndex][GetRowIndex('a')]
        })
    }

    return [{
        colorByPoint: true,
        data: cash.concat(dynamicAssets)
    }]
}

function GetHighChartOptions(rows) {
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
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
            }
        },
        series: GetSeriesData(rows),
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
                            1.5
                        ],
                        [
                            'TAN',
                            1.1
                        ],
                        [
                            'FSR',
                            0.5
                        ],
                        [
                            'BUDZ',
                            0.420
                        ],
                        [
                            'Other',
                            16.58
                        ]
                    ]
                }
            ]
        },
        credits: {
            enabled: false
        },
    };

    return highchartsOptions;
}

const colorOptions = {
    // Will set my own colors
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
}

export default function PortfolioPieChart({ rows }) {
    return (
        <div className={styles.container}>
            <HomeButton />
            <h2 className={utilStyles.headingLg}>Investment Portfolio</h2>
            <HighchartsReact
                id="pieId"
                highcharts={Highcharts}
                options={GetHighChartOptions(rows)}
            />

            <section className={utilStyles.headingMd}>
                <p>This is a vizualization tool I use to track and better understand how and where I am investing my money.</p>
                <p>It pulls in real time price data on page load by utilizing a google sheets api as a cdm</p>
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
