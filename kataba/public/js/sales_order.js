var isSaving = false, isLoaded = false, frm_copy;

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

function saveTotalCommission(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Sales Partner",// @desc: Fetching Sales Partner data
			"filters": {'partner_name': document.querySelector(".sales-partner-con").value} // @desc: Get partner_name from sales partner field
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
                // var sql = "update `tabSales Order` set sales_partner='"+frm.doc.sales_partner+"', commission_rate = "+data.message.commission_rate+", total_commission = "+umrahItemCount*data.message.commission_rate+" where name = '"+frm.docname+"'"
                var sql = "update `tabSales Order` set sales_partner='"+document.querySelector(".sales-partner-con").value+"', commission_rate = "+data.message.commission_rate+", total_commission = "+umrahItemCount*data.message.commission_rate+" where name = '"+frm.docname+"'"
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
				var sql = "update `tabSales Order` set sales_partner='"+document.querySelector(".sales-partner-con").value+"', commission_rate = "+data.message.commission_rate+", total_commission = "+amount*(data.message.commission_rate/100)+" where name = '"+frm.docname+"'"
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

function loadCommissionData(frm) {    
	// @desc: Clear Sales Partner Input field when being clicked
	document.querySelector("input[data-fieldname='sales_partner']").onclick = function() {
		document.querySelector("input[data-fieldname='sales_partner']").value = ""
	}

    // @desc: Hiding commission_rate and total_commission Input
    if (document.querySelector("[title='commission_rate'] .control-value").style.display !== "none" || document.querySelector("[title='total_commission'] .control-value").style.display !== "none") {
        //Hide the real Commission Input to avoid validation on submit
        document.querySelector("[title='commission_rate'] .control-value").style.display = "none";
        document.querySelector("[title='total_commission'] .control-value").style.display = "none";
    }
    
    if (!document.querySelector("[title='commission_rate'] .control-value-con")){
        //Display Commission Input
        var newCommissionRateInput = document.createElement("div");
        var newTotalCommissionInput = document.createElement("div");
        newCommissionRateInput.className = "control-value-con like-disabled-input";
        newTotalCommissionInput.className = "control-value-con like-disabled-input";
        insertAfter(document.querySelector("[title='commission_rate'] .control-value"), newCommissionRateInput);
        insertAfter(document.querySelector("[title='total_commission'] .control-value"), newTotalCommissionInput); 
        document.querySelector("[title='commission_rate'] .control-value-con").innerHTML = document.querySelector("[title='commission_rate'] .control-value").innerHTML;
        document.querySelector("[title='total_commission'] .control-value-con").innerHTML = document.querySelector("[title='total_commission'] .control-value").innerHTML;
    }

    // @desc: Duplicating Sales Partner Input
    if (document.querySelector("input[data-fieldname='sales_partner']") === document.activeElement) {
        //wait until data on ul element being loaded
        if ($("[data-fieldname='sales_partner'] ul li").length > 0) { 
            document.querySelector("input[data-fieldname='sales_partner']").style.display = "none";
            // @desc: create Sales Partner Input clone
            var newSalesPartnerInput = document.createElement("input");
            newSalesPartnerInput.className = "form-control sales-partner-con";
            insertAfter(document.querySelector("input[data-fieldname='sales_partner']"), newSalesPartnerInput);
			// @desc: create ul clone
			var o = document.querySelector("[data-fieldname='sales_partner'] ul");
			var c = o.cloneNode(true)
			c.setAttribute("class", "con")
			document.querySelector("[data-fieldname='sales_partner'] .awesomplete").appendChild(c)

            document.querySelector(".sales-partner-con").value = document.querySelector("input[data-fieldname='sales_partner']").value;
            document.querySelector(".sales-partner-con").focus();
        }
    }

    // @desc: Reveal List of Sales Partner element and Link button when Sales Partner Input was clicked
    if (document.querySelector(".sales-partner-con") === document.activeElement) {
        // Show Sales Partner selection
        document.querySelector("[data-fieldname='sales_partner'] ul.con").removeAttribute("hidden");
        // Show Link button
        document.querySelector("[data-fieldname='sales_partner'] .link-btn").style.display = "block";

        document.querySelector("[data-fieldname='sales_partner'] ul.con").onclick = function() {
			document.querySelectorAll("[data-fieldname='sales_partner'] ul.con li").forEach((a) => {
        		a.onclick = () =>{
        			document.querySelector(".sales-partner-con").value = a.innerText
        		}
			})
			
            loadTotalCommission(frm, document.querySelector(".sales-partner-con").value);

            // When user has selected sales partner, hide the selection
            document.querySelector("[data-fieldname='sales_partner'] ul.con").setAttribute("hidden", true);
            document.querySelector(".sales-partner-con").blur()
        };
	}
	
	var bodyClicked = false;
	document.querySelector("body").onclick = function() {
		bodyClicked = true;
	}
	
	if (bodyClicked) {
		document.querySelector("[data-fieldname='sales_partner'] ul.con").setAttribute("hidden", true);
		document.querySelector("[data-fieldname='sales_partner'] .link-btn").style.display = "none";
		bodyClicked = false;
	}
}

function loadTotalCommission(frm, partner_name) {
	if (frm.doc.sales_partner !== "") {
		frappe.call({
			"method": "frappe.client.get",
			args: {
				"doctype": "Sales Partner",
				"filters": {'partner_name': partner_name}
			},
			callback: function (data) {
				if (!data.message.commission_type) {
					frappe.msgprint("Warning: No commission type found in sales partner or sales partner type doctype!")
                }

                var umrahItemCount = 0;
                var amount = 0;
                for (var i=0; i < cur_frm.doc.items.length; i++) {
                    //console.log(cur_frm.doc.items[i])
                    if (cur_frm.doc.items[i].item_group === "Umrah") {
                        umrahItemCount += cur_frm.doc.items[i].qty;
                        amount+=cur_frm.doc.items[i].amount;
                    }
                }

				if (data.message.commission_type == "Value") {
                    document.querySelector("[title='commission_rate'] .control-value-con").innerHTML = formatMoney(data.message.commission_rate);
					document.querySelector("[title='total_commission'] .control-value-con").innerHTML = formatMoney(umrahItemCount*data.message.commission_rate);
                    //console.log("hasil perhitungan:", umrahItemCount*data.message.commission_rate)
                    //console.log("QTY", umrahItemCount)
				}else if (data.message.commission_type == "Percentage") {
                    document.querySelector("[title='commission_rate'] .control-value-con").innerHTML = data.message.commission_rate+"%";
					document.querySelector("[title='total_commission'] .control-value-con").innerHTML = formatMoney(amount*(data.message.commission_rate/100));
				}
			}
		})
	}
}

var initialSalesPartner, hasSubmited = false;

frappe.ui.form.on("Sales Order", {
	onload: function(frm) {
		if (document.querySelector(`body[data-route='Form/Sales Order/${frm.docname}']`)){
            frm_copy = frm;
			isLoaded = true;
			initialSalesPartner = document.querySelector("input[data-fieldname='sales_partner']").value;
			
			console.log("Sales Order Section.");
		}
	},
	sales_partner: function(frm) {
		if (document.querySelector(".sales-partner-con")) {
			loadTotalCommission(frm, document.querySelector(".sales-partner-con").value);
		}
	},	
	items: function(frm) {
		if (document.querySelector(".sales-partner-con")) {
			loadTotalCommission(frm, document.querySelector(".sales-partner-con").value);
		}
	},	
	validate: function(frm) {
        if (document.querySelector(".sales-partner-con")){
            isSaving = true;
            console.log("Saving")
        }else{
			if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Submit") {
				loadTotalCommission(frm, initialSalesPartner);
				cur_frm.set_value("sales_partner", "Zikri");
				cur_frm.set_value("commission_rate", 5);
				cur_frm.cscript.calculate_commission();
				//click save
				document.querySelector(".btn.btn-primary.btn-sm.primary-action").click();
				hasSubmited = true;
				
			}
		}
    }
});

