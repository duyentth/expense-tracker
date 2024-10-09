export const formatDate = (timestamp) => {
  const d = new Date(parseInt(timestamp));
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  };
  return d.toLocaleDateString("en-US", options);
};
