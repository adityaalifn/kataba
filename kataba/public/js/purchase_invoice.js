function setBilledAccount(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Purchase Invoice Type",
			"filters": {'is_pnr': frm.doc.is_pnr}
		},
	})
}
