import { QRCodeSVG } from "qrcode.react";
import qrTopCorner from "../../../assets/qr-top-corner.svg";
import qrSidePanel from "../../../assets/qr-side-panel.svg";
import qrBottomCorner from "../../../assets/qr-bottom-corner.svg";
import qrBottomDecoration from "../../../assets/qr-bottom-decoration.svg";

function PaymentQRReceiptTemplate({ paymentInfo, t }) {
  if (!paymentInfo) return null;

  return (
    <div className="hidden">
      <div className="pointer-events-none absolute inset-2 rounded-[24px] border border-[#f6d878]/60" />
      <div className="pointer-events-none absolute inset-4 rounded-[20px] border border-[#f6d878]/25" />
      <div className="pointer-events-none absolute left-5 top-5 h-16 w-16 rounded-tl-[18px] border-l-2 border-t-2 border-[#f6d878]/80" />
      <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-tr-[18px] border-r-2 border-t-2 border-[#f6d878]/80" />
      <div className="pointer-events-none absolute bottom-5 left-5 h-16 w-16 rounded-bl-[18px] border-b-2 border-l-2 border-[#f6d878]/80" />
      <div className="pointer-events-none absolute bottom-5 right-5 h-16 w-16 rounded-br-[18px] border-b-2 border-r-2 border-[#f6d878]/80" />
      <div className="pointer-events-none absolute -left-12 top-28 h-44 w-44 rounded-full border border-[#f6d878]/20" />
      <div className="pointer-events-none absolute -right-12 top-28 h-44 w-44 rounded-full border border-[#f6d878]/20" />
      
      <img
        src={qrTopCorner}
        alt=""
        className="pointer-events-none absolute left-5 top-5 h-32 w-32"
      />
      <img
        src={qrTopCorner}
        alt=""
        className="pointer-events-none absolute right-5 top-5 h-32 w-32 scale-x-[-1]"
      />
      <div className="pointer-events-none absolute left-8 top-[178px] h-52 w-24 rounded-l-full border-y border-l border-[#dec47c]/55" />
      <div className="pointer-events-none absolute right-8 top-[178px] h-52 w-24 rounded-r-full border-y border-r border-[#dec47c]/55" />
      <img
        src={qrSidePanel}
        alt=""
        className="pointer-events-none absolute left-8 top-[180px] h-56 w-24"
      />
      <img
        src={qrSidePanel}
        alt=""
        className="pointer-events-none absolute right-8 top-[180px] h-56 w-24 scale-x-[-1]"
      />
      <img
        src={qrBottomCorner}
        alt=""
        className="pointer-events-none absolute bottom-7 left-7 h-28 w-32 scale-y-[-1]"
      />
      <img
        src={qrBottomCorner}
        alt=""
        className="pointer-events-none absolute bottom-7 right-7 h-28 w-32 scale-[-1]"
      />

      <div className="relative pb-3 pt-2 text-center">
        <div className="mx-auto mb-2 h-px w-44 bg-gradient-to-r from-transparent via-[#f6d878]/80 to-transparent" />
        <div className="font-serif text-[44px] font-black italic leading-none tracking-tight text-[#dfc173] drop-shadow-[0_4px_0_rgba(0,0,0,0.38)]">
          Viet<span className="not-italic text-slate-100">QR</span>
        </div>
        <div className="mx-auto mt-2 h-px w-52 bg-gradient-to-r from-transparent via-[#f6d878]/70 to-transparent" />
      </div>

      <div className="relative mx-auto mt-6 w-[82%] rounded-[32px] border-2 border-[#d7b763] bg-[#f8f6ef] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_18px_32px_rgba(0,0,0,0.38)]">
        {paymentInfo.qrCode ? (
          <QRCodeSVG
            value={paymentInfo.qrCode}
            size={260}
            level="H"
            includeMargin={false}
            className="mx-auto h-auto w-full max-w-[260px] bg-white"
          />
        ) : (
          <div className="mx-auto flex h-[260px] w-[260px] items-center justify-center bg-white text-sm text-slate-400">
            {t("checkout:qrcode.generating", "Đang tải mã QR...")}
          </div>
        )}
      </div>

      <img
        src={qrBottomDecoration}
        alt=""
        className="pointer-events-none relative -mt-3 mx-auto h-8 w-28"
      />

      <div className="relative mt-3 grid grid-cols-[1fr_auto_1fr] items-center px-16 pb-3">
        <div className="text-right">
          <p className="text-[34px] font-black italic leading-none tracking-tight text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
            napas
          </p>
        </div>
        <div className="mx-8 flex h-9 w-9 items-center justify-center text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
          <span className="text-4xl font-black leading-none">*</span>
        </div>
        <div className="text-left">
          <p className="text-[34px] font-black italic leading-none tracking-tight text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
            VISA
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-5 left-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#dec47c]/80 to-transparent" />
    </div>
  );
}

export default PaymentQRReceiptTemplate;
