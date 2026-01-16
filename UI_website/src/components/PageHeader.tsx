import React from 'react';
import '../style/PageHeader.css'; // We will create this shared style

interface PageHeaderProps {
  title?: string;
  subtitle: string;
  children?: React.ReactNode; // For buttons like "Add Bin"
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title = "Panaji Municipal Council (Zone A)", // Default value
  subtitle, 
  children 
}) => {
  return (
    <div className="common-page-header">
      <div className="header-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      
      {/* If a button is passed, render it on the right */}
      {children && <div className="header-actions">{children}</div>}
    </div>
  );
};

export default PageHeader;