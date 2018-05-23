var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-bonesmart-hswitch", "H-Switch", HSwitchAccessory);
}

function HSwitchAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.ip = config["ip"];
  this.manufacturer = config["manufacturer"] || "Bone Smart Technology";
  this.model = config["model"] || "H-Switch";
  this.serialnumber = config["serialnumber"] || "BSTHSXXXXX";
  this.firmwarerevision = config["firmwarerevision"] || "1.0.0";
}

HSwitchAccessory.prototype.identify = function(callback) {
  this.log('O sistema identificou um request!');
  callback();
};

HSwitchAccessory.prototype.getPowerState = function(callback) {
  this.log("Recuperando estado do acessório H-Switch...");
  request.get({
    url: 'http://' + this.ip + '/status'
  }, function(err, response, body) {
    var status = body == '1' ? 1 : 0;
    callback(null, status);
  }.bind(this));
}

HSwitchAccessory.prototype.setPowerState = function(state, callback) {
  var url = state ? "1": "0";
  this.log("Alterando estado do acessório H-Switch...");
  request.get({
    url: 'http://' + this.ip + '/relay?state=' + url
  }, function(err, response, body) {
  callback(null, state);
  }.bind(this));
  this.log("O status do dispositivo foi alterado para " + state);  
},

HSwitchAccessory.prototype.getServices = function() {

  var informationService = new Service.AccessoryInformation();

  informationService
    .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
    .setCharacteristic(Characteristic.Model, this.model)
    .setCharacteristic(Characteristic.SerialNumber, this.serialnumber)
    .setCharacteristic(Characteristic.FirmwareRevision, this.firmwarerevision);

  var switchService = new Service.Switch(this.name);

  switchService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerState.bind(this))
    .on('set', this.setPowerState.bind(this));

  return [informationService, switchService];
}