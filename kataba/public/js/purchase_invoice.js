function setBilledAccount(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'company_name': frm.doc.company_name}
		},
		callback: function (data) {
			console.log(data.message.company_name);
			if (frm.doc.is_pnr == 1 && frm.doc.update_stock == 1 && frm.doc.supplier_name == data.message.company_name){
				console.log("A");
				var sql = "update `tabGL Entry` set account='" + data.message.umrah_stock_received_but_not_billed_receive_account + "' where name='" + frm.doc.name + "' and voucher_type='Purchase Receipt'"
				frappe.call({
					"method": "kataba.client.run_sql",
					args: {
						"sql": sql
					}
				})
				var sql2 = "update `tabGL Entry` set account='" + data.message.umrah_stock_received_but_not_billed_invoice_account + "' where name=frm.doc.name' and voucher_type='Purchase Invoice'" 
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

frappe.ui.form.on("Purchase Invoice", {
	on_submit: function(frm) {
		setBilledAccount(frm)
	}
})
