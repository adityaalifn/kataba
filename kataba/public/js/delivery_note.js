function getCompanyInfo(frm) {
    frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'company_name': frm.doc.company}
		},
		callback: function (data) {
            var item_group = "";
            
            // Fetch umrah_item_group value
            item_group = data.message.umrah_item_group;
            
            setCommissionData(frm, item_group);
        }
    })
}

function setCommissionData(frm, item_group) {
    frappe.call({
        "method": "frappe.client.get",
        args: {
            "doctype": "Sales Partner",
            "filters": {'partner_name': frm.doc.sales_partner}
        },
        callback: function (data) {
            // frappe.model.set_value(doctype, name, fieldname, value)
            
            // Counting parameters
            var total_commission = 0;
            var umrahItemCount = 0;
            var amount = 0;
            for (var i=0; i < cur_frm.doc.items.length; i++) {
                if (cur_frm.doc.items[i].item_group === item_group) {
                    umrahItemCount += cur_frm.doc.items[i].qty;
                    amount+=cur_frm.doc.items[i].amount;
                }
            }

            if (data.message.mgs_commission_type === "Value") {
                total_commission = umrahItemCount*data.message.mgs_commission_rate
            }else if (data.message.mgs_commission_type === "Percentage") {
                total_commission = amount*(data.message.mgs_commission_rate/100)
            }
            
            if (frm.doc.status === "Draft" || frm.doc.status === "Completed" || frm.doc.status === "Cancelled" || frm.doc.status === "Closed") {
                // Set value to mgs_commission_rate field
                frappe.model.set_value(frm.doctype, frm.docname, "mgs_commission_rate",data.message.mgs_commission_rate)
                frappe.model.set_value(frm.doctype, frm.docname, "total_commission", total_commission);
            }else{
                overrideTotalCommission(frm, total_commission);
            }
        }
    })
}

function overrideTotalCommission(frm, total_commission) {
    frappe.call({
        "method": "kataba.client.run_sql",
        args: {
            "sql": "update `tabSales Order` set total_commission = " + total_commission + " where name = '" + frm.docname +"'"
        }
    })
    
    isSaving = false;
}

var isSaving = false;

frappe.ui.form.on("Delivery Note", {
    onload: function(frm) {
        if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
            getCompanyInfo(frm);
        }
    },
    sales_partner: function(frm) {
        getCompanyInfo(frm);
    },
    items: function(frm) {
        if (frm.doc.sales_partner !== "") {
            getCompanyInfo(frm);
        }
    },
    on_submit: function(frm) {
        if (frm.doc.sales_partner !== "") {
            isSaving = true;
            getCompanyInfo(frm);
        }
    }
})
