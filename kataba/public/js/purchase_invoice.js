function setBilledAccount(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'company_name': frm.doc.company_name}
		},
		callback: function (data) {
			if (frm.doc.is_pnr == 1 && frm.doc.update_stock == 1 && frm.doc.supplier_name == data.message.company_name){
				
			}
		}
	})
}
