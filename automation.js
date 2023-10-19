
const BASE_URL = "https://meaps4hdev.asia.meap.com:44300/sap/opu/odata";
const CSRF_TOKEN = "Nw1YOb82CXDM3MlTyvkbtw==";

async function getAllCatelogs() {
    let res = await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/Catalogs?$format=json`, {
        "headers": {
            "accept": "application/json",
        },
        "body": null,
        "method": "GET",
        "credentials": "include"
    });
    let data = await res.json();
    return data.d.results;
}

async function getChips(pageId) {
    pageId = encodeURIComponent(pageId);
    res = await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/Pages('${pageId}')/PageChipInstances?$format=json`, {
        "headers": {
            "accept": "application/json",
        },
        "body": null,
        "method": "GET",
        "credentials": "include"
    });
    let data = await res.json();
    return data.d.results;
}

function cleanString(inputString) {
    // Remove leading and trailing whitespace
    const trimmedString = inputString.trim();

    // Remove extra spaces between words
    const singleSpaceString = trimmedString.replace(/\s+/g, ' ');

    // Remove special characters using a regular expression
    const cleanedString = singleSpaceString.replace(/[^\w\s]/g, '');

    // Convert the string to lowercase (you can also use toUpperCase())
    const lowerCaseString = cleanedString.toLowerCase();

    return lowerCaseString;
}

async function createTileReference(sourcePageId, targetPageId, sourceChipInstanceId) {
    sourcePageId = encodeURIComponent(sourcePageId);
    targetPageId = encodeURIComponent(targetPageId);
    sourceChipInstanceId = encodeURIComponent(sourceChipInstanceId);
    const res = await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/ClonePageChipInstance?sourcePageId='${sourcePageId}'&sourceChipInstanceId='${sourceChipInstanceId}'&targetPageId='${targetPageId}'`, {
        "headers": {
            "accept": "application/json",
            "x-csrf-token": CSRF_TOKEN,
        },
        "body": "{}",
        "method": "POST"
    });
    const data = await res.json();
    return data.d;
}

async function createTargetReference(sourcePageId, targetPageId, sourceChipInstanceId) {
    sourcePageId = encodeURIComponent(sourcePageId);
    targetPageId = encodeURIComponent(targetPageId);
    sourceChipInstanceId = encodeURIComponent(sourceChipInstanceId);
    fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/ClonePageChipInstance?sourcePageId='${sourcePageId}'&sourceChipInstanceId='${sourceChipInstanceId}'&targetPageId='${targetPageId}'`, {
        "headers": {
            "accept": "application/json",
            "x-csrf-token": CSRF_TOKEN,
        },
        "body": "{}",
        "method": "POST"
    });
}

