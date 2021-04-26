import React from 'react';
import { Pie } from 'react-chartjs-2';
import styles from './layout.module.css'

const data = {
    labels: [
        'Red',
        'Blue',
        'Yellow'
    ],
    datasets: [{
        data: [30, 50, 100],
        backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
        ],
        hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
        ]
    }]
};

var options = {
    "animation.animateRotate": false
};

export default function PortfolioPieChart() {
    return (
        <div className={styles.container}>
            <h2>Investment Portfolio</h2>
            <Pie
                data={data}
                width={40}
                height={40}
                options={options}
            />
        </div>
    );
}
