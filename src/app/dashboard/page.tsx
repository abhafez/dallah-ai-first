import { BasicForm } from "@/components/dashboard/basic-form";
import { PaginatedTable } from "@/components/dashboard/paginated-table";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="bg-muted/50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Create New Entry</h2>
          <BasicForm />
        </section>

        <section className="bg-muted/50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <PaginatedTable />
        </section>
      </div>
    </div>
  );
}
