function setCommissionData(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Sales Partner Type",
			"filters": {'sales_partner_type': frm.doc.partner_type}
		},
		callback: function (data) {
			// frappe.model.set_value(doctype, name, fieldname, value)
			frappe.model.set_value(frm.doctype, frm.docname, "commission_type",data.message.mgs_commission_type)
			frappe.model.set_value(frm.doctype, frm.docname, "commission_rate",data.message.mgs_commission_rate)
		}
	})
}

frappe.ui.form.on("Sales Partner", {
    setup: function(frm) {
	frm.set_query("territory", function() {
		return {
			filters: [
				["Territory","is_group", "=", 0]
			]
		}
	});
    },
    refresh: function(frm) {
        setCommissionData(frm)
    },

    onload: function(frm) {
        setCommissionData(frm)
    },

    partner_type: function(frm) {
        setCommissionData(frm)
    }
})
