function setBilledAccount(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'name': frm.doc.supplier_name}
		},
		callback: function (data) {
			console.log(data.message.name);
			if (frm.doc.is_pnr == 1 && frm.doc.update_stock == 1 && frm.doc.supplier_name == data.message.name){
				console.log("A");
				var sql = "update `tabGL Entry` set account='" + data.message.umrah_stock_received_but_not_billed_receive_account + "' where voucher_no='" + frm.doc.name + "'"
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

frappe.ui.form.on("Purchase Receipt", {
	on_submit: function(frm) {
		setBilledAccount(frm)
	}
})

