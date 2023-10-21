const cds = require('@sap/cds')
const axios = require('axios').default;
const FormData = require('form-data');

const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
const sdmCredentials = VCAP_SERVICES.sdm[0].credentials;

const REPOSITORY_ID = "sg.com.ncs.document.demo";
let REPOSITY_DET = null;

const LOG = cds.log('DocumentMangement');


function processSingleRepo(repoInfo) {
    const repository = repoInfo.repository;
    if (repository && repository.externalId === REPOSITORY_ID) {
        console.log("Repository found:");
        console.log("Name:", repository.name);
        console.log("Description:", repository.description);
        return repository;
    } else {
        console.log(`Repository with externalId '${REPOSITORY_ID}' not found.`);
        return null;
    }
}

function getRepository(repositoryData) {
    if (Array.isArray(repositoryData.repoAndConnectionInfos)) {
        // If repoAndConnectionInfos is an array
        for (const repoInfo of repositoryData.repoAndConnectionInfos) {
            const repo = processSingleRepo(repoInfo);
            if (repo) {
                return repo;
            }
        }
    }
    return processSingleRepo(repositoryData.repoAndConnectionInfos);
}

async function _fetchJwtToken() {
    // This is to get the oauth token , which is used to create the folder ID
    const oauthUrl = sdmCredentials.uaa.url;
    const oauthClient = sdmCredentials.uaa.clientid;
    const oauthSecret = sdmCredentials.uaa.clientsecret;
    const tokenUrl = oauthUrl + '/oauth/token?grant_type=client_credentials&response_type=token'
    const config = {
        headers: {
            Authorization: "Basic " + Buffer.from(oauthClient + ':' + oauthSecret).toString("base64")
        }
    }
    const res = await axios.get(tokenUrl, config);
    return res.data.access_token;
}

async function setRepository() {
    // Specify the externalId to search for
    const targetExternalId = "sg.com.ncs.document.demo";

    const accessToken = await _fetchJwtToken();

    let config = {
        method: 'GET',
        url: `${sdmCredentials.uri}rest/v2/repositories/`,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    };

    let res = await axios.request(config);
    const repositoryData = res.data;


    // Iterate through the repository data and find the repository with the specified externalId
    let foundRepository = getRepository(repositoryData);

    if (foundRepository) {
        LOG.info("Repository found:", foundRepository);
        REPOSITY_DET = foundRepository;
        // Print other repository attributes as needed
    } else {
        // create repository
        console.log(`Repository with externalId '${targetExternalId}' not found.`);
    }
}

async function createPath(session, path, parentFolderId) {
    const pathElements = path.split('/');
    let currentFolderId = parentFolderId;

    for (const folderName of pathElements) {
        if (folderName) {
            const createdFolder = await createFolder(session, currentFolderId, folderName);
            currentFolderId = createdFolder.object.succinctProperties['cmis:objectId'];
        }
    }
}


module.exports = {

    setRepository: setRepository,


    // This is to create a folder in the repository for every new book that is getting created.
    // So basically we create a new folder for every book id and user can add their respective attachments in that folder.
    createFolder: async function (path, folderName) {
        const accessToken = await _fetchJwtToken();

        const folderCreateURL = `${sdmCredentials.uri}browser/${REPOSITY_DET.id}/root/${path}`

        const formData = new FormData();
        formData.append('cmisaction', 'createFolder');
        formData.append('succinct', 'true');
        formData.append('propertyId[0]', 'cmis:name');
        formData.append('propertyValue[0]', 'approval-document');
        formData.append('propertyId[1]', 'cmis:objectTypeId');
        formData.append('propertyValue[1]', 'cmis:folder');


        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + accessToken;

        const config = {
            headers: headers
        }

        const res = await axios.post(folderCreateURL, formData, config);
        return res.data.succinctProperties["cmis:objectId"];
    },


    createDocument: async function (folder, filename, content) {

        let data = new FormData();
        data.append('cmisaction', 'createDocument');
        data.append('succinct', 'true');
        data.append('propertyId[0]', 'cmis:name');
        data.append('propertyValue[0]', filename);
        data.append('propertyId[1]', 'cmis:objectTypeId');
        data.append('propertyValue[1]', 'cmis:document');
        data.append('filename', filename);
        data.append('_charset', 'UTF-8');
        data.append('includeAllowableActions', 'true');
        data.append('media', content);

        const accessToken = await _fetchJwtToken();

        let config = {
            method: 'post',
            url: `${sdmCredentials.uri}browser/${REPOSITY_DET.id}/root/${folder}`,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                ...data.getHeaders()
            },
            data: data
        };

        const res = await axios.request(config);

        return {
            id: res.data.succinctProperties["cmis:objectId"],
            mimeType: res.data.succinctProperties["cmis:contentStreamMimeType"],
            name: res.data.succinctProperties["cmis:contentStreamFileName"]
        }

    },


    readDocument: async function (objectId) {

        const accessToken = await _fetchJwtToken();

        let config = {
            method: 'GET',
            url: `${sdmCredentials.uri}browser/${REPOSITY_DET.id}/root?cmisselector=content&objectId=${objectId}&download=inline`,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
            responseType: 'text'
        };

        const res = await axios.request(config);
        const data = res.data;
        // console.log("response", data);

        return data;

    }
};
