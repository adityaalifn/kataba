frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
    },
    
    onload: function(frm) {
	frappe.ui.form.off("frm.doctype", ["commission_rate", "total_commission"])
	frappe.ui.form.off("frm.doctype", "commission_rate")
	frappe.ui.form.off("frm.doctype", "total_commission")
    },
    
    sales_partner: function(frm) {
        //setCommissionData(frm)
	cur_frm.set_value("commission_rate",69)
	cur_frm.set_value("total_commission",10*2333)
    }
})