async function getGroup(pageId) {
    pageId = encodeURIComponent(pageId);
    const pageInfoRes = await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/Pages('${pageId}')`, {
        "headers": {
            "accept": "application/json"
        },
        "body": null,
        "method": "GET"
    });

    let pageInfo = await pageInfoRes.json();
    return pageInfo.d;
}

async function createGroupReference(pageId, referenceChipId) {
    // pageId = encodeURIComponent(pageId);
    // referenceChipId = encodeURIComponent(referenceChipId);
    async function createChip(pageId, chipId) {
        const res = await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/PageChipInstances`, {
            "headers": {
                "accept": "application/json",
                "x-csrf-token": CSRF_TOKEN,
                "content-type": "application/json",
            },
            "body": JSON.stringify({
                "pageId": pageId, // TEST_GROUP
                "instanceId": "",
                "chipId": chipId, // "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:TEST_Catelog:00O2TOF1AMDYOHNL2FB6LH7HF"
                "title": "",
                "configuration": "",
                "layoutData": ""
            }),
            "method": "POST"
        });
        const data = await res.json();
        /* {
                "pageId": "TEST_GROUP",
                "instanceId": "00O2TOF1AMDYOI43DT0REISYR",
                "chipId": "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:TEST_Catelog:00O2TOF1AMDYOHNL2FB6LH7HF",
                "title": "",
                "configuration": "",
                "layoutData": "",
                "remoteCatalogId": "",
                "referencePageId": "",
                "referenceChipInstanceId": "",
                "isReadOnly": "",
                "scope": "CONFIGURATION",
                "updated": "\\/Date(1697467607000)\\/",
                "outdated": ""
            }  */
        return data.d;

    }

    async function patchGroup(pageId, chipInstanceId) {
        /* 
        {
            "__metadata": {
                "type": "PAGE_BUILDER_CONF.Page"
            },
            "id": "TEST_GROUP",
            "title": "TEST Group",
            "catalogId": "/UI2/FLPD_CATALOG",
            "layout": "{\"order\":[\"00O2TOF1AMDYOI43DT0REISYR\"],\"linkOrder\":[]}",
            "originalLanguage": "en",
            "isCatalogPage": "",
            "chipInstanceCount": "0000",
            "isPersLocked": "",
            "isReadOnly": "",
            "scope": "CONFIGURATION",
            "updated": "/Date(1697467423000)/",
            "outdated": ""
        }
        */

        let pageInfo = await getGroup(pageId);

        let layout = JSON.parse(pageInfo.layout);
        layout.order.push(chipInstanceId);
        pageInfo.layout = JSON.stringify(layout);



        await fetch(`${BASE_URL}/UI2/PAGE_BUILDER_CONF/Pages('${pageId}')`, {
            "headers": {
                "accept": "application/json",
                "x-csrf-token": CSRF_TOKEN,
                "content-type": "application/json",
            },
            "body": JSON.stringify(pageInfo),
            "method": "PUT"
        });
    }

    const chip = await createChip(pageId, referenceChipId);

    await patchGroup(pageId, chip.instanceId);

}

const APP2CAT = {};
const APP2CAT_TILE = {};
const APP2CAT_TM = {};
const CAT2APP = {};
const CAT2CHIP = {};
const GRP2APP = {};

const CATELOGS = [
    {
        id: 'X-SAP-UI2-CATALOGPAGE:ZTC_BASIS_TCODES',
        type: "CATALOG_PAGE"
    },
    {
        id: 'X-SAP-UI2-CATALOGPAGE:TEST_Catelog',
        type: "CATALOG_PAGE"
    }
];

const GROUPS = [
    {
        id: 'TEST_GROUP'
    }
];

