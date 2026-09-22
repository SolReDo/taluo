'use client';

interface TarotCardBackProps {
  className?: string;
}

export default function TarotCardBack({ className = '' }: TarotCardBackProps) {
  return (
    <div className={`
      w-full h-full rounded-xl overflow-hidden border-2 border-[#6b4c9a]/50
      ${className}
    `}>
      <img
        src="/images/TAROT/CARD PACK.png"
        alt="Card Back"
        className="w-full h-full"
        style={{ objectFit: 'fill' }}
      />
    </div>
  );
}
