const rest = require("@uploadcare/rest-client")
const uploadcareSimpleAuthSchema = new rest.UploadcareSimpleAuthSchema({
    publicKey: '5f2f3bbc20f0181e14a8',
    secretKey: '5382efcc56a6d2689987',
});

module.exports = uploadcareSimpleAuthSchema