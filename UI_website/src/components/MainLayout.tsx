// src/components/MainLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom'; // Use Outlet for nested routes
import '../style/MainLayout.css'; 

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="content-area">
        {/* Outlet renders the child route's element */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;