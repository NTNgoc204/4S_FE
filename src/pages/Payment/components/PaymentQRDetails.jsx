import { toast } from "react-toastify";
import copyIcon from "../../../assets/copy.svg";

function PaymentQRDetails({ paymentInfo, t }) {
  if (!paymentInfo) return null;

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} đã được sao chép vào bộ nhớ tạm!`);
  };

  return (
    <div className="text-left rounded-xl bg-white/5 p-5 border border-white/5 space-y-3.5 mb-6 text-sm">
      {(paymentInfo.bankName || paymentInfo.bank) && (
        <div className="flex justify-between items-center">
          <span className="text-slate-400">
            {t("checkout:paymentDetails.bankName", "Ngân hàng")}:
          </span>
          <span className="font-semibold text-slate-200 uppercase">
            {paymentInfo.bankName || paymentInfo.bank}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-slate-400">
          {t("checkout:paymentDetails.accountNumber", "Số tài khoản")}:
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-slate-200">
            {paymentInfo.accountNumber}
          </span>
          <button
            onClick={() =>
              handleCopyText(
                paymentInfo.accountNumber,
                t("checkout:labels.accountNumber", "Số tài khoản"),
              )
            }
            className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer"
            title={t("checkout:actions.copy", "Sao chép")}
            type="button"
          >
            <img src={copyIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">
          {t("checkout:paymentDetails.accountName", "Chủ tài khoản")}:
        </span>
        <span className="font-semibold text-slate-200 uppercase">
          {paymentInfo.accountName}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">
          {t("checkout:paymentDetails.amount", "Số tiền")}:
        </span>
        <span className="font-semibold text-slate-200">
          {paymentInfo.amount
            ? `${paymentInfo.amount.toLocaleString("vi-VN")} VND`
            : ""}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">
          {t("checkout:paymentDetails.code", "Nội dung chuyển khoản")}:
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[#ecc741]">
            {paymentInfo.description || paymentInfo.transactionCode}
          </span>
          <button
            onClick={() =>
              handleCopyText(
                paymentInfo.description || paymentInfo.transactionCode,
                t("checkout:labels.description", "Nội dung chuyển khoản"),
              )
            }
            className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer"
            title={t("checkout:actions.copy", "Sao chép")}
            type="button"
          >
            <img src={copyIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentQRDetails;
