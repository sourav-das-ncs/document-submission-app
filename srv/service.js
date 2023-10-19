const LOG = cds.log('testsch');

module.exports = cds.service.impl(async function () {

    const service = await cds.connect.to('S4_ODATA');
    const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);

    this.on('triggerWorkflow', async (req) => {
        let res;
        // console.log(VCAP_SERVICES);
        try {
            const data = await service.get("/ui2/PAGE_BUILDER_CONF");
            console.log('in triggerWorkflow', data);
        } catch (err) {
            LOG.error("in catch function", err)
            res = err;
        }

        return 'No Data';

    });

    this.on('handleNotification', async req => {
        console.log('in handleNotification')
    })


});