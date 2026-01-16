import React from "react";
import "../../style/RoutesPage.css";

interface Vehicle {
  id: number;
  name: string;
}

interface Props {
  vehicles: Vehicle[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const RouteTabs: React.FC<Props> = ({ vehicles, selectedId, onSelect }) => {
  return (
    <div className="vehicle-tabs">
      <button
        className={`tab ${selectedId === null ? "active" : ""}`}
        onClick={() => onSelect(null)}
      >
        All routes
      </button>

      {vehicles.map((v) => (
        <button
          key={v.id}
          className={`tab ${selectedId === v.id ? "active" : ""}`}
          onClick={() => onSelect(v.id)}
        >
          {v.name}
        </button>
      ))}
    </div>
  );
};

export default RouteTabs;