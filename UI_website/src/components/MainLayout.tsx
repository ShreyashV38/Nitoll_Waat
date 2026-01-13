import React from 'react';
import Sidebar from './Sidebar';
// Fixed the path to point to your style folder
import '../style/MainLayout.css'; 

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="content-area">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;