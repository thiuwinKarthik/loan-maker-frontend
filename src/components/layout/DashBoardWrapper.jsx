import React from "react";
import Sidebar from "./Sidebar";

const DashboardWrapper = ({ user, children }) => {
  return (
    <div className="flex">
      <Sidebar role={user.role} />
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="container-responsive py-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardWrapper;
