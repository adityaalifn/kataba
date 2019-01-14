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
            // Set value to mgs_commission_rate field
            frappe.model.set_value(frm.doctype, frm.docname, "mgs_commission_rate",data.message.mgs_commission_rate)
            
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
            
            frappe.model.set_value(frm.doctype, frm.docname, "total_commission", total_commission);
            if (isSaving) {
                overrideTotalCommission(frm, total_commission);
            }
        }
    })
}

function overrideTotalCommission(frm, total_commission) {
    setTimeout(() => {
        frappe.call({
            "method": "kataba.client.run_sql",
            args: {
                "sql": "update `tabSales Order` set total_commission = " + total_commission + " where name = '" + frm.docname +"'"
            }
        })
        console.log("Total commission override was successful.");
        isSaving = false;
    }, 3000);
}

var isSaving = false;

frappe.ui.form.on("Sales Order", {
    onload: function(frm) {
        if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
            getCompanyInfo(frm);
        }
    },
    sales_partner: function(frm) {
        getCompanyInfo(frm);
    },
    items: function(frm) {
        getCompanyInfo(frm);
    },
    on_submit: function(frm) {
        isSaving = true;
        getCompanyInfo(frm);
    }
})
