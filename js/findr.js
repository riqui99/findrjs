function Findr(options){
	var self = this;
	var network = (options!=undefined && options["network"]!=undefined) ? options["network"] : "192.168.1.";
	var service_protocol = (options!=undefined && options["service_protocol"]!=undefined) ? options["service_protocol"] : "http";
	var service_port = (options!=undefined && options["service_port"]!=undefined) ? options["service_port"] : "8878";
	var service_endpoint = (options!=undefined && options["service_endpoint"]!=undefined) ? options["service_endpoint"] : "search";
	var devices = [];
	var abort;
	var xhr_ip = {};
	for(var i=0; i<256; i++){
		devices.push({
			ip: network + i,
			status: "not_checked"
		})
	}

	function get_url_service(ip_num){
		return service_protocol + '://' + network + ip_num + ':' + service_port + '/' + service_endpoint;
	}

	function xmlhttprequest(url, callback){
		var xhr_req = new XMLHttpRequest();
		xhr_req.open("GET", url);

		xhr_req.timeout = 2000;
		xhr_req.onload = function () {
			if (xhr_req.readyState === xhr_req.DONE) {
				if (xhr_req.status === 200) {
					var obj = JSON.parse(xhr_req.responseText);
					obj.status = "sync";
					callback(obj);
				}
			}
		};
		xhr_req.onerror = function(){
			callback({status: "connected"});
		};
		xhr_req.ontimeout = function(){
			callback({status: false});
		};

		xhr_req.send();

		return xhr_req;
	}

	function find(ip_num, callback){
	    if(abort === true) return;
	    if(xhr_ip[ip_num] !== undefined) xhr_ip[ip_num].abort();
		xhr_ip[ip_num] = xmlhttprequest(get_url_service(ip_num), function(dev){
			devices[ip_num] = dev;
			if(callback!==undefined) callback(devices[ip_num], ip_num);
			xhr_ip[ip_num] = undefined;
		});
	}

   	function find_and_next(i, callback, callback_end){
	    abort = setTimeout(function(){
	        find(i, function(dev){
                if(callback!==undefined) callback(dev, i);
                for(var j=0;j<4;j++){
                    i++;
                    if (i < 255) {
                        find(i, callback, callback_end);
                    }else break;
                }
                i++;
                if (i < 256) find_and_next(i, callback, callback_end);
                else if (callback_end !== undefined) callback_end();
            });
        }, 5);
	}

	function abort_last_session(){
	    if(abort !== undefined) clearTimeout(abort);
	    abort = true;
	    for(var i in xhr_ip){
	        if(xhr_ip[i] !== undefined) xhr_ip[i].abort();
	        xhr_ip[i] = undefined;
        }
    }

	this.start = function(callback, callback_end){
		abort_last_session();
		find_and_next(1, callback, callback_end);
	};
	
	this.check_device = function(ip_num, callback){
		if(callback === undefined) return self.get_device(ip_num);
		find(ip_num, callback);
	};
	
	this.get_device = function(ip_num){
		return devices[ip_num];
	};
	this.get_devives = function(){
		return devices;
	};
	this.settings = function(opts){
	    abort_last_session();
        network = (opts!=undefined && opts["network"]!=undefined) ? opts["network"] : network;
        service_protocol = (opts!=undefined && opts["service_protocol"]!=undefined) ? opts["service_protocol"] : service_protocol;
        service_port = (opts!=undefined && opts["service_port"]!=undefined) ? opts["service_port"] : service_port;
        service_endpoint = (opts!=undefined && opts["service_endpoint"]!=undefined) ? opts["service_endpoint"] : service_endpoint;
    };

	return this;
}