import "../style/StateCard.css";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
  danger?: boolean;
  success?: boolean;
  warning?: boolean;
}

const StateCard = ({ title, value, subtitle, danger, success, warning }: Props) => {
  let extraClass = "";
  if (danger) extraClass = "danger";
  else if (success) extraClass = "success";
  else if (warning) extraClass = "warning";

  return (
    <div className={`stat-card ${extraClass}`}>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

export default StateCard;
