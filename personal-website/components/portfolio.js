import Highcharts from 'highcharts'
import React from 'react';
import utilStyles from '../styles/utils.module.css'
import styles from './layout.module.css'
import HighchartsReact from "highcharts-react-official";
import drilldow from "highcharts/modules/drilldown";

drilldow(Highcharts);

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
            y: 30,
            drilldown: null
        }, {
            name: 'Crytpo',
            y: 30,
            drilldown: 'Crypto'
        }, {
            name: 'Equities',
            y: 40,
            drilldown: null
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
                        20
                    ],
                    [
                        'Bitcoin',
                        10
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

export default function PortfolioPieChart() {
    return (
        <div className={styles.container}>
            <h2 className={utilStyles.headingLg}>Investment Portfolio</h2>
            <HighchartsReact
                id="pieId"
                highcharts={Highcharts}
                options={highchartsOptions}
            />
        </div>
    );
}
