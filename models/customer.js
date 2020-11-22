var mongoose    = require("mongoose");

var cSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    stage: String,
    leadScore: Number,
    ip: String,
    leadSource: String,
    leadMedium: String,
    leadCampaign: String,

});

module.exports = mongoose.model("Customer", cSchema); //creates model with above schema and has methods such as .find etc.