async function updateChips(catelogId) {
    const chips = await getChips(catelogId);
    // console.log(chips);
    CAT2APP[catelogId] = {};
    let targetMappings = {};
    let tiles = {};
    for (let chip of chips) {
        // console.log(chip);
        // chip.configuration = cleanString(chip.configuration);


        if (chip.configuration != null && chip.configuration.length > 0) {
            try {
                const conf = JSON.parse(chip.configuration);
                const tileConf = JSON.parse(conf.tileConfiguration);
                chip.conf = conf;
                conf.tileConf = tileConf;
                // console.log(tileConf);

                // only source tiles
                if (chip.referenceChipInstanceId == null || chip.referenceChipInstanceId.length <= 0) {
                    if (chip.chipId === "X-SAP-UI2-CHIP:/UI2/ACTION" &&
                        tileConf["transaction"]["code"] != null &&
                        tileConf["transaction"]["code"].length > 0) {
                        targetMappings[tileConf["transaction"]["code"]] = true;
                    }
                    if (chip.chipId === "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER") {
                        tiles[tileConf["display_search_keywords"]] = true;
                    }
                }

                if (chip.chipId === "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER" &&
                    tileConf["display_search_keywords"] != null && 
                    tileConf["display_search_keywords"].length > 0) {
                    const appId = tileConf["display_search_keywords"];
                    tileConf.appId = appId;

                    // if (!APP2CAT.hasOwnProperty(appId)) {
                    //     APP2CAT[appId] = [];
                    // }
                    // APP2CAT[appId].push(catelogId);

                    if (!CAT2APP[catelogId].hasOwnProperty(appId)) {
                        CAT2APP[catelogId][appId] = {};
                    }
                    CAT2APP[catelogId][appId]["Tile"] = {
                        chipId: `X-SAP-UI2-PAGE:${chip.pageId}:${chip.instanceId}`,
                        instanceId: chip.instanceId,
                        config: tileConf
                    };
                }

                // source + reference tile of target mapping
                if (chip.chipId === "X-SAP-UI2-CHIP:/UI2/ACTION" &&
                    tileConf["transaction"]["code"] != null &&
                    tileConf["transaction"]["code"].length > 0) {
                    const appId = tileConf["transaction"]["code"];
                    tileConf.appId = appId;
                    if (!APP2CAT.hasOwnProperty(appId)) {
                        APP2CAT[appId] = [];
                    }
                    APP2CAT[appId].push(catelogId);

                    if (!CAT2APP[catelogId].hasOwnProperty(appId)) {
                        CAT2APP[catelogId][appId] = {};
                    }
                    CAT2APP[catelogId][appId]["TM"] = {
                        chipId: `X-SAP-UI2-PAGE:${chip.pageId}:${chip.instanceId}`,
                        instanceId: chip.instanceId,
                        config: tileConf
                    };
                }

                // all chips
                CAT2CHIP[`X-SAP-UI2-PAGE:${chip.pageId}:${chip.instanceId}`] = chip;

                // break;
            } catch (e) {
                console.log(e);
            }

        }
    }

    for (let appId in CAT2APP[catelogId]) {
        if (appId != "" && targetMappings.hasOwnProperty(appId) && tiles.hasOwnProperty(appId)) {
            APP2CAT_TILE[appId] = catelogId;
            APP2CAT_TM[appId] = catelogId;
        }
    }
}


async function captureCatelogs() {
    const CATELOGS = await getAllCatelogs();
    for (let ocat of CATELOGS) {
        if (ocat.type !== "CATALOG_PAGE") {
            continue;
        }
        await updateChips(ocat.id);
    }
}

async function captureGroups() {
    // const CATELOGS = await getAllCatelogs();
    for (let ogroup of GROUPS) {
        const chips = await getChips(ogroup.id);
        // console.log(chips);
        GRP2APP[ogroup.id] = {};

        for (let chip of chips) {
            // console.log(chip);
            // chip.configuration = cleanString(chip.configuration);

            if (CAT2CHIP.hasOwnProperty(chip.chipId)) {
                try {
                    const tileConf = CAT2CHIP[chip.chipId].conf.tileConf;
                    const appId = tileConf.appId;

                    GRP2APP[ogroup.id][appId] = {
                        chip: chip,
                        instanceId: chip.instanceId,
                        config: tileConf
                    };
                    // break;
                } catch (e) {
                    console.log(e);
                }

            }
        }
    }
}


await captureCatelogs();

await captureGroups();


async function addApp2Role(catelog, groupId, appid) {
    // const catelog = ROLES2CG[roleName].BC;
    // const groupName = ROLES2CG[roleName].BG;

    const targetCatelog = `X-SAP-UI2-CATALOGPAGE:${catelog}`;
    console.log("targetCatelog ", targetCatelog);

    const appCatelog = APP2CAT_TM[appid];
    console.log("app - catelog", appCatelog);

    let sourceChipInstanceId;

    sourceChipInstanceId = CAT2APP[appCatelog][appid].Tile.instanceId;
    await createTileReference(appCatelog, targetCatelog, sourceChipInstanceId);

    sourceChipInstanceId = CAT2APP[appCatelog][appid].TM.instanceId;
    const response = await createTileReference(appCatelog, targetCatelog, sourceChipInstanceId);

    const chipSourceId = `X-SAP-UI2-PAGE:${targetCatelog}:${response.instanceId}`;

    await createGroupReference(groupId, chipSourceId);

    return;

}

for (let tcode of tcodes) {
    if(!APP2CAT_TM.hasOwnProperty(tcode)) {
        console.log(tcode);
    }
}