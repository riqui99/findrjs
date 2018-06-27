function Binding(b) {
	var self = this;
	var elementBindings = [];
	var curr_value = b.object[b.property];


	function valueGetter(){
		return curr_value;
	}
	function valueSetter(val){
		curr_value = val;
		for (var i = 0; i < elementBindings.length; i++) {
			var binding = elementBindings[i];
			binding.element[binding.attribute] = (binding.transform!==undefined) ? binding.transform(val) : val;
		}
	}

	Object.defineProperty(b.object, b.property, {
		get: valueGetter,
		set: valueSetter,
		enumerable: true,
		configurable: true
	});

	this.addBinding = function(opts){
		var element = opts["el"],
			attribute = (opts["mode"] == "write") ? "innerHTML" : "value",
			event = opts['event'];
		
		var binding = {
			element: element,
			attribute: attribute,
			transform: opts['transform']
		};
		if (event){
			element.addEventListener(event, function(event){
				valueSetter(element[attribute]);
			});
			binding.event = event
		}       
		elementBindings.push(binding);
		element[attribute] = curr_value;
		return self
	};

	b.object[b.property] = curr_value;
	
	return this;
}

var gobal_env = this;
function init_bindings(){
	$.each($("[bind-html]"), function(i, el){
		var var_name = $(el).attr("bind-html"), action;
		if(var_name.split('.').length > 1) {
			action =var_name.split('.')[1];
            var_name = var_name.split('.')[0];
        }
		var b = Binding({
			"object": gobal_env,
			"property": var_name
		});
		var bOpts = {
			mode: "write",
			el: $(el).get(0)
		};

		var format = $(el).attr("bind-format");
		if(action === "length"){
			bOpts["transform"] = function(val){
				if(format !== undefined) return format.replace('{'+var_name+'}', val.length);
				else return val.length;
			};
		} else if(format !== undefined) {
			bOpts["transform"] = function(val){
				var ret_str = format;

				if(format.indexOf('{{'+var_name+'}.i}') !== -1){
					ret_str = format.replace('{{'+var_name+'}.i}', parseInt(val));
				} else {
					ret_str = format.replace('{'+var_name+'}', val)
				}
				return ret_str;
			};
		}
		b.addBinding(bOpts);
	});
}