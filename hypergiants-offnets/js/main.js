data_obj = {};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

async function init(){
	await display_ISP_info();

	fetch("data/per_asn/" + data_obj.asn + ".json").then((response) => {
		if (response.ok) {
			return response.json();
		}else{
			throw new Error('Something went wrong');
		}
	}).then((responseJson) => {
		var results_array = [];
		responseJson.forEach(function (item, index) {
			results_array.push(item.capitalize());
		});
		$("#id_isp_hgs").html("<div class=\"alert alert-success mt-2\" role=\"alert\"><p>" + results_array.join(", ") + "</p></div>");
	}).catch((error) => {
		$("#id_isp_hgs").html("<div class=\"alert alert-warning mt-2\" role=\"alert\"><p>No Hypergiant off-nets found.</p></div>");
	});
}

async function display_ISP_info(){
	cloudflare_response = await getIP();
	cloudflare_response = cloudflare_response.trim().split('\n').reduce(function(obj, pair) { pair = pair.split('='); return obj[pair[0]] = pair[1], obj; }, {});
	
	if ('ip' in cloudflare_response){
		ripestat_response = await getASNInfo(cloudflare_response.ip);
		data_obj['ip'] = cloudflare_response.ip;
		if ('data' in ripestat_response && 'asns' in ripestat_response.data && ripestat_response.data.asns.length > 0){
			data_obj['asn'] = ripestat_response.data.asns[0].asn;
			data_obj['name'] = ripestat_response.data.asns[0].holder;
		}
	}
	$("#id_isp_details").html("<div class=\"alert alert-secondary\" role=\"alert\">Your public IP address is " + data_obj.ip + ".</br>Your ISP is <b>AS-" + data_obj.asn + " (" + data_obj.name + ")</b>.</div>"); 
}

async function getASNInfo(ip_addr) {
 	return fetch('https://stat.ripe.net/data/prefix-overview/data.json?max_related=50&resource=' + ip_addr).then((response) => response.json());
}

async function getIP(){
	return fetch('https://www.cloudflare.com/cdn-cgi/trace').then((response) => response.text());
}

function findOffnetsPerASN(){

	if ($("#findOffnetsASNInput").val() == ""){
		return;
	}

	fetch("data/per_asn/" + $("#findOffnetsASNInput").val() + ".json").then((response) => {
		if (response.ok) {
			return response.json();
		}else{
			throw new Error('Something went wrong');
		}
	}).then((responseJson) => {
		var results_array = [];
		responseJson.forEach(function (item, index) {
			results_array.push(item.capitalize());
		});
		$("#id_asn_hgs").html("<p class=\"mt-3\">Hypergiants operating off-nets in <b>AS" + $("#findOffnetsASNInput").val() + "</b>:</br><div class=\"alert alert-success mt-1\" role=\"alert\">" + results_array.join(", ") + "</p></div>");
	}).catch((error) => {
		$("#id_asn_hgs").html("<p class=\"mt-3\">Hypergiants operating off-nets in <b>AS" + $("#findOffnetsASNInput").val() + "</b>:</br><div class=\"alert alert-warning mt-1\" role=\"alert\"><p>No Hypergiant off-nets found.</p></div>");
	});
}

function findOffnetsPerHypergiant(){

	if ($("#findOffnetsASNInput").val() == "null"){
		return;
	}

	fetch("data/per_hg/" + $("#inputHypergiant").val() + ".json").then((response) => {
		if (response.ok) {
			return response.json();
		}else{
			throw new Error('Something went wrong');
		}
	}).then((responseJson) => {
		if (responseJson.length == 0){
			$("#id_hg_asns").html("<p class=\"mt-3\"><b>" + $("#inputHypergiant").val().capitalize() + " has zero off-nets. </b></p>");
		}else{
			$("#id_hg_asns").html("<p class=\"mt-3\"><b>" + $("#inputHypergiant").val().capitalize() + " operates off-nets in the following ASes "  + "</b></br><div class=\"alert alert-success mt-1\" style=\"overflow-y: scroll;max-height: 240px;\" role=\"alert\">" + responseJson.sort(function(a, b) { return a - b; }).join(", ") + "</p></div>");
		}
	}).catch((error) => {
		$("#id_hg_asns").html("<p class=\"mt-3\">Hypergiants operating off-nets in <b>AS" + $("#findOffnetsASNInput").val() + "</b>:</br><div class=\"alert alert-warning mt-1\" role=\"alert\"><p>No Hypergiant off-nets found.</p></div>");
	});
}