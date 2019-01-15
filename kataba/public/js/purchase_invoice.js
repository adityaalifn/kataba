function setBilledAccount(frm) {
        frappe.call({
                "method": "frappe.client.get",
                args: {
                        "doctype": "Company",
                        "filters": {'name': frm.doc.supplier_name}
                },
                callback: function (data) {
                        console.log(data.message.supplier_link)
                        console.log(data.message.umrah_stock_received_but_not_billed_invoice_account);
                        console.log("AA");
                        console.log(isSupplierInChildTable(frm.doc.supplier_name, frm.doc.company));
                        if (frm.doc.is_pnr == 1 && isSupplierInChildTable(frm.doc.supplier_name, frm.doc.company)){
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
        var sql = "select name, parent, supplier from `tabSupplier Link` where supplier='" + supplier + "' and parent='" + parent + "';"
        var data = frappe.call({
                "method": "kataba.client.run_sql",
                args :{
                        "sql": sql
                }
        })
        if (data != null) {
                return true;
        }
        return false;
}

function umrahValueErrorMessage(frm) {
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'name': frm.doc.supplier_name}
		},
		callback: function (data) {
			if (data.message.umrah_stock_received_but_not_billed_receive_account != null && data.message.umrah_stock_received_but_not_billed_invoice_account != null){
				return "Umrah Stock Received But Not Billed Receive Account has no value and Umrah Stock Received But Not Billed Receive Account has no value";
			}
			else if (data.message.umrah_stock_received_but_not_billed_receive_account != null){
				return "Umrah Stock Received But Not Billed Receive Account has no value";
			}
			else if (data.message.umrah_stock_received_but_not_billed_invoice_account != null){
				return "Umrah Stock Received But Not Billed Invoice Account";
			}
			else {
				return "";
			}
		}
	})
}

frappe.ui.form.on("Purchase Invoice", {
	on_submit: function(frm) {
		setBilledAccount(frm);
	},
	validate: function (frm) {
		var message = umrahValueErrorMessage(frm);
		if (message != ""){
			frappe.msgprint(message);
		}
	}
})
