import { google } from "googleapis";

const email = "allocation-reader@personal-website-312120.iam.gserviceaccount.com"

export async function getGSheetRows() {
    try {
        const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
        const jwt = new google.auth.JWT(
            // process.env.GOOGLE_SHEETS_CLIENT_EMAIL.replace(/\\n/g, ''),
            email,
            null,
            // we need to replace the escaped newline characters
            // https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
            process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes
        );

        const sheets = google.sheets({ version: "v4", auth: jwt });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID.replace(/\\n/g, ''),
            range: "A1:K50",
        });

        const rows = response.data.values;
        return rows;
    } catch (err) {
        console.log(err);
    }

    return [];
}
