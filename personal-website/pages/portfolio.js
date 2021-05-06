import PortfolioPieChart from '../components/portfolio'

import { getGSheetRows } from "../lib/google_api";
export async function getStaticProps(context) {
    const rows = await getGSheetRows();

    return {
        props: {
            rows,
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 1, // In seconds
    };
}

// export async function getServerSideProps(context) {
//     const rows = await getGSheetRows();

//     return {
//         props: {
//             rows,
//         }
//     };
// }

export default function Portfolio({ rows }) {
    return (<PortfolioPieChart rows={rows}></PortfolioPieChart>);
}
