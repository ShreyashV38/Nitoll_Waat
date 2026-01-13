import "../style/StateCard.css";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
  danger?: boolean;
}

const StateCard = ({ title, value, subtitle, danger }: Props) => {
  return (
    <div className={`stat-card ${danger ? "danger" : ""}`}>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

export default StateCard;
