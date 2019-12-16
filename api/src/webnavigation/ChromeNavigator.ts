import Puppeteer from "puppeteer";

class ChromeNavigator {
    constructor() {
        console.log("Created chrome navigator");
    }

    public async pup() {
        const browser = await Puppeteer.launch({
            // headless false launches a window so you can see it visually
            headless: false,
            // Use installed Chrome so Mac doesn't ask for permission
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        });
        const page = await browser.newPage();
        await page.goto("https://google.com");
        await page.evaluate(() =>{
            // @ts-ignore
            document.querySelector('input[name="q"]').value = 'JavaScript';
            // @ts-ignore
            document.querySelector('input[value="Google Search"]').click();
        })
        setTimeout(async () => {
            await browser.close();
        }, 3000);
    }
}

export default ChromeNavigator;