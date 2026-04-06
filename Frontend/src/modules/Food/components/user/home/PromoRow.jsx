import React from 'react';
import discountPromoIcon from "@food/assets/category-icons/discount_promo.png";
import vegPromoIcon from "@food/assets/category-icons/veg_promo.png";
import pricePromoIcon from "@food/assets/category-icons/price_promo.png";

export default function PromoRow({ handleVegModeChange, navigate, isVegMode, toggleRef }) {
  const promoCardsData = [
    {
      id: 'offers',
      title: "MIN.",
      value: "40% off",
      icon: discountPromoIcon,
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-100 dark:border-rose-900/60",
      textColor: "text-rose-600 dark:text-rose-300",
    },
    {
      id: 'pure-veg',
      title: "PURE",
      value: "Veg",
      icon: vegPromoIcon,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-100 dark:border-emerald-900/60",
      textColor: "text-emerald-600 dark:text-emerald-300",
    },
    {
      id: 'under-250',
      title: "UNDER",
      value: "₹250",
      icon: pricePromoIcon,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-100 dark:border-amber-900/60",
      textColor: "text-amber-600 dark:text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 px-4 pt-3 pb-6 bg-white dark:bg-[#0a0a0a]">
      {promoCardsData.map((promo, idx) => (
        <div
          key={idx}
          ref={promo.id === 'pure-veg' ? toggleRef : null}
          className={`${promo.bgColor} ${promo.borderColor} rounded-[1.5rem] p-1 flex flex-col items-center h-[120px] shadow-sm border transition-all duration-300 cursor-pointer active:scale-95 group ${
            promo.id === 'pure-veg' && isVegMode ? 'ring-2 ring-emerald-500 bg-emerald-100 dark:bg-emerald-900/50' : ''
          }`}
          onClick={() => {
            if (promo.id === 'pure-veg') handleVegModeChange(!isVegMode);
            else if (promo.id === 'offers') navigate('/food/user/offers');
            else if (promo.id === 'under-250') navigate('/food/user/under-250');
          }}
        >
          <div className="py-2 px-1 flex flex-col items-center text-center">
            <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 tracking-[0.1em] uppercase leading-none mb-0.5">
              {promo.title}
            </span>
            <span className={`text-[10px] sm:text-[11px] font-black ${promo.textColor} leading-none truncate w-full px-0.5`}>
              {promo.value}
            </span>
          </div>

          <div className="flex-1 w-full bg-white/60 dark:bg-white/5 rounded-[1.2rem] flex items-center justify-center p-1.5 mt-auto mb-1 overflow-hidden relative">
            <img
              src={promo.icon}
              alt={promo.value}
              className="w-full h-full object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
