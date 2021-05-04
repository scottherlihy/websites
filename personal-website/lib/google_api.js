import { google } from "googleapis";

const privateKey = "\n-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGx0yV7rUWUicg\n2BGbRwVuIWJmvLsEgtWG3Nh6zvCJKrZqeRsqQ0Ac8aliw51J2L6tj/laYPmvZQcz\nUyg3u62RkIRYzgLxpNskGamSfDv35SUjwiPPlndc9WSj5aNc2OFixryMEHlU7Y5X\nXJ7VMrtvoafB0Kbjeuc1gVvsHBHCh9DTDA1mT3OcnYffPAbCaqyfzEK87j7ZYLVw\nS5L8Q5LP76mSKTOU24UoWhYby1wvMYvpEimFRv3p03rW8WOM/uyerpgxtNACdGQa\ntcmWrit31KNwoFkoBkEylNvyvSdzswDdXkkr5Wfljkgz3g0WkPlvXiNzVrrxh3WF\npyuT48DHAgMBAAECggEAGeeLHCxEPn5s9E4e1++Ezk9cytVkQeLoVMT0aTy4ArLQ\nRvE1Zb08iQkX8UkGIcOJ8IXHZyHQKC1a/N36FcPy4KTGupP5Cj4DrkwHLzyFds7O\nl5RgpQLk10vGK8hsu61/4dF9wiW7dM093uCxH55BkvtW016Pq9bZHr3sRB7Rqa9d\nIuDY8G4zOQfGqMHQ8bhKZ6Wcw/P+9FGUfqccRTpxPKEyIng9uZaA1bYOsL6JqEx1\n42fAtedgZ7P1qS+ZNS21oFQjo+9ZPEGRW/Sy8epkUI/hmbJ5n2/P3SPRfTGxkal1\nBp2aFhlvpr1xMfh5jRB2DU+jUUz+18f0+AhA8GPsQQKBgQDxI89s3t4pjmaJLKaO\n3s00UteeQ+BYZrD6hnxsmsnkGJKZh/a/1OS7Lgjumm6/ZZIXDJiqcyDwObzGxy1L\n4WgVtARfcRp0yTeQIDo5WF4Jeww8Y2vaSCDtJklIALwnwmVljEVTdxfVX0+V+Xxj\nbBy1X2/06rds8I9dn2u663wPsQKBgQDTBzOj6GewHGSGbMohzAnQJaEAgb52EzuB\nb4vM09sLfABmPFzZkUb8xIlVgHIaGEWRcNFgm3zt9nUPtV2rLiEoENbTBH60eo6w\ncXqJjPw86mmoulBkXCp9Z2gN+FfNIqerLlQbn2VPN4osXFebEnwBd17tD9ET3tWe\n1/zdXXat9wKBgFlCey5+lNfnGTdfqsup12Wt4Jh54Zp3cL1beMUuytq+6c0hEgpS\nQNS0pqPD0IjSjTAw/nXhpeimRqWB5td2uXOHLjMyB6wBK6sS8tp1RmHWBWJ5Htwu\n5NlD2c5oTz2cbLIZKTRLGixmWmxWbF/VDg9pI2USWRFfPoJWV6daMZMRAoGAO5/c\nSmJ+8XaEPKr+TaBN4X7QR8lg3BHBDWhL8rqlOFB3+GrzvRFcIk0RlJPvKUpUVayv\nrAEiwkWRe7e92ID3I0/mssahWjMKn/XgLn8kQb3lzqOd1U1pP/d4ogHaJP62qxoy\n738Q69oAc1o/8nO9j9h/fLGsXFXou7HBI3al8q8CgYEAz59RWG0wBwUbdt2YeTKn\naGTjcjRtOLLevbZnlPocBA9OOrJuBxbAoG+u3GBH4WzQf+jlhT+GoMPawK7d/xMV\nERaFqJF/BfUkcTawhOi0rSLMDgYBjI/oYnL7iuvVMpgXwuPo5qYD35ZhZP5TyUgb\nmGxxhixZ11V/S8ZHX6rjXp8=\n-----END PRIVATE KEY-----\n";

export async function getGSheetRows() {
    try {
        const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
        const jwt = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            null,
            // we need to replace the escaped newline characters
            // https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
            privateKey.replace(/\\n/g, '\n'),
            scopes
        );

        const sheets = google.sheets({ version: "v4", auth: jwt });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "A1:K50",
        });

        const rows = response.data.values;
        return rows;
    } catch (err) {
        console.log(err);
    }

    return [];
}
