import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";
import Modal from "../../components/common/Modal";

const LoanHistory = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [eligibleAmount, setEligibleAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalLoan, setModalLoan] = useState(null);
  const [modalType, setModalType] = useState(""); // "approved" | "rejected"

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resUser = await fetch("https://loan-maker-backend-production.up.railway.app/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();
      setUser(userData);

      const resLoans = await fetch(
        `https://loan-maker-backend-production.up.railway.app/api/loans/applications/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const loansData = await resLoans.json();
      setLoans(loansData || []);

      // Find latest approved or rejected loan for popup
      try {
        const sorted = [...(loansData || [])].sort((a, b) => {
          const da = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
          const db = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
          if (da !== db) return db - da;
          return (b.id || 0) - (a.id || 0);
        });

        const latest = sorted[0];
        if (latest && ["approved", "rejected"].includes(latest.status.toLowerCase())) {
          const lastKey = `last_notified_${latest.status}_${userData.id}`;
          const lastId = localStorage.getItem(lastKey);
          if (String(latest.id) !== String(lastId || "")) {
            setModalLoan(latest);
            setModalType(latest.status.toLowerCase());
            localStorage.setItem(lastKey, String(latest.id));
          }
        }
      } catch (_) {}

      const resOffers = await fetch(
        `https://loan-maker-backend.onrender.com/api/loans/offers/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const offersData = await resOffers.json();
      setOffers(offersData.offers || []);
      setEligibleAmount(offersData.eligibleAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-700">Loading history...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role || "USER"} />
      <div className="flex-1 overflow-auto">
        <Navbar title={"Loan History"} />

        <div className="container-responsive py-6 space-y-6">
          {/* Dynamic Modal */}
          <Modal
            isOpen={!!modalLoan}
            onClose={() => setModalLoan(null)}
            title={modalType === "approved" ? "Loan Approved 🎉" : "Loan Rejected ❌"}
            size="md"
            footer={
              <div className="flex justify-center">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setModalLoan(null)}
                >
                  Close
                </button>
              </div>
            }
          >
            {modalLoan && (
              <div className="space-y-3 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                  {modalType === "approved" ? (
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-500" />
                  )}
                </div>

                {/* Dynamic Message */}
                <h3 className="text-xl font-semibold">
                  {modalType === "approved"
                    ? "Congratulations! Your loan has been approved 🎊"
                    : "Unfortunately, your loan application was rejected 😞"}
                </h3>

                <div className="text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Application ID:</span> {modalLoan.id}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> ₹{modalLoan.loanAmount}
                  </p>
                  <p>
                    <span className="font-medium">Provider:</span> {modalLoan.providerName}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={`${getStatusColor(modalLoan.status)} px-2 py-1 rounded text-white`}>
                      {modalLoan.status}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Modal>

          {/* Loan Applications Table */}
          <div className="card shadow-lg rounded-xl bg-white p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Loan Applications</h2>
            </div>
            {loans.length === 0 ? (
              <p className="text-gray-500">No loan applications found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                      <th className="p-3">ID</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Tenure</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium">{l.id}</td>
                        <td className="p-3">{l.providerName}</td>
                        <td className="p-3">{l.assetType}</td>
                        <td className="p-3 text-right font-semibold">₹{l.loanAmount}</td>
                        <td className="p-3 text-center">{l.tenure} months</td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-white px-3 py-1 rounded-full text-sm ${getStatusColor(
                              l.status
                            )}`}
                          >
                            {l.status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;