setInterval(function(){ 
	if (isLoaded){
		loadCommissionData(frm_copy);
	}
	
	if (hasSubmited) {
		console.log("Overriding submit");
		var newSalesPartnerInput = document.createElement("input");
		newSalesPartnerInput.className = "form-control sales-partner-con";
		insertAfter(document.querySelector("input[data-fieldname='sales_partner']"), newSalesPartnerInput);
		document.querySelector(".sales-partner-con").value = initialSalesPartner;
		saveTotalCommission(frm);
	}

	if (isSaving && isLoaded) {
		// if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Save"){
		// 	console.log("Waiting erpnext")
		// }
		// if (document.querySelector(".btn.btn-primary.btn-sm.primary-action").innerText === "Submit"){
			
		// }
		if (document.querySelector(".sales-partner-con")) {
			if (document.querySelector(".sales-partner-con").value !== "") {
				console.log("Updating value");
				saveTotalCommission(frm_copy);
				isSaving=false;
				loadCommissionData(frm_copy);
				frappe.msgprint("Commission setting saved.");
				location.reload();
			}
		}
    }

	if (isLoaded && document.querySelector('.modal.fade.in')) {
		// Hide a modal that said "Commission Rate cannot be greater than 100"
		if (document.querySelector('.modal.fade.in .modal-body .msgprint')){
			if (document.querySelector('.modal.fade.in .modal-body .msgprint').innerText.includes("Commission Rate cannot be greater than 100") || document.querySelector('.modal.fade.in .modal-body .msgprint').innerText.includes("No document found for given filters")) {
                console.log("From erpnext: ", document.querySelector('.modal.fade.in .modal-body .msgprint').innerText);

                document.querySelector('.modal.fade.in .btn-modal-close').click();
			}		
		}
	}
}, 50);
