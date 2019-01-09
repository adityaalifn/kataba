function saveTotalCommission(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Sales Partner",
			"filters": {'partner_name': frm.doc.sales_partner}
		},
		callback: function (data) {
			if (data.message.commission_type == "Value") {
				var umrahItemCount = 0;
				for (var i=0; i < cur_frm.doc.items.length; i++) {
					//console.log(cur_frm.doc.items[i])
					if (cur_frm.doc.items[i].item_group === "Umrah") {
						umrahItemCount++
					}
				}
// 				console.log("umrahItemCount",umrahItemCount)
				var sql = "update `tabSales Order` set sales_partner='"+frm.doc.sales_partner+"', commission_rate = "+data.message.commission_rate+", total_commission = "+umrahItemCount*data.message.commission_rate+" where name = '"+frm.docname+"'"
				frappe.call({ 
					"method": "kataba.client.run_sql",
					args: {
						"sql": sql
					}
				})
			}else if (data.message.commission_type == "Percentage") {
				var amount = 0;
				var umrahItemCount = 0;
				for (var i=0; i < cur_frm.doc.items.length; i++) {
					//console.log(cur_frm.doc.items[i])
					if (cur_frm.doc.items[i].item_group === "Umrah") {
						umrahItemCount++
						amount+=cur_frm.doc.items[i].amount
					}
				}
// 				console.log("umrahItemCount",umrahItemCount)
				var sql = "update `tabSales Order` set sales_partner='"+frm.doc.sales_partner+"', commission_rate = "+data.message.commission_rate+", total_commission = "+amount*(data.message.commission_rate/100)+" where name = '"+frm.docname+"'"
				//frm.set_value("total_commission", cur_frm.doc.items.length)
				frappe.call({ 
					"method": "kataba.client.run_sql",
					args: {
						"sql": sql
					}
				})
			}
		}
	})
}

function formatMoney(n, c, d, t) {
  var c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "," : d,
    t = t == undefined ? "." : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;

  return "Rp " + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function loadCommissionData(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Sales Partner",
			"filters": {'partner_name': frm.doc.sales_partner}
		},
		callback: function (data) {
			if (data.message.commission_type == "Value") {
				var umrahItemCount = 0;
				for (var i=0; i < cur_frm.doc.items.length; i++) {
					//console.log(cur_frm.doc.items[i])
					if (cur_frm.doc.items[i].item_group === "Umrah") {
						umrahItemCount++
					}
				}
// 				console.log("umrahItemCount",umrahItemCount)
				document.querySelector("[title='commission_rate'] .control-value").innerHTML = data.message.commission_rate;
				document.querySelector("[title='total_commission'] .control-value").innerHTML = formatMoney(umrahItemCount*data.message.commission_rate);
			}else if (data.message.commission_type == "Percentage") {
				var amount = 0;
				for (var i=0; i < cur_frm.doc.items.length; i++) {
					//console.log(cur_frm.doc.items[i])
					if (cur_frm.doc.items[i].item_group === "Umrah") {
						amount+=cur_frm.doc.items[i].amount
					}
				}
// 				console.log("Percentage", formatMoney(amount*(data.message.commission_rate/100)))
				document.querySelector("[title='commission_rate'] .control-value").innerHTML = data.message.commission_rate;
				document.querySelector("[title='total_commission'] .control-value").innerHTML = formatMoney(amount*(data.message.commission_rate/100));
			}
		}
	})
}

//Make frm become a global variable
var frm_copy, isSaving = false;

frappe.ui.form.on("Sales Order", {
	onload: function(frm) {
		frm_copy = frm;
		setInterval(function(){ 
			if (document.querySelector(`body[data-route='Form/Sales Order/${frm.docname}']`)){
				loadCommissionData(frm);
			}
		}, 50);
	},
	sales_partner: function(frm) {
		loadCommissionData(frm)
	},	
	items: function(frm) {
		loadCommissionData(frm)
	},	
	validate: function(frm) {
		isSaving = true
	}
})

setInterval(function(){ 
	if (document.querySelector(`body[data-route='Form/Sales Order/${frm_copy.docname}']`)){
		loadCommissionData(frm_copy);
	}
	if (document.querySelector('.modal.fade.in') && document.querySelector(`body[data-route='Form/Sales Order/${frm_copy.docname}']`)) {
		// Hide a modal that said "Commission Rate cannot be greater than 100"
		if (document.querySelector('.modal.fade.in .modal-body .msgprint').innerText === "Commission Rate cannot be greater than 100") {
			document.querySelector('.modal.fade.in').style.visibility = "hidden";
			loadCommissionData(frm_copy);
		}		
	}
	if (isSaving && document.querySelector(`body[data-route='Form/Sales Order/${frm_copy.docname}']`)) {
		if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Save"){
			console.log("Waiting erpnext")
		}
		if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Submit"){
			console.log("Updating value")
			saveTotalCommission(frm_copy)
			isSaving=false
			loadCommissionData(frm_copy)
		}
	}
}, 50);
