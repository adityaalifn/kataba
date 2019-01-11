function setBilledAccount(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'name': frm.doc.supplier_name}
		},
		callback: function (data) {
			console.log(data.message.supplier_link)
			console.log(data.message.umrah_stock_received_but_not_billed_invoice_account));
			if (frm.doc.is_pnr == 1 && frm.doc.update_stock == 1 && isSupplierInChildTable(frm.doc.supplier_name, frm.doc.company)){
				console.log(isSupplierInChildTable(frm.doc.supplier_name, frm.doc.company);
				var sql = "update `tabGL Entry` set account='" + data.message.umrah_stock_received_but_not_billed_invoice_account + "' where voucher_no='" + frm.doc.name + "'"
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

function isSupplierInChildTable(supplier, parent) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Supplier Link",
			"filters": {'supplier': supplier, 'parent': parent}
		},
		callback: function (data) {
			if (data != null) {
				return true;
			}
			return false;
		}
	})
}

frappe.ui.form.on("Purchase Invoice", {
	on_submit: function(frm) {
		setBilledAccount(frm)
	}
})
