import HighchartsReact from "highcharts-react-official";
import Highcharts from '../utils/Highcharts.js'
import HomeButton from './homeButton';
import React from 'react';
import utilStyles from '../styles/utils.module.css'
import styles from './layout.module.css'

const topLevelRange = Array.from(new Array(2), (x, i) => i + 9);;
const cryptoRange = Array.from(new Array(7), (x, i) => i + 16);;
const equityRange = Array.from(new Array(10), (x, i) => i + 27);;

function GetColumnIndex(letter) {
    return letter.charCodeAt(0) - 97;
}

function GetSeriesData(rows) {
    let cash = [{
        name: 'Cash',
        y: (rows[11][GetColumnIndex('c')] * 100),
        drilldown: null
    }]

    let dynamicAssets = []
    for (var i = 0; i < topLevelRange.length; i++) {
        let rowsIndex = topLevelRange[i];
        dynamicAssets.push({
            name: rows[rowsIndex][GetColumnIndex('a')],
            y: (rows[rowsIndex][GetColumnIndex('c')] * 100),
            drilldown: rows[rowsIndex][GetColumnIndex('a')]
        })
    }

    return [{
        colorByPoint: true,
        data: cash.concat(dynamicAssets)
    }];
}

function GetCryptoDrilldownData(rows) {
    let dynamicAssets = []
    for (var i = 0; i < cryptoRange.length; i++) {
        let rowsIndex = cryptoRange[i];
        dynamicAssets.push(
            [rows[rowsIndex][GetColumnIndex('a')], rows[rowsIndex][GetColumnIndex('e')] * 100])
    }
    return {
        name: 'Crypto',
        id: 'Crypto',
        data: dynamicAssets
    }
}

// can probably collapse this with the function above
function GetEquityDrilldownData(rows) {
    let dynamicAssets = []
    for (var i = 0; i < equityRange.length; i++) {
        let rowsIndex = equityRange[i];
        dynamicAssets.push(
            [rows[rowsIndex][GetColumnIndex('a')], rows[rowsIndex][GetColumnIndex('e')] * 100])
    }
    return {
        name: 'Equities',
        id: 'Equities',
        data: dynamicAssets
    }
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
                GetCryptoDrilldownData(rows),
                GetEquityDrilldownData(rows)
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
                <p>It currently pulls in real time price data on page load by utilizing a Google Sheets API as a CDM.</p>
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
