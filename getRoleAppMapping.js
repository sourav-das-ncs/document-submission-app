app.post('/upload-optimised', async (req, res) => {

    // get the file metadata from custom headers.
    const fileName = req.headers["cs-filename"];
    const opType = req.headers["cs-operation"];
    const mimeType = req.headers["content-type"];

    let session = await sm.getOrCreateConnection(REPOSITORY_ID, "provider");
    let response = {success: "false"};

    // if operation is "create" then create the document in DMS with initial chuck
    if (opType === "create") {
        response = await session.createDocumentFromStream("/temp", req, fileName);
    }

    // if operation is "append" then append the content an existing file
    if (opType === "append") {
        const obj = await session.getObjectByPath("/temp/" + fileName);
        const objId = obj.succinctProperties["cmis:objectId"];
        response = await session.appendContentFromStream(objId, req);
    }

    res.json(response);
});