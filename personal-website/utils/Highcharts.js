import * as Highcharts from 'highcharts';
import drilldown from 'highcharts-drilldown';

// This is to get around an issue with server side rendering as seen
// https://github.com/highcharts/highcharts-react/issues/76

if (typeof Highcharts === 'object') {
    if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) {
        drilldown(Highcharts);
    }
}

export default Highcharts;
