import { google } from "googleapis";

const email = "allocation-reader@personal-website-312120.iam.gserviceaccount.com"
const idtmp = "1_UF6nCU4qCwMVjnKnbnJV0PIX1ADe-g2RsSsIKKy9_g"

export async function getGSheetRows() {
    try {
        const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
        console.log("email", process.env.GOOGLE_SHEETS_CLIENT_EMAIL)
        const jwt = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            // email,
            null,
            // we need to replace the escaped newline characters
            // https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
            process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes
        );

        const sheets = google.sheets({ version: "v4", auth: jwt });
        console.log("idtmp", process.env.SPREADSHEET_ID)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            // spreadsheetId: idtmp,
            range: "A1:K50",
        });

        const rows = response.data.values;
        return rows;
    } catch (err) {
        console.log(err);
    }

    return [];
}
