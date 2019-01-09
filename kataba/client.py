from __future__ import unicode_literals
import frappe

@frappe.whitelist()
def run_sql(sql):
	return frappe.db.sql(sql)
