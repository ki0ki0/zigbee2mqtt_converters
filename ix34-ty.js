const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const e = exposes.presets;

const fz_local = {
    ix34_ty: {
        cluster: 'manuSpecificTuya',
        type: 'commandSetDataResponse',
        convert: (model, msg, publish, options, meta) => {
            const dp = msg.data.dp;
            const value = tuya.getDataValue(msg.data.datatype, msg.data.data);
            switch (dp) {
            case 1: 
                return {occupancy: value === 0};
            case 3: 
                return ; // unknown: usually 2, sometimes 1
            case 4: 
                return {battery: value};
            case 5: 
                return {tamper: value};
            case 101: 
                return ;//{voltage: value*10};
            case 102: 
                return {version: value};
            default:
                meta.logger.warn(`IX34-TY:${meta.device.ieeeAddr}: NOT RECOGNIZED DP #${dp} with data ${JSON.stringify(msg.data)} value ${value}`);
            }
        },
    },
}

const definition = {
    fingerprint: [
        {
            modelID: 'cmmei6b\u0000',
            manufacturerName: '_TYST11_acmmei6b'
        },
    ],
    model: 'IX34-TY',
    vendor: 'TuYa',
    description: 'PIR sensor',
    fromZigbee: [
        fz_local.ix34_ty,
        fz.ignore_basic_report,
    ],
    toZigbee: [
    ],
    onEvent: tuya.setTime, // Add this if you are getting no converter for 'commandSetTimeRequest'
    configure: async (device, coordinatorEndpoint, logger) => {
        const endpoint = device.getEndpoint(1);
        await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
    },
    exposes: [
        e.battery(),
        e.occupancy(),
        e.tamper(),
//        e.battery_voltage()
    ],
};

module.exports = definition;

