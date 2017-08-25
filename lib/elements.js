module.exports = (basePath, authorize) => {
  const req = require('../util/req')(authorize);
  const util = require('../util/util');
  const campaigns = require('./campaigns.js')(basePath, authorize);

  /**
   * Get Elements(s)
   *
   * http://docs.oracle.com/cloud/latest/marketingcs_gs/OMCGF/op-sites-%7Bsite-id%7D-sandbox-campaigns-%7Bcampaign-id%7D-elements-get.html
   *
   * Possible options:
   * -----------------
   * `siteId` (optional if `siteName` provided) - ID of the site to be fetched
   * `siteName` (optional if `siteId` provided) - name of the site to be fetched
   * `campaignId` (optional if `campaignName` provided) - ID of the campaign to be fetched
   * `campaignName` (optional if `campaignId` provided) - name of the campaign to be fetched
   *
   * Get all Elements of the given Campaigns;
   * `siteId` has priority over the `siteName`.
   *
   * @param  {Object} options
   * @return {Promise}
   */
  const get = (options = {}) => {
    var {siteId, siteName, campaignId, campaignName} = options;

    if (!siteId && !siteName) {
      return Promise.reject({ error: '`siteId` or `siteName` must be provided!' });
    }

    if (!campaignId && !campaignName) {
      return Promise.reject({ error: '`campaignId` or `campaignName` must be provided!' });
    }

    return campaigns.get({siteId, siteName})
      .then(campaigns => {
        var campaign = !campaignId ?
          util.getByName(campaigns, campaignName) :
          util.getById(campaigns, campaignId);

        var promise = req.get(
          `${basePath}/sites/${campaign.siteId}/sandbox/campaigns/${campaign.id}/elements`,
          {siteId: campaign.siteId, campaignId: campaign.id});

        return promise;
      });
  };

  /**
   * Create Element
   *
   * http://docs.oracle.com/cloud/latest/marketingcs_gs/OMCGF/op-sites-%7Bsite-id%7D-sandbox-campaigns-%7Bcampaign-id%7D-elements-post.html
   *
   * Possible options:
   * -----------------
   * `siteId` (optional if `siteName` provided) - ID of the site to be fetched
   * `siteName` (optional if `siteId` provided) - name of the site to be fetched
   * `campaignId` (optional if `campaignName` provided) - ID of the campaign to be fetched
   * `campaignName` (optional if `campaignId` provided) - name of the campaign to be fetched
   *
   * `name` (required) - campaign name
   * `description` (optional) - campaign description
   * `elementId` (optional) - HTML node id to be used for element's content
   * `url` (optional) - Object indicating where the element is and is not present
   * `url.preview` (optional) - Preview url for element
   * `url.includes` (optional) - URL masks for pages where elemnt should be present
   * `url.excludes` (optional) - URL masks for pages where element should not be located. Higher priority than url.includes
   *
   * Create new Element for the given campaign;
   * `siteId` has priority over the `siteName`.
   * `campaignId` has priority over the `campaignName`.
   *
   * @param  {Object} options
   * @return {Promise}
   */
  const create = (options = {}) => {
    var {siteId, siteName, campaignId, campaignName, name, description, elementId, url} = options;
    var data = { name, description, elementId, url };

    if (!siteId && !siteName) {
      return Promise.reject({ error: '`siteId` or `siteName` must be provided!' });
    }

    if (!campaignId && !campaignName) {
      return Promise.reject({ error: '`campaignId` or `campaignName` must be provided!' });
    }

    if (!data.name) {
      return Promise.reject({ error: '`name` must be provided!' });
    }

    return campaigns.get({siteId, siteName})
      .then(campaigns => {
        var campaign = !campaignId ?
          util.getByName(campaigns, campaignName) :
          util.getById(campaigns, campaignId);

        return req.post(
          `${basePath}/sites/${campaign.siteId}/sandbox/campaigns/${campaign.id}/elements`,
          data
        );
      });
  };

  return {
    get,
    create
  }
};
