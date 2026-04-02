interface BenefitItemProps {
  number: string;
  title: string;
  description: string;
}

export default function BenefitItem({ number, title, description }: BenefitItemProps) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-12 h-12 bg-sce-orange text-white rounded-xl flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold text-sce-navy mb-1">{title}</h3>
        <p className="text-sce-gray leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
