const axios = require('axios').default;
var cron = require('cron').CronJob;

const discordWebhookUrl = '';
const clientSeed = 'yptoCQ0s6FzhXB0-3UGOEkickd70Cz8Z'; // some rand
const caseEndpoint = 'https://csgoempire.com/api/v2/user/daily-case';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36 Edg/96.0.1054.29';
const accounts = [
    {
        PHPSESSID: '',
        do_not_share_this_with_anyone_not_even_staff: '',
    },
    {
        PHPSESSID: '',
        do_not_share_this_with_anyone_not_even_staff: '',
    }
];

async function getCases(cookies) {
    try {
        const config = {
            headers: {
                'User-Agent': userAgent,
                cookie: `PHPSESSID=${cookies.PHPSESSID}; do_not_share_this_with_anyone_not_even_staff=${cookies.do_not_share_this_with_anyone_not_even_staff}`,
            }
        };
        return (await axios.get(caseEndpoint, config)).data;
    } catch (e) {
        //  console.log(e);
    }
}

async function openCase(cookies, case_key, inventory_id) {
    try {
        const config = {
            headers: {
                'User-Agent': userAgent,
                cookie: `PHPSESSID=${cookies.PHPSESSID}; do_not_share_this_with_anyone_not_even_staff=${cookies.do_not_share_this_with_anyone_not_even_staff}`,
            }
        };
        return (await axios.post(caseEndpoint, {
            case_key,
            inventory_id,
            client_seed: clientSeed,
        }, config)).data;
    } catch (e) {
        return false;
    }
}

async function process() {
    for await (const account of accounts) {
        const cases = await getCases(account);
        cases.reverse();
        let opened = false;
        for await (const kase of cases) {
            if (!opened) {
                if (kase.keys > 0) {
                    console.log(`Opening case ${kase.key}.`);
                    const response = await openCase(account, kase.key, kase.inventory_id);
                    if (response) {
                        opened = true;
                        if (response.item.value > 30 * 100) {
                            webhook(response.item.name, response.item.value);
                        }
                    } else {
                        console.log(`Already Opened.`);
                        opened = true;
                    }
                }
            }
        }
    }
}
async function webhook(itemName, itemValue) {
    try {
        const response = await axios.post(discordWebhookUrl, {
            content: `Opened '${itemName}', worth of ${itemValue / 100} coins.`,
            embeds: null
        });
        console.log(response);
    } catch (e) {
        //
    }
}

process();

var job = new cron('0 0 */4 * * *', process);
job.start();
