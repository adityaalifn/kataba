function saveTotalCommission(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Sales Partner",// @desc: Fetching Sales Partner data
			"filters": {'partner_name': frm.doc.sales_partner} // @desc: Get partner_name from sales partner field
		},
		callback: function (data) {
			// @desc: Sales Partner have two fields: Value and Percentage
			if (data.message.commission_type == "Value") {
				var umrahItemCount = 0;
				for (var i=0; i < cur_frm.doc.items.length; i++) {
					//console.log(cur_frm.doc.items[i])
					if (cur_frm.doc.items[i].item_group === "Umrah") {// @desc: Commissions are fetched from all items with item_group: Umrah
						umrahItemCount += cur_frm.doc.items[i].qty
					}
				}
// 				console.log("umrahItemCount",umrahItemCount)
				var sql = "update `tabSales Order` set sales_partner='"+frm.doc.sales_partner+"', commission_rate = "+data.message.commission_rate+", total_commission = "+umrahItemCount*data.message.commission_rate+" where name = '"+frm.docname+"'"
				frappe.call({ 
					"method": "kataba.client.run_sql",// @desc: Calling method from kataba/kataba/client.py
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

function insertAfter(referenceNode, newNode) { //function to insert new HTML element after an existing element in document
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function loadCommissionData(frm) {
	console.log(frm.doc.sales_partner)
	if (frm.doc.sales_partner !== "") {
		frappe.call({
			"method": "frappe.client.get",
			args: {
				"doctype": "Sales Partner",
				"filters": {'partner_name': frm.doc.sales_partner}
			},
			callback: function (data) {
				if (!data.message.commission_type) {
					frappe.msgprint("No commission type found in sales partner or sales partner doctype!")
				}
				if (!document.querySelector("[title='commission_rate'] .control-value-con")){
					//Hide the real Commission Input to avoid validation on submit
					document.querySelector("[title='commission_rate'] .control-value").style.display = "none";
					document.querySelector("[title='total_commission'] .control-value").style.display = "none";
// 					document.querySelector("input[data-fieldname='sales_partner']").style.display = "none";

					//Display Commission Input
	// 				var newSalesPartnerInput = document.createElement("input");
	// 				newSalesPartnerInput.className = "form-control sales-partner-con";
	// 				insertAfter(document.querySelector("input[data-fieldname='sales_partner']"), newSalesPartnerInput);
// 					document.querySelector(".sales-partner-con").value = document.querySelector("input[data-fieldname='sales_partner']").value;
					document.querySelector("[title='commission_rate'] .control-value").outerHTML += `<div class="control-value-con like-disabled-input" style="">${data.message.commission_rate}</div>`; 
					document.querySelector("[title='total_commission'] .control-value").outerHTML += `<div class="control-value-con like-disabled-input" style="">${formatMoney(umrahItemCount*data.message.commission_rate)}</div>`;
				}
				if (document.querySelector("input[data-fieldname='sales_partner']") === document.activeElement) {
					if ($("[data-fieldname='sales_partner'] ul li").length > 0) { //wait until data on ul element being loaded
						document.querySelector("input[data-fieldname='sales_partner']").style.display = "none";
						var newSalesPartnerInput = document.createElement("input");
						newSalesPartnerInput.className = "form-control sales-partner-con";
						insertAfter(document.querySelector("input[data-fieldname='sales_partner']"), newSalesPartnerInput);
						document.querySelector(".sales-partner-con").value = document.querySelector("input[data-fieldname='sales_partner']").value;
						document.querySelector(".sales-partner-con").focus();
					}
				}
				// If fake Sales Partner input is being selected
				if (document.querySelector(".sales-partner-con") === document.activeElement) {
					// Show Sales Partner selection
					document.querySelector("[data-fieldname='sales_partner'] ul").removeAttribute("hidden");
					document.querySelector("[data-fieldname='sales_partner'] .link-btn").style.display = "block";

					document.querySelector("[data-fieldname='sales_partner'] ul").onclick = function() {
						// Update Sales Partner Input value
						document.querySelector(".sales-partner-con").value = document.querySelector("input[data-fieldname='sales_partner']").value;
						document.querySelector("input[data-fieldname='sales_partner']").value = "";
						// When user selected sales partner, hide the selection
						document.querySelector("[data-fieldname='sales_partner'] ul").setAttribute("hidden", true);
						document.querySelector(".sales-partner-con").blur()
					};
				}else if (document.querySelector(".sales-partner-con") !== document.activeElement) {
					document.querySelector("[data-fieldname='sales_partner'] ul").setAttribute("hidden", true);
					document.querySelector("[data-fieldname='sales_partner'] .link-btn").style.display = "none";
				}

				if (data.message.commission_type == "Value") {
					var umrahItemCount = 0;
					for (var i=0; i < cur_frm.doc.items.length; i++) {
						//console.log(cur_frm.doc.items[i])
						if (cur_frm.doc.items[i].item_group === "Umrah") {
							umrahItemCount += cur_frm.doc.items[i].qty
						}
					}
	// 				console.log("umrahItemCount",umrahItemCount)

					// Update fake textbox values
					document.querySelector("[title='commission_rate'] .control-value-con").innerHTML = data.message.commission_rate;
					document.querySelector("[title='total_commission'] .control-value-con").innerHTML = formatMoney(umrahItemCount*data.message.commission_rate);
	// 				console.log("hasil perhitungan:", umrahItemCount*data.message.commission_rate)
	// 				console.log("QTY", umrahItemCount)
				}else if (data.message.commission_type == "Percentage") {
					var amount = 0;
					for (var i=0; i < cur_frm.doc.items.length; i++) {
						//console.log(cur_frm.doc.items[i])
						if (cur_frm.doc.items[i].item_group === "Umrah") {
							amount+=cur_frm.doc.items[i].amount
						}
					}
	// 				console.log("Percentage", formatMoney(amount*(data.message.commission_rate/100)))
					document.querySelector("[title='commission_rate'] .control-value-con").innerHTML = data.message.commission_rate;
					document.querySelector("[title='total_commission'] .control-value-con").innerHTML = formatMoney(amount*(data.message.commission_rate/100));
				}
			}
		})
	}
}

var isSaving = false, isLoaded = false, frm_copy;

frappe.ui.form.on("Sales Order", {
	onload: function(frm) {
		frm_copy = frm;
		if (document.querySelector(`body[data-route='Form/Sales Order/${frm.docname}']`)){
			isLoaded = true;
			console.log("Kataba script loaded.")
		}
	},
	sales_partner: function(frm) {
		loadCommissionData(frm)
	},	
	items: function(frm) {
		loadCommissionData(frm)
	},	
	validate: function(frm) {
		isSaving = true
	},
// 	after_insert: function(frm) {
// 		console.log("After Insert");
// 	}
})
setInterval(function(){ 
	if (isLoaded && frm_copy.doc.sales_partner !== ""){
		loadCommissionData(frm_copy);
	}
	if (isSaving && isLoaded && frm_copy.doc.sales_partner !== "") {
		if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Save"){
			//console.log("Waiting erpnext")
		}
		if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Submit"){
			console.log("Updating value")
			saveTotalCommission(frm_copy)
			isSaving=false
			loadCommissionData(frm_copy)
		}
	}
	if (isLoaded && document.querySelector('.modal.fade.in')) {
		// Hide a modal that said "Commission Rate cannot be greater than 100"
		if (document.querySelector('.modal.fade.in .modal-body .msgprint')){
			if (document.querySelector('.modal.fade.in .modal-body .msgprint').innerText.includes("Commission Rate cannot be greater than 100")) {
				console.log("From erpnext: ", document.querySelector('.modal.fade.in .modal-body .msgprint').innerText)
				document.querySelector('.modal.fade.in .btn-modal-close').click()
				if (frm_copy.doc.sales_partner !== ""){
					loadCommissionData(frm_copy);
				}
			}		
		}
	}
}, 50);
