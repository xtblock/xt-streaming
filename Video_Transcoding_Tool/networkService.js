const os = require ('os')

 const interfaces = os.networkInterfaces();

var addresses =[];

for (var ips in interfaces){
    for (var ip in interfaces[ips]){
        var address = interfaces[ips][ip];
        if (address.family === 'IPv4' && !address.internal){
            addresses.push(address.address);
        }
    }
}

module.exports = addresses