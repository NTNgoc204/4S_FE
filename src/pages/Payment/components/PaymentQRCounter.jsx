function PaymentQRCounter({ timeLeft, t }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mb-6">
      <p className="text-xs text-slate-400 uppercase tracking-widest">
        {t("checkout:timer.label", "Thời gian còn lại")}
      </p>
      <p className="text-2xl font-mono font-bold text-rose-400 mt-1">
        {formatTime(timeLeft)}
      </p>
    </div>
  );
}

export default PaymentQRCounter;
