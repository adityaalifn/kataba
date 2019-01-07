console.log('Kataba custom script')
frappe.ui.form.on("Company", {
	setup: function(frm) {
		frm.set_query("umrah_sales_commission_account", function() {
			return {
				filters: [
					["Account"," account_type", "in", ["Payable"]]
				]
			}
		});

		frm.set_query("umrah_revenue_acccount", function() {
			return {
				filters: [
					["Account","root_type", "in", ["Income"]],
					["Account","report_type", "in", ["Profit and Loss"]]
				]
			}
		});

		frm.set_query("umrah_stock_received_but_not_billed_receive_account", function() {
			return {
				filters: [
					["Account","root_type", "in", ["Liability"]],
					["Account","report_type", "in", ["Balance Sheet"]]
				]
			}
		});

		frm.set_query("umrah_stock_received_but_not_billed_invoice_account", function() {
			return{
				filters: [
					["Account","root_type", "in", ["Liability"]],
					["Account","report_type", "in", ["Balance Sheet"]]
				]
			}
		});

		frm.set_query("umrah_item_group", function() {
			return{
				filters: [
					["Item Group","parent_item_group", "!=", ""]
				]
			}
		});	
	}
});

