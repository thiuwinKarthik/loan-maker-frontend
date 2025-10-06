import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/common/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const statusColors = {
  APPROVED: { bg: "#34D399", text: "#fff" },
  PENDING: { bg: "#FBBF24", text: "#000" },
  REJECTED: { bg: "#EF4444", text: "#fff" },
};

const AdminDashboard = () => {
  const [userStats, setUserStats] = useState({});
  const [loanStats, setLoanStats] = useState({});
  const [loans, setLoans] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const resUsers = await fetch("https://loan-maker-backend.onrender.com/api/users/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = await resUsers.json();
        setUserStats(users);

        const resLoans = await fetch("https://loan-maker-backend.onrender.com/api/loans/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const loansData = await resLoans.json();
        setLoanStats(loansData);

        const resAllUsers = await fetch("https://loan-maker-backend.onrender.com/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allUsers = await resAllUsers.json();

        const loansWithUser = await Promise.all(
          allUsers.map(async (user) => {
            const resUserLoans = await fetch(
              `https://loan-maker-backend.onrender.com/api/loans/applications/${user.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const userLoans = resUserLoans.ok ? await resUserLoans.json() : [];
            return userLoans.map((loan) => ({
              ...loan,
              userName: user.name,
              userEmail: user.email,
            }));
          })
        );

        const allLoansFlat = loansWithUser.flat();
        setLoans(allLoansFlat);

        // Latest 5 loans
        const latest = [...allLoansFlat]
          .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
          .slice(0, 5);
        setRecentLoans(latest);
      } catch (err) {
        console.error(err.message);
      }
    };

    loadData();
  }, [token]);

  // Provider-wise distribution
  const providerData = loans.reduce((acc, loan) => {
    const existing = acc.find((d) => d.name === loan.providerName);
    if (existing) existing.value++;
    else acc.push({ name: loan.providerName, value: 1 });
    return acc;
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar role="ROLE_ADMIN" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <Navbar title="Admin Dashboard" />

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mx-auto">
            <Card title="Total Users" value={userStats.totalUsers || 0} />
            <Card title="Total Admins" value={userStats.totalAdmins || 0} />
            <Card title="Normal Users" value={userStats.totalNormalUsers || 0} />
            <Card title="Total Loans" value={loanStats.totalLoans || 0} />
            <Card title="Approved Loans" value={loanStats.approvedLoans || 0} />
            <Card title="Pending Loans" value={loanStats.pendingLoans || 0} />
            <Card title="Rejected Loans" value={loanStats.rejectedLoans || 0} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-6xl mx-auto">
            {/* Loan Status Bar Chart */}
            <div className="bg-gradient-to-r from-green-100 via-green-200 to-green-300 p-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="font-semibold mb-3 text-gray-800">Loan Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: "Approved", value: loanStats.approvedLoans || 0 },
                    { name: "Pending", value: loanStats.pendingLoans || 0 },
                    { name: "Rejected", value: loanStats.rejectedLoans || 0 },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    <Cell fill={statusColors.APPROVED.bg} />
                    <Cell fill={statusColors.PENDING.bg} />
                    <Cell fill={statusColors.REJECTED.bg} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Provider Distribution Pie Chart */}
<div className="bg-blue-100 p-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
  <h3 className="font-semibold mb-3 text-gray-800">Provider-wise Distribution</h3>
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={providerData}
        dataKey="value"
        nameKey="name"
        outerRadius={80}
        label
      >
        {providerData.map((_, i) => (
          <Cell
            key={i}
            fill={["#3B82F6", "#10B981", "#FBBF24", "#EF4444", "#8B5CF6"][i % 5]}
          />
        ))}
      </Pie>
      <Legend />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>

          </div>

          {/* Recent Loans Table */}
          <div className="bg-white p-5 rounded-2xl shadow-xl mt-6 max-w-6xl mx-auto overflow-x-auto">
            <h3 className="font-semibold mb-3">Recent Loan Applications</h3>
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{loan.id}</td>
                    <td className="p-3">{loan.userName}</td>
                    <td className="p-3">{loan.providerName}</td>
                    <td className="p-3">{loan.loanAmount}</td>
                    <td>
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            statusColors[loan.status]?.bg || "#9CA3AF",
                          color: statusColors[loan.status]?.text || "#fff",
                        }}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
