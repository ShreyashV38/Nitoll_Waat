import Sidebar from "../components/Sidebar";
import "../style/Reports.css";

type SummaryRow = {
  id: string;
  bins: number;
  status: "COMPLETED" | "IN PROGRESS" | "PENDING";
};

const summaryData: SummaryRow[] = [
  { id: "GA-07-T-1234", bins: 6, status: "COMPLETED" },
  { id: "GA-07-T-5678", bins: 7, status: "IN PROGRESS" },
  { id: "GA-07-T-9012", bins: 4, status: "PENDING" },
];

const Reports = () => {
  const stats = {
    vehiclesUsed: 3,
    routesCompleted: 1,
    binsCollected: 13,
    overflowAvoided: 3,
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="reports-page">
        {/* Header */}
        <div className="reports-header">
          <h1>Panaji Municipal Council (Zone A)</h1>
          <p>North Goa • {stats.vehiclesUsed} Vehicles Registered</p>
        </div>

        {/* Stat Cards */}
        <div className="report-cards">
          <div className="report-card">
            <span>Vehicle Used Today</span>
            <strong>{stats.vehiclesUsed}</strong>
          </div>

          <div className="report-card">
            <span>Routes Completed</span>
            <strong className="green">{stats.routesCompleted}</strong>
          </div>

          <div className="report-card">
            <span>Bins Collected</span>
            <strong>{stats.binsCollected}</strong>
          </div>

          <div className="report-card">
            <span>Overflow Avoided</span>
            <strong className="blue">{stats.overflowAvoided}</strong>
          </div>
        </div>

        {/* Summary Table */}
        <div className="summary-box">
          <h3>Today's Summary</h3>

          <table>
            <thead>
              <tr>
                <th>VEHICLE ID</th>
                <th>BINS COLLECTED</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {summaryData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td className="bins">{row.bins}</td>
                  <td className={`status ${row.status.replace(" ", "-")}`}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Reports;
